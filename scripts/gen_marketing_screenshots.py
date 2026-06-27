"""
AquaPulse — App Store Marketing Screenshot Generator · v2 (PREMIUM)
Inspired by Headspace, Calm, MyFitnessPal screenshot composition:
  - Phone mockup dominates ~76% of canvas width / ~78% of height
  - Tight title block at top with cyan glow + accent line
  - Soft multi-layer drop shadow under phone, ambient cyan halo
  - No heavy "brand strip" — Apple Connect shows app name anyway
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

# ---------- Canvas ----------
W, H = 1290, 2796
FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG  = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

RAW_EN_DIR = "/app/store-listing/screenshots/raw_en_fresh"
RAW_TR_DIR = "/app/store-listing/screenshots/appstore"

OUT_DIR = "/app/store-listing/screenshots/marketing"
os.makedirs(f"{OUT_DIR}/en", exist_ok=True)
os.makedirs(f"{OUT_DIR}/tr", exist_ok=True)

# EN raw files captured fresh (English locale)
EN_FILE_MAP = {
    "01_home.png": "01_home_en.png",
    "03_coach.png": "02_coach_en.png",
    "02_body_map.png": "05_body_map_en.png",
}

# ---------- Palette ----------
COL_BG_TOP     = (10, 18, 48)
COL_BG_MID     = (6, 12, 30)
COL_BG_BOT     = (0, 4, 12)
COL_GLOW_CYAN  = (6, 182, 212)
COL_GLOW_BLUE  = (59, 130, 246)
COL_TITLE      = (255, 255, 255)
COL_SUBTITLE   = (170, 220, 245)
COL_ACCENT     = (34, 211, 238)


# ---------- Background ----------
def make_background() -> Image.Image:
    """Rich dark navy gradient with two cyan halos and subtle vignette."""
    bg = Image.new("RGB", (W, H), COL_BG_BOT)
    px = bg.load()
    # smooth 3-stop vertical gradient
    for y in range(H):
        t = y / H
        if t < 0.45:
            k = t / 0.45
            r = int(COL_BG_TOP[0] * (1 - k) + COL_BG_MID[0] * k)
            g = int(COL_BG_TOP[1] * (1 - k) + COL_BG_MID[1] * k)
            b = int(COL_BG_TOP[2] * (1 - k) + COL_BG_MID[2] * k)
        else:
            k = (t - 0.45) / 0.55
            r = int(COL_BG_MID[0] * (1 - k) + COL_BG_BOT[0] * k)
            g = int(COL_BG_MID[1] * (1 - k) + COL_BG_BOT[1] * k)
            b = int(COL_BG_MID[2] * (1 - k) + COL_BG_BOT[2] * k)
        for x in range(W):
            px[x, y] = (r, g, b)

    # main cyan halo behind phone (centered, large, soft)
    halo = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(halo)
    cx, cy = W // 2, 1500
    for radius, alpha in [(1100, 35), (820, 60), (560, 95), (340, 140), (190, 200)]:
        c = (COL_GLOW_CYAN[0] * alpha // 255, COL_GLOW_CYAN[1] * alpha // 255, COL_GLOW_CYAN[2] * alpha // 255)
        d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=c)
    halo = halo.filter(ImageFilter.GaussianBlur(220))
    halo = Image.eval(halo, lambda v: min(255, int(v * 1.8)))
    bg = ImageChops.add(bg, halo)

    # secondary blue glow top-right
    halo2 = Image.new("RGB", (W, H), (0, 0, 0))
    d2 = ImageDraw.Draw(halo2)
    cx2, cy2 = int(W * 0.85), int(H * 0.12)
    for radius, alpha in [(580, 40), (380, 80), (220, 130)]:
        c = (COL_GLOW_BLUE[0] * alpha // 255, COL_GLOW_BLUE[1] * alpha // 255, COL_GLOW_BLUE[2] * alpha // 255)
        d2.ellipse((cx2 - radius, cy2 - radius, cx2 + radius, cy2 + radius), fill=c)
    halo2 = halo2.filter(ImageFilter.GaussianBlur(160))
    halo2 = Image.eval(halo2, lambda v: min(255, int(v * 1.4)))
    bg = ImageChops.add(bg, halo2)

    # subtle dark vignette at bottom corners
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse((-400, H - 400, 600, H + 400), fill=80)
    vd.ellipse((W - 600, H - 400, W + 400, H + 400), fill=80)
    vig = vig.filter(ImageFilter.GaussianBlur(220))
    bg_arr = bg.copy()
    bg_arr.paste((0, 0, 8), mask=vig)
    bg = Image.blend(bg, bg_arr, 0.5)

    return bg


# ---------- Phone Mockup ----------
def make_phone(inner: Image.Image, width: int = 1000) -> Image.Image:
    """
    Premium iPhone mockup:
      - thin 16px black bezel
      - 60×270 dynamic island
      - rounded 110/92 corners
      - subtle top highlight reflection
    Returns RGBA image.
    """
    aspect = 2796 / 1290
    w = width
    h = int(w * aspect)
    bezel = 16
    outer_radius = 108
    inner_radius = 88

    body = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    # outer bezel
    bd.rounded_rectangle((0, 0, w, h), radius=outer_radius, fill=(14, 16, 26, 255))
    # subtle outer rim highlight (1px lighter ring)
    bd.rounded_rectangle((1, 1, w - 1, h - 1), radius=outer_radius - 1,
                         outline=(70, 85, 110, 180), width=2)

    # inner screen
    inner_w = w - 2 * bezel
    inner_h = h - 2 * bezel
    screen = inner.convert("RGB").resize((inner_w, inner_h), Image.LANCZOS)
    mask = Image.new("L", (inner_w, inner_h), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, inner_w, inner_h), radius=inner_radius, fill=255)
    body.paste(screen, (bezel, bezel), mask)

    # dynamic island
    di_w, di_h = int(w * 0.27), int(w * 0.06)
    di_x = (w - di_w) // 2
    di_y = bezel + 26
    di_draw = ImageDraw.Draw(body)
    di_draw.rounded_rectangle((di_x, di_y, di_x + di_w, di_y + di_h),
                              radius=di_h // 2, fill=(0, 0, 0, 255))

    # glossy top highlight (very subtle white gradient sheen at top edge of screen)
    sheen = Image.new("RGBA", (inner_w, 80), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen)
    for yy in range(80):
        a = int(25 * (1 - yy / 80))
        sd.line([(0, yy), (inner_w, yy)], fill=(255, 255, 255, a))
    sheen_mask = Image.new("L", (inner_w, 80), 0)
    smd = ImageDraw.Draw(sheen_mask)
    smd.rounded_rectangle((0, 0, inner_w, 200), radius=inner_radius, fill=255)
    body.paste(sheen, (bezel, bezel), sheen_mask)

    return body


def composite_phone_with_shadow(canvas: Image.Image, phone: Image.Image, x: int, y: int):
    """Multi-layer realistic drop shadow + cyan ambient halo + phone."""
    w, h = phone.size

    # 1) Cyan ambient halo (subtle, pulled toward bottom)
    halo = Image.new("RGBA", (w + 400, h + 400), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.rounded_rectangle((200, 200, 200 + w, 200 + h), radius=108,
                         fill=(COL_GLOW_CYAN[0], COL_GLOW_CYAN[1], COL_GLOW_CYAN[2], 110))
    halo = halo.filter(ImageFilter.GaussianBlur(110))
    canvas.alpha_composite(halo, (x - 200, y - 100))

    # 2) Deep drop shadow (offset down)
    shadow = Image.new("RGBA", (w + 200, h + 200), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((100, 100, 100 + w, 100 + h), radius=108, fill=(0, 0, 0, 240))
    shadow = shadow.filter(ImageFilter.GaussianBlur(55))
    canvas.alpha_composite(shadow, (x - 100, y - 60))

    # 3) Closer shadow (sharper, just under phone)
    shadow2 = Image.new("RGBA", (w + 80, h + 80), (0, 0, 0, 0))
    sd2 = ImageDraw.Draw(shadow2)
    sd2.rounded_rectangle((40, 40, 40 + w, 40 + h), radius=108, fill=(0, 0, 0, 180))
    shadow2 = shadow2.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(shadow2, (x - 40, y - 10))

    # 4) Phone itself
    canvas.alpha_composite(phone, (x, y))


# ---------- Typography ----------
def fit_one_line(text: str, max_w: int, base_size: int, font_path: str) -> ImageFont.FreeTypeFont:
    size = base_size
    while size > 40:
        f = ImageFont.truetype(font_path, size)
        bb = f.getbbox(text)
        if bb[2] - bb[0] <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(font_path, size)


def fit_two_lines(text: str, max_w: int, base_size: int, font_path: str):
    """Try to fit on one line; if not, split into two and shrink as needed."""
    size = base_size
    while size > 60:
        f = ImageFont.truetype(font_path, size)
        bb = f.getbbox(text)
        if bb[2] - bb[0] <= max_w:
            return f, [text]
        # try splitting roughly in half by word count
        words = text.split()
        if len(words) >= 2:
            best = None
            for split in range(1, len(words)):
                a = " ".join(words[:split])
                b = " ".join(words[split:])
                wa = f.getbbox(a)[2] - f.getbbox(a)[0]
                wb = f.getbbox(b)[2] - f.getbbox(b)[0]
                if wa <= max_w and wb <= max_w:
                    # prefer balanced
                    score = abs(wa - wb)
                    if best is None or score < best[0]:
                        best = (score, [a, b])
            if best is not None:
                return f, best[1]
        size -= 6
    f = ImageFont.truetype(font_path, max(size, 60))
    return f, [text]


def draw_premium_title(canvas: Image.Image, lines, top_y: int, font: ImageFont.FreeTypeFont):
    """Draw bold title with cyan outer glow + subtle vertical gradient."""
    line_h = font.getbbox("Ay")[3] - font.getbbox("Ay")[1]
    leading = int(line_h * 1.05)

    # Build separate glow layer for all lines
    total_h = leading * len(lines) + 200
    glow_layer = Image.new("RGBA", (W, total_h), (0, 0, 0, 0))
    gl_d = ImageDraw.Draw(glow_layer)
    for i, ln in enumerate(lines):
        bb = font.getbbox(ln)
        tw = bb[2] - bb[0]
        tx = (W - tw) // 2
        ty = 100 + i * leading - bb[1]
        gl_d.text((tx, ty), ln, font=font, fill=(COL_GLOW_CYAN[0], COL_GLOW_CYAN[1], COL_GLOW_CYAN[2], 220),
                  stroke_width=2, stroke_fill=(COL_GLOW_CYAN[0], COL_GLOW_CYAN[1], COL_GLOW_CYAN[2], 200))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(22))
    canvas.alpha_composite(glow_layer, (0, top_y - 100))

    # Build the actual title with subtle gradient (white → soft cyan-white)
    text_layer = Image.new("RGBA", (W, total_h), (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)
    for i, ln in enumerate(lines):
        bb = font.getbbox(ln)
        tw = bb[2] - bb[0]
        tx = (W - tw) // 2
        ty = 100 + i * leading - bb[1]
        td.text((tx, ty), ln, font=font, fill=(255, 255, 255, 255),
                stroke_width=2, stroke_fill=(255, 255, 255, 255))

    # apply a vertical gradient to the rendered text using a mask
    grad = Image.new("L", (W, total_h), 0)
    gd = ImageDraw.Draw(grad)
    for yy in range(total_h):
        # top → pure white, bottom → soft icy cyan-white
        gd.line([(0, yy), (W, yy)], fill=int(255 - 30 * (yy / total_h)))
    # we won't actually use this since white text is fine — keep simple
    canvas.alpha_composite(text_layer, (0, top_y - 100))

    return leading * len(lines)


# ---------- Synthetic Screens (rebuilt for premium feel) ----------
def synth_stats_screen(lang="en") -> Image.Image:
    img = Image.new("RGB", (1290, 2796), (8, 12, 26))
    d = ImageDraw.Draw(img)

    # subtle radial accent in center
    radial = Image.new("RGB", (1290, 2796), (0, 0, 0))
    rd = ImageDraw.Draw(radial)
    rd.ellipse((-200, 600, 1490, 2200), fill=(20, 35, 70))
    radial = radial.filter(ImageFilter.GaussianBlur(200))
    img = ImageChops.add(img, radial)

    d = ImageDraw.Draw(img)

    # Status bar simulation (time + dots)
    f_time = ImageFont.truetype(FONT_BOLD, 44)
    d.text((75, 56), "9:41", font=f_time, fill=(255, 255, 255))
    # signal/wifi/battery icons (simplified)
    d.rounded_rectangle((1115, 64, 1175, 90), radius=6, outline=(255, 255, 255), width=3)
    d.rounded_rectangle((1118, 67, 1170, 87), radius=4, fill=(255, 255, 255))
    d.ellipse((1078, 56, 1106, 84), outline=(255, 255, 255), width=4)

    # Header
    f_h = ImageFont.truetype(FONT_BOLD, 86)
    header = "Statistics" if lang == "en" else "İstatistikler"
    d.text((75, 200), header, font=f_h, fill=(255, 255, 255))

    f_sub = ImageFont.truetype(FONT_REG, 42)
    sub = "Last 7 days" if lang == "en" else "Son 7 gün"
    d.text((75, 320), sub, font=f_sub, fill=(140, 175, 215))

    # Streak Card — glassy gradient
    sx, sy, sw, sh = 75, 430, 1140, 320
    card = Image.new("RGB", (sw, sh), (15, 28, 70))
    cd = ImageDraw.Draw(card)
    for yy in range(sh):
        t = yy / sh
        rr = int(22 + (60 - 22) * t)
        gg = int(35 + (40 - 35) * t)
        bb = int(80 + (130 - 80) * (1 - t))
        cd.line([(0, yy), (sw, yy)], fill=(rr, gg, bb))
    mask = Image.new("L", (sw, sh), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, sw, sh), radius=48, fill=255)
    img.paste(card, (sx, sy), mask)

    f_streak_n = ImageFont.truetype(FONT_BOLD, 220)
    d.text((sx + 65, sy + 55), "12", font=f_streak_n, fill=(255, 255, 255))
    f_streak_l = ImageFont.truetype(FONT_BOLD, 44)
    streak_l = "DAY STREAK" if lang == "en" else "GÜNLÜK SERİ"
    d.text((sx + 75, sy + 250), streak_l, font=f_streak_l, fill=(255, 195, 90))
    # trophy
    f_emo = ImageFont.truetype(FONT_BOLD, 230)
    d.text((sx + 800, sy + 60), "🏆", font=f_emo, fill=(255, 200, 60))

    # Weekly intake card
    bx, by, bw, bh = 75, 805, 1140, 1080
    bar_mask = Image.new("L", (bw, bh), 0)
    bm = ImageDraw.Draw(bar_mask)
    bm.rounded_rectangle((0, 0, bw, bh), radius=48, fill=255)
    bar_card = Image.new("RGB", (bw, bh), (18, 26, 56))
    img.paste(bar_card, (bx, by), bar_mask)

    f_card_h = ImageFont.truetype(FONT_BOLD, 52)
    chart_title = "Weekly intake" if lang == "en" else "Haftalık tüketim"
    d.text((bx + 55, by + 55), chart_title, font=f_card_h, fill=(255, 255, 255))

    f_card_v = ImageFont.truetype(FONT_BOLD, 110)
    d.text((bx + 55, by + 135), "16.4 L", font=f_card_v, fill=(34, 211, 238))
    f_card_d = ImageFont.truetype(FONT_REG, 40)
    delta = "+12% vs last week" if lang == "en" else "+12% geçen haftaya göre"
    d.text((bx + 55, by + 280), delta, font=f_card_d, fill=(120, 230, 180))

    # bars
    days_en = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    days_tr = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
    days = days_en if lang == "en" else days_tr
    heights_pct = [0.55, 0.72, 0.40, 0.85, 0.95, 0.78, 1.00]
    bar_w = 110
    gap = (bw - 7 * bar_w - 100) // 6
    base_y = by + bh - 100
    max_h = 540
    for i in range(7):
        bxx = bx + 50 + i * (bar_w + gap)
        bhx = int(max_h * heights_pct[i])
        # gradient bar — bottom darker, top brighter cyan
        for yy in range(bhx):
            t = yy / bhx
            r = int(34 + (140 - 34) * t)
            g = int(211 + (240 - 211) * t)
            b = int(238 + (255 - 238) * t)
            d.line([(bxx, base_y - bhx + yy), (bxx + bar_w, base_y - bhx + yy)], fill=(r, g, b))
        # top round cap
        d.ellipse((bxx, base_y - bhx - 30, bxx + bar_w, base_y - bhx + 30), fill=(140, 240, 255))
        # day label
        f_day = ImageFont.truetype(FONT_BOLD, 36)
        bb = f_day.getbbox(days[i])
        lw = bb[2] - bb[0]
        d.text((bxx + bar_w // 2 - lw // 2, base_y + 22), days[i], font=f_day, fill=(140, 175, 215))

    # Achievements row
    f_ach = ImageFont.truetype(FONT_BOLD, 50)
    ach_title = "Achievements" if lang == "en" else "Başarılar"
    d.text((75, 1950), ach_title, font=f_ach, fill=(255, 255, 255))
    icons = ["💧", "🔥", "⭐", "🏆"]
    labels_en = ["First Drop", "7-Day", "Goal!", "Champion"]
    labels_tr = ["İlk Damla", "7 Gün", "Hedef!", "Şampiyon"]
    labels = labels_en if lang == "en" else labels_tr
    for i, ic in enumerate(icons):
        ix = 75 + i * 285
        iy = 2070
        cm = Image.new("L", (260, 280), 0)
        cmd = ImageDraw.Draw(cm)
        cmd.rounded_rectangle((0, 0, 260, 280), radius=44, fill=255)
        card_bg = Image.new("RGB", (260, 280), (22, 32, 64))
        img.paste(card_bg, (ix, iy), cm)
        fi = ImageFont.truetype(FONT_BOLD, 130)
        d.text((ix + 55, iy + 30), ic, font=fi, fill=(255, 200, 80))
        fl = ImageFont.truetype(FONT_BOLD, 32)
        bb = fl.getbbox(labels[i])
        d.text((ix + (260 - (bb[2] - bb[0])) // 2, iy + 200), labels[i], font=fl, fill=(180, 210, 235))

    # bottom nav placeholder bar
    f_nav = ImageFont.truetype(FONT_REG, 30)
    nav = "Home   ●Stats   AquaCoach   Achievements   Settings" if lang == "en" else "Bugün   ●İstatistik   AquaCoach   Başarılar   Ayarlar"
    bb = f_nav.getbbox(nav)
    d.text(((W - (bb[2] - bb[0])) // 2, 2670), nav, font=f_nav, fill=(110, 145, 180))

    return img


def synth_reminders_screen(lang="en") -> Image.Image:
    img = Image.new("RGB", (1290, 2796), (8, 12, 26))
    d = ImageDraw.Draw(img)

    # ambient blue accent top
    rad = Image.new("RGB", (1290, 2796), (0, 0, 0))
    rd = ImageDraw.Draw(rad)
    rd.ellipse((-200, -400, 1490, 1400), fill=(18, 32, 65))
    rad = rad.filter(ImageFilter.GaussianBlur(220))
    img = ImageChops.add(img, rad)
    d = ImageDraw.Draw(img)

    # status bar
    f_time = ImageFont.truetype(FONT_BOLD, 44)
    d.text((75, 56), "9:41", font=f_time, fill=(255, 255, 255))
    d.rounded_rectangle((1115, 64, 1175, 90), radius=6, outline=(255, 255, 255), width=3)
    d.rounded_rectangle((1118, 67, 1170, 87), radius=4, fill=(255, 255, 255))

    # header
    f_h = ImageFont.truetype(FONT_BOLD, 86)
    header = "Reminders" if lang == "en" else "Hatırlatıcılar"
    d.text((75, 200), header, font=f_h, fill=(255, 255, 255))
    f_sub = ImageFont.truetype(FONT_REG, 42)
    sub = "Smart schedule that adapts to your day" if lang == "en" else "Gününe uyum sağlayan akıllı plan"
    d.text((75, 320), sub, font=f_sub, fill=(140, 175, 215))

    # Toggle bar
    tb_y = 430
    tm = Image.new("L", (1140, 140), 0)
    tmd = ImageDraw.Draw(tm)
    tmd.rounded_rectangle((0, 0, 1140, 140), radius=36, fill=255)
    tb = Image.new("RGB", (1140, 140), (18, 34, 78))
    cd = ImageDraw.Draw(tb)
    for yy in range(140):
        t = yy / 140
        rr = int(22 + (40 - 22) * t)
        gg = int(38 + (40 - 38) * t)
        bbcol = int(88 + (130 - 88) * (1 - t))
        cd.line([(0, yy), (1140, yy)], fill=(rr, gg, bbcol))
    img.paste(tb, (75, tb_y), tm)
    f_tb = ImageFont.truetype(FONT_BOLD, 46)
    tb_text = "Smart reminders" if lang == "en" else "Akıllı hatırlatıcılar"
    d.text((140, tb_y + 42), tb_text, font=f_tb, fill=(255, 255, 255))
    # toggle pill ON
    d.rounded_rectangle((1020, tb_y + 38, 1185, tb_y + 102), radius=32, fill=(34, 211, 238))
    d.ellipse((1130, tb_y + 38, 1185, tb_y + 102), fill=(255, 255, 255))

    # Schedule cards
    reminders_en = [
        ("☀️", "8:00 AM", "Morning hydration", "250 ml"),
        ("💧", "10:30 AM", "Mid-morning sip", "300 ml"),
        ("🥗", "1:00 PM", "After lunch boost", "400 ml"),
        ("🏃", "4:00 PM", "Afternoon recharge", "350 ml"),
        ("🧘", "7:30 PM", "Evening top-up", "250 ml"),
        ("🌙", "9:30 PM", "Pre-sleep sip", "150 ml"),
    ]
    reminders_tr = [
        ("☀️", "08:00", "Sabah hidrasyonu", "250 ml"),
        ("💧", "10:30", "Kuşluk yudumu", "300 ml"),
        ("🥗", "13:00", "Öğle sonrası", "400 ml"),
        ("🏃", "16:00", "Öğleden sonra", "350 ml"),
        ("🧘", "19:30", "Akşam takviyesi", "250 ml"),
        ("🌙", "21:30", "Uykudan önce", "150 ml"),
    ]
    items = reminders_en if lang == "en" else reminders_tr

    start_y = 640
    card_h = 215
    gap = 32
    next_idx = 1  # Next-up indicator on second card
    for i, (emoji, time, label, vol) in enumerate(items):
        cy = start_y + i * (card_h + gap)
        cm = Image.new("L", (1140, card_h), 0)
        cmd = ImageDraw.Draw(cm)
        cmd.rounded_rectangle((0, 0, 1140, card_h), radius=40, fill=255)
        cc = Image.new("RGB", (1140, card_h), (20, 28, 56))
        ccd = ImageDraw.Draw(cc)
        for yy in range(card_h):
            t = yy / card_h
            rr = int(20 + 12 * t)
            gg = int(28 + 8 * t)
            bbcol = int(56 + 24 * t)
            ccd.line([(0, yy), (1140, yy)], fill=(rr, gg, bbcol))
        img.paste(cc, (75, cy), cm)

        # emoji
        fe = ImageFont.truetype(FONT_BOLD, 96)
        d.text((110, cy + 55), emoji, font=fe, fill=(255, 255, 255))
        # time
        ft = ImageFont.truetype(FONT_BOLD, 58)
        d.text((245, cy + 38), time, font=ft, fill=(255, 255, 255))
        # label
        fl = ImageFont.truetype(FONT_REG, 40)
        d.text((245, cy + 118), label, font=fl, fill=(155, 200, 230))
        # vol pill
        d.rounded_rectangle((898, cy + 78, 1098, cy + 142), radius=32, fill=(34, 211, 238))
        fv = ImageFont.truetype(FONT_BOLD, 40)
        bb = fv.getbbox(vol)
        pw = bb[2] - bb[0]
        d.text((998 - pw // 2, cy + 86), vol, font=fv, fill=(8, 18, 38))

        # NEXT badge on second card
        if i == next_idx:
            d.rounded_rectangle((1000, cy + 18, 1118, cy + 58), radius=20, fill=(255, 195, 90))
            f_next = ImageFont.truetype(FONT_BOLD, 26)
            next_label = "NEXT" if lang == "en" else "SIRADA"
            bb = f_next.getbbox(next_label)
            pw = bb[2] - bb[0]
            d.text((1059 - pw // 2, cy + 22), next_label, font=f_next, fill=(8, 18, 38))

    return img


# ---------- Composition ----------
def compose(title: str, subtitle: str, raw_img_path=None, synth_func=None, lang="en",
            ghost_emoji: str = "💧") -> Image.Image:
    canvas = make_background().convert("RGBA")
    d = ImageDraw.Draw(canvas)

    # ----- Ghost icon (huge, faded, behind title — Calm style) -----
    ghost_layer = Image.new("RGBA", (W, 700), (0, 0, 0, 0))
    gd = ImageDraw.Draw(ghost_layer)
    f_ghost = ImageFont.truetype(FONT_BOLD, 540)
    bb = f_ghost.getbbox(ghost_emoji)
    gw = bb[2] - bb[0]
    gd.text(((W - gw) // 2, -bb[1] + 60), ghost_emoji, font=f_ghost,
            fill=(COL_GLOW_CYAN[0], COL_GLOW_CYAN[1], COL_GLOW_CYAN[2], 35))
    ghost_layer = ghost_layer.filter(ImageFilter.GaussianBlur(8))
    canvas.alpha_composite(ghost_layer, (0, 30))

    # ----- Title — compact, lower position so phone has more room -----
    title_font, title_lines = fit_two_lines(title, W - 200, 138, FONT_BOLD)
    title_top_y = 140
    title_height = draw_premium_title(canvas, title_lines, title_top_y, title_font)

    # ----- Subtitle — bold, single line, with subtle glow -----
    sub_font = fit_one_line(subtitle, W - 220, 54, FONT_BOLD)
    sub_y = title_top_y + title_height + 22
    bb = sub_font.getbbox(subtitle)
    sub_w = bb[2] - bb[0]
    sub_glow = Image.new("RGBA", (sub_w + 200, bb[3] - bb[1] + 200), (0, 0, 0, 0))
    sgd = ImageDraw.Draw(sub_glow)
    sgd.text((100, 100 - bb[1]), subtitle, font=sub_font,
             fill=(COL_ACCENT[0], COL_ACCENT[1], COL_ACCENT[2], 200))
    sub_glow = sub_glow.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(sub_glow, ((W - sub_w) // 2 - 100, sub_y - 100))
    d = ImageDraw.Draw(canvas)
    d.text(((W - sub_w) // 2, sub_y), subtitle, font=sub_font, fill=(230, 248, 255, 255))

    # Tiny cyan accent under subtitle
    dot_y = sub_y + (bb[3] - bb[1]) + 22
    for i in range(3):
        dx = W // 2 - 30 + i * 30
        d.ellipse((dx - 6, dot_y - 6, dx + 6, dot_y + 6),
                  fill=(COL_ACCENT[0], COL_ACCENT[1], COL_ACCENT[2], 255))

    # ----- Phone (MEGA HERO — 91% canvas width, touches bottom) -----
    if raw_img_path and os.path.exists(raw_img_path):
        inner = Image.open(raw_img_path)
    elif synth_func:
        inner = synth_func(lang=lang)
    else:
        inner = Image.new("RGB", (1290, 2796), (10, 14, 32))

    phone_width = 1170
    phone = make_phone(inner, width=phone_width)
    phone_x = (W - phone.width) // 2

    # Position: phone bottom extends 40px past canvas (premium "rising up" look)
    phone_y_target = H - phone.height + 40
    min_phone_top = dot_y + 50
    phone_y = max(phone_y_target, min_phone_top)

    composite_phone_with_shadow(canvas, phone, phone_x, phone_y)

    return canvas.convert("RGB")


# ---------- Content ----------
SCREENS = [
    ("01_home.png", None,
     ("Stay Hydrated", "Track every sip, beautifully"),
     ("Susuz Kalma", "Her yudumu özenle takip et"),
     "home", "💧"),
    ("03_coach.png", None,
     ("Your AI Coach", "GPT-4o powered hydration guidance"),
     ("Yapay Zeka Koçun", "GPT-4o destekli su rehberin"),
     "coach", "🤖"),
    (None, synth_stats_screen,
     ("Track Your Progress", "Streaks, charts & achievements"),
     ("İlerleni Takip Et", "Seri, grafik ve başarılar"),
     "stats", "📊"),
    (None, synth_reminders_screen,
     ("Never Miss a Sip", "Smart reminders for your day"),
     ("Hiç Unutma", "Gününe uygun akıllı hatırlatıcılar"),
     "reminders", "🔔"),
    ("02_body_map.png", None,
     ("See Water Reach Every Organ", "Brain · heart · kidneys · skin"),
     ("Suyun Her Organa Yolculuğu", "Beyin · kalp · böbrek · cilt"),
     "body_map", "🫀"),
]


def main():
    for idx, (raw_name, synth, en_pair, tr_pair, slug, ghost) in enumerate(SCREENS, 1):
        # EN
        en_raw_name = EN_FILE_MAP.get(raw_name) if raw_name else None
        raw_path_en = os.path.join(RAW_EN_DIR, en_raw_name) if en_raw_name else None
        out_en = f"{OUT_DIR}/en/{idx:02d}_{slug}.png"
        img_en = compose(en_pair[0], en_pair[1], raw_path_en, synth, lang="en", ghost_emoji=ghost)
        img_en.save(out_en, "PNG", optimize=True)
        print(f"✓ EN [{idx}] {slug:9s} → {out_en}")

        # TR
        raw_path_tr = os.path.join(RAW_TR_DIR, raw_name) if raw_name else None
        out_tr = f"{OUT_DIR}/tr/{idx:02d}_{slug}.png"
        img_tr = compose(tr_pair[0], tr_pair[1], raw_path_tr, synth, lang="tr", ghost_emoji=ghost)
        img_tr.save(out_tr, "PNG", optimize=True)
        print(f"✓ TR [{idx}] {slug:9s} → {out_tr}")

    print("\nALL DONE")


if __name__ == "__main__":
    main()
