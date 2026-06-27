#!/usr/bin/env python3
"""One-shot translation filler for AquaPulse i18n-extra.ts using Emergent LLM key.
Reads EN dict from i18n.ts as source of truth, fills any missing keys in 16 other langs.
"""
import os, re, json, asyncio, sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path('/app/frontend/src')
load_dotenv('/app/backend/.env')

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

# Extract dict objects from a TS file given the variable name
def extract_dict(content: str, var_name: str) -> dict:
    """Naive parser - extracts a TS object literal as JSON-ish dict."""
    m = re.search(rf"(?:const\s+{var_name}\s*:\s*Dict\s*=\s*)(\{{[^;]*?\n\}});", content, re.DOTALL)
    if not m:
        return None
    body = m.group(1)
    # Convert TS to JSON: keys "ident:" -> "ident":  ; single quotes -> escape carefully
    # Use a JS-style parser: replace single-quoted strings with double-quoted, escaping
    out = {}
    # Find lines like: key: 'value', or key: "value",
    for line in re.finditer(r"(\w+)\s*:\s*(['\"])((?:\\.|(?!\2).)*)\2", body):
        key, _quote, value = line.group(1), line.group(2), line.group(3)
        # Unescape
        value = value.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
        out[key] = value
    return out

# Translate missing keys for one language using Emergent LLM
async def translate_missing(lang_code: str, lang_name: str, en_dict: dict, existing: dict):
    missing = {k: v for k, v in en_dict.items() if k not in existing}
    if not missing:
        return existing
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"i18n-{lang_code}",
        system_message=(
            f"You are a professional mobile-app translator. Translate from English to {lang_name}. "
            "Preserve placeholders like {goal}, {ml}, %d, etc. Keep brand names (AquaPulse, AquaCoach) untouched. "
            "Keep emojis. Output ONLY a valid JSON object mapping key to translated string. No prose, no markdown fences."
        ),
    ).with_model("openai", "gpt-4.1-mini")

    # Batch in chunks of 25 keys to avoid token limits
    keys_list = list(missing.keys())
    out = dict(existing)
    for i in range(0, len(keys_list), 25):
        chunk_keys = keys_list[i:i+25]
        payload = {k: missing[k] for k in chunk_keys}
        user_msg = (
            f"Translate the values of this JSON to {lang_name}. Return ONLY the JSON object (same keys):\n"
            f"{json.dumps(payload, ensure_ascii=False)}"
        )
        try:
            reply = await chat.send_message(UserMessage(text=user_msg))
            reply = reply.strip()
            # Strip markdown fences
            if reply.startswith('```'):
                reply = re.sub(r'^```(?:json)?\s*', '', reply)
                reply = re.sub(r'\s*```$', '', reply)
            translated = json.loads(reply)
            for k, v in translated.items():
                if isinstance(v, str):
                    out[k] = v
            print(f"  {lang_code}: filled {len(translated)} keys (chunk {i//25 + 1})")
        except Exception as e:
            print(f"  {lang_code} chunk {i} ERROR: {e}")
    return out


def serialize_dict_ts(name: str, d: dict) -> str:
    """Output as TypeScript object literal."""
    lines = [f"const {name}: Partial<Dict> = {{"]
    for k, v in d.items():
        # Escape: use double quotes for value, escape internal " and \
        v_esc = v.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
        lines.append(f'  {k}: "{v_esc}",')
    lines.append("};")
    return "\n".join(lines)


LANG_NAMES = {
    'de': 'German', 'fr': 'French', 'es': 'Spanish', 'it': 'Italian',
    'ar': 'Arabic', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean',
    'zh': 'Simplified Chinese', 'hi': 'Hindi', 'pt': 'Portuguese (Brazil)',
    'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish', 'id': 'Indonesian', 'vi': 'Vietnamese',
}


async def main():
    i18n_ts = (ROOT / 'i18n.ts').read_text(encoding='utf-8')
    en_dict = extract_dict(i18n_ts, 'en')
    tr_dict = extract_dict(i18n_ts, 'tr')
    if not en_dict:
        print("Could not extract EN dict from i18n.ts")
        sys.exit(1)
    print(f"EN dict has {len(en_dict)} keys")
    # Read existing extras
    extras_path = ROOT / 'i18n-extra.ts'
    extras_content = extras_path.read_text(encoding='utf-8')
    
    new_dicts = {}
    for code, name in LANG_NAMES.items():
        existing = extract_dict(extras_content, code) or {}
        print(f"{code} ({name}): {len(existing)}/{len(en_dict)} keys present")
        new_dicts[code] = await translate_missing(code, name, en_dict, existing)
        print(f"{code} ({name}): now {len(new_dicts[code])} keys")
        # Persist progress after each lang
        await persist(extras_path, new_dicts)
    print("Done.")


async def persist(extras_path: Path, new_dicts: dict):
    """Write the new i18n-extra.ts file with all 16 dicts and EXTRA_DICTS export."""
    parts = [
        "// AUTO-GENERATED: do not edit by hand; run scripts/fill_translations.py",
        "import type { Dict } from './i18n';",
        "",
    ]
    for code, d in new_dicts.items():
        parts.append(serialize_dict_ts(code, d))
        parts.append("")
    keys_csv = ", ".join(new_dicts.keys())
    parts.append(f"export const EXTRA_DICTS: Record<string, Partial<Dict>> = {{ {keys_csv} }};")
    parts.append("")
    extras_path.write_text("\n".join(parts), encoding='utf-8')


if __name__ == '__main__':
    asyncio.run(main())
