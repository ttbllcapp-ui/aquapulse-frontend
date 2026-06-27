"""
Capture 3 fresh raw screenshots from running expo web app at 1290×2796 in EN locale.
- Home (/(tabs)/home)
- AI Coach (/(tabs)/aichat)
- Body Map (/body-map)
"""
import asyncio
import json
import os
import time
from playwright.async_api import async_playwright

URL = "http://localhost:3000"
OUT_DIR = "/app/store-listing/screenshots/raw_en_fresh"
os.makedirs(OUT_DIR, exist_ok=True)

# Pre-populated AppState (English, onboarded, sample entries & streak)
import datetime as dt
today = dt.date.today()
def iso(d): return d.isoformat()

# Sample drink entries for today (mix of drinks)
def ts(hours, minutes=0):
    t = dt.datetime.combine(today, dt.time(hours, minutes))
    return int(t.timestamp() * 1000)

entries = [
    {"id": "e1", "amount": 250, "hydration": 250, "type": "water", "timestamp": ts(8, 15)},
    {"id": "e2", "amount": 300, "hydration": 240, "type": "coffee", "timestamp": ts(9, 30)},
    {"id": "e3", "amount": 500, "hydration": 500, "type": "water", "timestamp": ts(11, 45)},
    {"id": "e4", "amount": 200, "hydration": 180, "type": "tea", "timestamp": ts(13, 20)},
    {"id": "e5", "amount": 250, "hydration": 250, "type": "water", "timestamp": ts(15, 0)},
]

# Streak: last 12 days
streak = [(today - dt.timedelta(days=i)).isoformat() for i in range(12)]

app_state = {
    "settings": {
        "weightKg": 70,
        "heightCm": 175,
        "ageYears": 28,
        "gender": "other",
        "dailyGoalMl": 2500,
        "wakeTime": "07:00",
        "sleepTime": "23:00",
        "reminderIntervalMin": 90,
        "remindersEnabled": True,
        "unit": "ml",
        "onboarded": True,
        "language": "en",
        "themeId": "ocean",
        "countryCode": "US",
        "adaptiveGoalEnabled": True,
        "soundEnabled": True,
        "name": "Alex",
    },
    "entries": entries,
    "customCups": [
        {"id": "c1", "name": "Glass", "nameKey": "cup_glass", "amount": 250, "type": "water", "icon": "GlassWater"},
        {"id": "c2", "name": "Bottle", "nameKey": "cup_bottle", "amount": 500, "type": "water", "icon": "Milk"},
        {"id": "c3", "name": "Large Bottle", "nameKey": "cup_large_bottle", "amount": 750, "type": "water", "icon": "Milk"},
        {"id": "c4", "name": "Tea", "nameKey": "cup_tea", "amount": 200, "type": "tea", "icon": "CupSoda"},
        {"id": "c5", "name": "Coffee", "nameKey": "cup_coffee", "amount": 180, "type": "coffee", "icon": "Coffee"},
    ],
    "streakDays": streak,
    "achievements": ["first_drop", "goal_met", "streak_3", "streak_7"],
    "goalHistory": [],
}

# Sample chat history for AI Coach screen
chat_history = [
    {"role": "user", "content": "How much water should I drink before workout?"},
    {"role": "assistant", "content": "Great question, Alex! Based on your 70kg weight and 2.5L daily goal, drink 400-500ml about 1-2 hours before workout, then 200ml every 15-20 minutes during exercise. Your hydration looks solid — you're already 60% to today's goal. Keep it up! 💪"},
    {"role": "user", "content": "What about coffee — does it count?"},
    {"role": "assistant", "content": "Coffee is mildly diuretic but for daily counts it still hydrates you. I track it at ~80% the value of water. Your morning coffee (300ml) counts as ~240ml toward your goal. Just don't make it your primary fluid source ☕"},
]


async def capture(page, route, out_name, wait_ms=2500):
    await page.goto(f"{URL}{route}", wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(wait_ms)
    out = os.path.join(OUT_DIR, out_name)
    await page.screenshot(path=out, type="png", full_page=False, omit_background=False)
    print(f"✓ {route} → {out}")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"],
        )
        ctx = await browser.new_context(
            viewport={"width": 1290, "height": 2796},
            device_scale_factor=1,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1",
        )
        page = await ctx.new_page()

        # First load to establish origin so we can set localStorage
        await page.goto(URL, wait_until="domcontentloaded", timeout=30000)
        await page.evaluate(
            """({stateStr, chatStr}) => {
              localStorage.setItem('aqualife_state_v2', stateStr);
              localStorage.setItem('aquapulse_chat_history_v1', chatStr);
            }""",
            {"stateStr": json.dumps(app_state), "chatStr": json.dumps(chat_history)},
        )
        await page.wait_for_timeout(800)

        # Now visit each target route
        await capture(page, "/(tabs)/home", "01_home_en.png", wait_ms=4000)
        await capture(page, "/(tabs)/aichat", "02_coach_en.png", wait_ms=3500)
        await capture(page, "/body-map", "05_body_map_en.png", wait_ms=3500)

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
