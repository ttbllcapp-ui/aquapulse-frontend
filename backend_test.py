"""
Backend tests focused on the NEW DELETE /api/auth/me endpoint
(Apple App Store account deletion requirement).

The seed script (/tmp/seed_family.py) creates 3 demo users joined in family
'Aydoğdu Ailesi' (code AQUA42) and prints their session tokens. This test
runner re-seeds at startup and then exercises:

  T1 — DELETE /api/auth/me without Authorization -> 401
  T2 — DELETE demo_zeynep (regular member) -> 200 + Mongo wipe
  T3 — DELETE demo_ayla (owner, members remain) -> ownership transferred
  T4 — DELETE demo_mehmet (solo owner) -> family entirely removed
  T5 — Re-using a just-deleted token -> 401
  T6 — Regression: /api/chat with context, /api/family/* auth gating,
        /api/chat/history (guest), CORS preflight still work.

All requests hit http://localhost:8001/api (internal supervisor port).
"""
import asyncio
import json
import os
import subprocess
import sys
import time
import uuid
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BASE = "http://localhost:8001/api"
SEED_SCRIPT = "/tmp/seed_family.py"

load_dotenv(Path("/app/backend/.env"))
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


# ---------- helpers ----------
PASSED = []
FAILED = []


def _ok(name, detail=""):
    PASSED.append(name)
    print(f"  PASS  {name}  {detail}")


def _fail(name, detail=""):
    FAILED.append((name, detail))
    print(f"  FAIL  {name}  {detail}")


def expect(name, cond, detail=""):
    if cond:
        _ok(name, detail)
    else:
        _fail(name, detail)


def seed() -> dict:
    """Run seed_family.py and parse out the 3 demo tokens."""
    out = subprocess.run(
        [sys.executable, SEED_SCRIPT],
        cwd="/app/backend",
        capture_output=True,
        text=True,
        check=True,
    )
    print(out.stdout.rstrip())
    tokens = {}
    for line in out.stdout.splitlines():
        if line.startswith("TOKEN "):
            _, rest = line.split("TOKEN ", 1)
            uid, tok = rest.split(" = ", 1)
            tokens[uid.strip()] = tok.strip()
    assert {"demo_ayla", "demo_mehmet", "demo_zeynep"} <= set(tokens.keys()), tokens
    return tokens


# ---------- tests ----------
async def main():
    print("=" * 70)
    print("Re-seeding demo family + users…")
    print("=" * 70)
    tokens = seed()

    mongo = AsyncIOMotorClient(MONGO_URL)
    db = mongo[DB_NAME]

    async with httpx.AsyncClient(base_url=BASE, timeout=30.0) as h:
        # ---------- T0: NEW /api/health warm-up endpoint ----------
        print("\n--- T0: GET /api/health (cold-start warm-up) ---")
        # Take median of 5 calls for stable timing
        latencies = []
        for i in range(5):
            t0 = time.time()
            r = await h.get("/health")
            dt_ms = (time.time() - t0) * 1000
            latencies.append(dt_ms)
            if i == 0:
                expect("T0.health status==200", r.status_code == 200, f"got {r.status_code}")
                try:
                    body = r.json()
                    expect(
                        "T0.health body=={ok:true}",
                        body == {"ok": True},
                        f"body={body}",
                    )
                except Exception as e:
                    _fail("T0.health json parse", str(e))
        med_ms = sorted(latencies)[len(latencies) // 2]
        max_ms = max(latencies)
        print(f"     /api/health latencies (ms) = {[round(x,1) for x in latencies]}  median={med_ms:.1f}  max={max_ms:.1f}")
        expect(
            "T0.health median latency <200ms",
            med_ms < 200,
            f"median={med_ms:.1f}ms max={max_ms:.1f}ms",
        )

        # T0b: CORS preflight on /api/health
        r = await h.options(
            "/health",
            headers={
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        expect(
            "T0.health CORS preflight ok",
            r.status_code in (200, 204) and r.headers.get("access-control-allow-origin") == "*",
            f"status={r.status_code} acao={r.headers.get('access-control-allow-origin')}",
        )

        # T0c: GET /api/ still returns the legacy warm-up body
        r = await h.get("/")
        expect(
            "T0.GET /api/ legacy status==200",
            r.status_code == 200,
            f"got {r.status_code}",
        )
        if r.status_code == 200:
            body = r.json()
            expect(
                "T0.GET /api/ body matches",
                body.get("message") == "AquaPulse API" and body.get("status") == "ok",
                f"body={body}",
            )

        # ---------- T0d: POST /api/auth/apple regression ----------
        print("\n--- T0d: POST /api/auth/apple (Apple App Review critical) ---")
        # No body -> 422
        r = await h.post("/auth/apple")
        expect(
            "T0d.apple no body -> 422",
            r.status_code == 422,
            f"got {r.status_code} body={r.text[:200]}",
        )

        # Fake JWT -> 401 promptly
        t0 = time.time()
        r = await h.post("/auth/apple", json={"identity_token": "fake.jwt.token"})
        dt_apple = time.time() - t0
        expect(
            "T0d.apple fake jwt -> 401",
            r.status_code == 401,
            f"got {r.status_code} body={r.text[:200]}",
        )
        expect(
            "T0d.apple fake jwt has error detail",
            "detail" in (r.json() if r.status_code == 401 else {}) and bool((r.json() if r.status_code == 401 else {}).get("detail")),
            f"body={r.text[:200]}",
        )
        expect(
            "T0d.apple fake jwt responds in <5s",
            dt_apple < 5.0,
            f"dt={dt_apple:.2f}s",
        )
        print(f"     /api/auth/apple (fake jwt) latency = {dt_apple*1000:.1f}ms")

        # Also: POST /api/auth/google with fake session -> 401 (not 500)
        r = await h.post("/auth/google", json={"session_id": "fake_sid"})
        expect(
            "T0d.google fake sid -> 401",
            r.status_code == 401,
            f"got {r.status_code} body={r.text[:200]}",
        )

        # ---------- T1: 401 without auth ----------
        print("\n--- T1: DELETE /api/auth/me without Authorization ---")
        r = await h.delete("/auth/me")
        expect("T1.status==401", r.status_code == 401, f"got {r.status_code}")
        try:
            body = r.json()
            expect(
                "T1.detail mentions sign-in",
                "sign in" in str(body.get("detail", "")).lower(),
                f"body={body}",
            )
        except Exception as e:
            _fail("T1.json parse", str(e))

        # Also try a fake bearer (should be treated as not-authenticated)
        r = await h.delete(
            "/auth/me",
            headers={"Authorization": "Bearer totally-fake-not-real"},
        )
        expect("T1.fake_bearer==401", r.status_code == 401, f"got {r.status_code}")

        # ---------- T2: delete demo_zeynep (member) ----------
        print("\n--- T2: DELETE demo_zeynep with valid Bearer ---")
        ztok = tokens["demo_zeynep"]
        r = await h.delete(
            "/auth/me",
            headers={"Authorization": f"Bearer {ztok}"},
        )
        expect("T2.status==200", r.status_code == 200, f"got {r.status_code} body={r.text[:200]}")
        try:
            body = r.json()
            expect("T2.ok==True", body.get("ok") is True, f"body={body}")
            expect(
                "T2.deleted_user_id==demo_zeynep",
                body.get("deleted_user_id") == "demo_zeynep",
                f"body={body}",
            )
        except Exception as e:
            _fail("T2.json parse", str(e))

        # Mongo wipe checks
        u = await db.users.find_one({"user_id": "demo_zeynep"})
        expect("T2.users wiped", u is None, f"found={u}")
        s = await db.user_sessions.find_one({"user_id": "demo_zeynep"})
        expect("T2.user_sessions wiped", s is None, f"found={s}")
        p = await db.family_progress.find_one({"user_id": "demo_zeynep"})
        expect("T2.family_progress wiped", p is None, f"found={p}")
        cm = await db.chat_messages.find_one({"session_key": "user:demo_zeynep"})
        expect("T2.chat_messages wiped", cm is None, f"found={cm}")
        fam = await db.families.find_one({"code": "AQUA42"})
        expect("T2.family still exists", fam is not None)
        if fam:
            expect(
                "T2.demo_zeynep removed from members",
                "demo_zeynep" not in fam.get("members", []),
                f"members={fam.get('members')}",
            )
            expect(
                "T2.owner unchanged (demo_ayla)",
                fam.get("owner_id") == "demo_ayla",
                f"owner_id={fam.get('owner_id')}",
            )

        # ---------- T5a: Re-use deleted token -> 401 ----------
        print("\n--- T5a: re-use demo_zeynep token after deletion ---")
        r = await h.delete(
            "/auth/me",
            headers={"Authorization": f"Bearer {ztok}"},
        )
        expect("T5a.status==401", r.status_code == 401, f"got {r.status_code} body={r.text[:200]}")

        # Also confirm GET /api/auth/me with that token is 401
        r = await h.get("/auth/me", headers={"Authorization": f"Bearer {ztok}"})
        expect("T5a.GET /auth/me==401", r.status_code == 401, f"got {r.status_code}")

        # ---------- T3: delete demo_ayla (owner, members remain) ----------
        print("\n--- T3: DELETE demo_ayla (owner; demo_mehmet should inherit) ---")
        atok = tokens["demo_ayla"]
        r = await h.delete(
            "/auth/me",
            headers={"Authorization": f"Bearer {atok}"},
        )
        expect("T3.status==200", r.status_code == 200, f"got {r.status_code} body={r.text[:200]}")
        try:
            body = r.json()
            expect(
                "T3.deleted_user_id==demo_ayla",
                body.get("deleted_user_id") == "demo_ayla",
                f"body={body}",
            )
        except Exception as e:
            _fail("T3.json parse", str(e))

        u = await db.users.find_one({"user_id": "demo_ayla"})
        expect("T3.users wiped", u is None, f"found={u}")
        s = await db.user_sessions.find_one({"user_id": "demo_ayla"})
        expect("T3.user_sessions wiped", s is None, f"found={s}")
        p = await db.family_progress.find_one({"user_id": "demo_ayla"})
        expect("T3.family_progress wiped", p is None, f"found={p}")

        fam = await db.families.find_one({"code": "AQUA42"})
        expect("T3.family still exists", fam is not None)
        if fam:
            members = fam.get("members", [])
            expect(
                "T3.demo_ayla removed from members",
                "demo_ayla" not in members,
                f"members={members}",
            )
            expect(
                "T3.demo_mehmet still in members",
                "demo_mehmet" in members,
                f"members={members}",
            )
            expect(
                "T3.owner transferred to demo_mehmet",
                fam.get("owner_id") == "demo_mehmet",
                f"owner_id={fam.get('owner_id')}",
            )

        # ---------- T4: delete demo_mehmet (solo owner) ----------
        print("\n--- T4: DELETE demo_mehmet (solo owner; family should be deleted) ---")
        mtok = tokens["demo_mehmet"]
        r = await h.delete(
            "/auth/me",
            headers={"Authorization": f"Bearer {mtok}"},
        )
        expect("T4.status==200", r.status_code == 200, f"got {r.status_code} body={r.text[:200]}")

        u = await db.users.find_one({"user_id": "demo_mehmet"})
        expect("T4.users wiped", u is None, f"found={u}")
        s = await db.user_sessions.find_one({"user_id": "demo_mehmet"})
        expect("T4.user_sessions wiped", s is None, f"found={s}")
        p = await db.family_progress.find_one({"user_id": "demo_mehmet"})
        expect("T4.family_progress wiped", p is None, f"found={p}")
        fam = await db.families.find_one({"code": "AQUA42"})
        expect("T4.family entirely deleted", fam is None, f"found={fam}")

        # ---------- T6: regressions ----------
        print("\n--- T6: regressions (chat with context, family auth gating, history, CORS) ---")

        # 6a — POST /api/chat with context (guest)
        gid = f"regress-guest-{uuid.uuid4().hex[:8]}"
        payload = {
            "message": "Bugün 2500 ml hedefimden 800 ml içtim, ne yapmalıyım?",
            "language": "tr",
            "context": {
                "weight_kg": 75, "height_cm": 180, "age": 30, "gender": "male",
                "daily_goal_ml": 2500, "hydration_today_ml": 800, "percent": 32,
                "streak_days": 5, "country": "TR",
            },
        }
        t0 = time.time()
        r = await h.post("/chat", json=payload, headers={"X-Guest-Id": gid})
        dt = time.time() - t0
        expect("T6.chat status==200", r.status_code == 200, f"got {r.status_code} body={r.text[:200]}")
        if r.status_code == 200:
            body = r.json()
            expect("T6.chat has reply", bool(body.get("reply")), f"len={len(body.get('reply',''))}")
            expect("T6.chat has message_id", bool(body.get("message_id")), f"mid={body.get('message_id')}")
            print(f"     chat dt={dt:.1f}s reply preview: {body.get('reply','')[:120]}...")

        # 6b — Chat history persists then DELETE clears
        r = await h.get("/chat/history", headers={"X-Guest-Id": gid})
        expect("T6.history status==200", r.status_code == 200)
        if r.status_code == 200:
            msgs = r.json().get("messages", [])
            expect(
                "T6.history has >=2 msgs (user+assistant)",
                len(msgs) >= 2,
                f"len={len(msgs)}",
            )
            roles = {m.get("role") for m in msgs}
            expect("T6.history roles include user+assistant", roles >= {"user", "assistant"}, f"roles={roles}")
        r = await h.delete("/chat/history", headers={"X-Guest-Id": gid})
        expect("T6.history DELETE status==200", r.status_code == 200)
        r = await h.get("/chat/history", headers={"X-Guest-Id": gid})
        expect(
            "T6.history cleared",
            r.status_code == 200 and r.json().get("messages") == [],
            f"body={r.text[:200]}",
        )

        # 6c — Family endpoints still auth-gated
        r = await h.post("/family/create", json={"name": "Test Family"})
        expect("T6.family/create 401", r.status_code == 401, f"got {r.status_code}")
        r = await h.post("/family/join", json={"code": "ABCDEF"})
        expect("T6.family/join 401", r.status_code == 401, f"got {r.status_code}")
        r = await h.get("/family/me")
        expect("T6.family/me 401", r.status_code == 401, f"got {r.status_code}")
        r = await h.post(
            "/family/progress",
            json={"daily_goal_ml": 2500, "hydration_today_ml": 1000, "percent": 40, "streak_days": 3},
        )
        expect("T6.family/progress 401", r.status_code == 401, f"got {r.status_code}")
        r = await h.post("/family/leave")
        expect("T6.family/leave 401", r.status_code == 401, f"got {r.status_code}")

        # 6d — CORS preflight on DELETE /api/auth/me
        r = await h.options(
            "/auth/me",
            headers={
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "DELETE",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
        expect(
            "T6.CORS preflight ok",
            r.status_code in (200, 204) and r.headers.get("access-control-allow-origin") == "*",
            f"status={r.status_code} headers={dict(r.headers)}",
        )

        # 6e — Root API still ok
        r = await h.get("/")
        expect(
            "T6.GET /api/ status==200",
            r.status_code == 200 and r.json().get("status") == "ok",
            f"body={r.text[:200]}",
        )

    mongo.close()

    print("\n" + "=" * 70)
    print(f"PASSED: {len(PASSED)}   FAILED: {len(FAILED)}")
    if FAILED:
        print("\nFAILURES:")
        for n, d in FAILED:
            print(f"  - {n}: {d}")
    print("=" * 70)
    sys.exit(0 if not FAILED else 1)


if __name__ == "__main__":
    asyncio.run(main())
