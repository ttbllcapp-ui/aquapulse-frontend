"""
AquaPulse - Final Screenshot Generator with text corrections
Fixes:
  - aqua3: 'leep' -> 'Sleep' (cut-off S)
  - aqua5: 'Undock' -> 'Unlock'
  - aqua1: Replace medical-claim quote with safe non-medical motivational text
  - aqua2: Replace medical-claim quote with safe non-medical motivational text
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC_DIR = "/app/screenshots_v2/src"
OUT_IPHONE = "/app/screenshots_v2/iphone_6_5"
OUT_IPAD = "/app/screenshots_v2/ipad_13"

os.makedirs(OUT_IPHONE, exist_ok=True)
os.makedirs(OUT_IPAD, exist_ok=True)

IPHONE = (1242, 2688)
IPAD = (2064, 2752)

# ---------- Font helpers ----------
FONT_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_ITALIC = "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


# ---------- aqua3: "leep" -> "Sleep" ----------
def fix_aqua3_sleep(img: Image.Image) -> Image.Image:
    draw = ImageDraw.Draw(img)
    sample = img.getpixel((520, 1310))
    if sample[0] < 220:
        sample = (255, 255, 255)
    label_box = (468, 1335, 580, 1385)
    draw.rectangle(label_box, fill=sample)
    f = font(FONT_REG, 26)
    draw.text((478, 1342), "Sleep", fill=(45, 55, 75), font=f)
    return img


# ---------- aqua5: "Undock the ocean" -> "Unlock the ocean" ----------
def fix_aqua5_undock(img: Image.Image) -> Image.Image:
    draw = ImageDraw.Draw(img)
    # Paint over the "Undock the ocean" subtitle region with matching dark blue bg
    dark_bg = (1, 16, 42)
    # Rectangle B at (140, 1040, 380, 1080) was close; AI suggested ~10px down+right
    # Use a slightly larger safety rectangle
    rect = (148, 1048, 395, 1098)
    draw.rectangle(rect, fill=dark_bg)
    
    # Write "Unlock" in same size/style as other subtitles
    # The original style has small white sans-serif
    f = font(FONT_REG, 22)
    draw.text((152, 1052), "Unlock", fill=(220, 230, 240), font=f)
    # Second line "the ocean" - might already be on next line in original
    # Original appears to be 2 lines: "Undock" / "the ocean"
    # Let me write "the ocean" below
    draw.text((152, 1076), "the ocean", fill=(220, 230, 240), font=f)
    return img


# ---------- aqua1: Replace medical claim quote ----------
def fix_aqua1_quote(img: Image.Image) -> Image.Image:
    """The dark rounded quote card with 99 icon. 
    AGGRESSIVE V2: paint entire card content area to fully erase original medical text."""
    draw = ImageDraw.Draw(img)
    # Cover the entire inside of the dark card
    dark_card_bg = (4, 20, 52)
    text_rect = (440, 1095, 820, 1245)
    draw.rectangle(text_rect, fill=dark_card_bg)
    
    # Redraw the "99" quote-icon on the left side in light blue
    f_icon = font(FONT_BOLD, 32)
    draw.text((460, 1145), "99", fill=(110, 170, 240), font=f_icon)
    
    # Redraw the ">" arrow on the far right
    f_arrow = font(FONT_BOLD, 28)
    draw.text((786, 1158), ">", fill=(110, 170, 240), font=f_arrow)
    
    # Write replacement non-medical text - 2 lines, italic feel like original
    f = font(FONT_ITALIC, 22)
    line1 = "Stay on track, stay refreshed —"
    line2 = "your hydration, your rhythm."
    draw.text((516, 1140), line1, fill=(225, 232, 245), font=f)
    draw.text((516, 1180), line2, fill=(225, 232, 245), font=f)
    return img


# ---------- aqua2: Replace medical claim quote ----------
def fix_aqua2_quote(img: Image.Image) -> Image.Image:
    """The white quote card at top of phone with double-quote icon. 
    AGGRESSIVE V2: paint ENTIRE card including icon area, then redraw both icon and text."""
    draw = ImageDraw.Draw(img)
    # Cover the entire card region with white
    white_bg = (255, 255, 255)
    text_rect = (455, 540, 846, 760)
    draw.rectangle(text_rect, fill=white_bg)
    
    # Redraw a clean quote icon on the left (big blue serif " )
    f_icon = font(FONT_BOLD, 80)
    draw.text((475, 540), '"', fill=(80, 145, 240), font=f_icon)
    
    # Write replacement non-medical text (3 lines)
    f = font(FONT_ITALIC, 22)
    line1 = "Make hydration a habit —"
    line2 = "small sips, all day long."
    line3 = "Your day, your pace."
    draw.text((570, 600), line1, fill=(40, 55, 90), font=f)
    draw.text((570, 640), line2, fill=(40, 55, 90), font=f)
    draw.text((570, 685), line3, fill=(40, 55, 90), font=f)
    return img


# ---------- Resizers ----------
def make_iphone(src_path: str, out_path: str, fix_fn=None):
    img = Image.open(src_path).convert("RGB")
    if fix_fn is not None:
        img = fix_fn(img)
    img_resized = img.resize(IPHONE, Image.LANCZOS)
    img_resized.save(out_path, "PNG", optimize=True)


def make_ipad(src_path: str, out_path: str, fix_fn=None):
    img = Image.open(src_path).convert("RGB")
    if fix_fn is not None:
        img = fix_fn(img)
    target_h = IPAD[1]
    scale = target_h / img.height
    new_w = int(img.width * scale)
    img_scaled = img.resize((new_w, target_h), Image.LANCZOS)
    canvas = Image.new("RGB", IPAD, (0, 0, 0))
    side_pad = (IPAD[0] - new_w) // 2
    left_strip = img.crop((0, 0, 80, img.height)).resize(
        (side_pad, target_h), Image.LANCZOS
    ).filter(ImageFilter.GaussianBlur(40))
    right_strip = img.crop((img.width - 80, 0, img.width, img.height)).resize(
        (side_pad, target_h), Image.LANCZOS
    ).filter(ImageFilter.GaussianBlur(40))
    canvas.paste(left_strip, (0, 0))
    canvas.paste(right_strip, (IPAD[0] - side_pad, 0))
    canvas.paste(img_scaled, (side_pad, 0))
    canvas.save(out_path, "PNG", optimize=True)


# ---------- Main ----------
fix_map = {
    "aqua1.png": fix_aqua1_quote,
    "aqua2.png": fix_aqua2_quote,
    "aqua3.png": fix_aqua3_sleep,
    "aqua5.png": fix_aqua5_undock,
}

for i in range(1, 6):
    fn = f"aqua{i}.png"
    src = os.path.join(SRC_DIR, fn)
    fix_fn = fix_map.get(fn)
    make_iphone(src, os.path.join(OUT_IPHONE, fn), fix_fn)
    make_ipad(src, os.path.join(OUT_IPAD, fn), fix_fn)
    print(f"OK: {fn}")

# Also save fixed sources (for review)
PREVIEW_DIR = "/app/screenshots_v2/fixed_source"
os.makedirs(PREVIEW_DIR, exist_ok=True)
for i in range(1, 6):
    fn = f"aqua{i}.png"
    src = os.path.join(SRC_DIR, fn)
    img = Image.open(src).convert("RGB")
    if fn in fix_map:
        img = fix_map[fn](img)
    img.save(os.path.join(PREVIEW_DIR, fn), "PNG")

print("\nAll done.")
