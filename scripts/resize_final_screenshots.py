"""
Resize uploaded marketing designs to App Store iPhone 6.5" Display: 1242×2688.

Strategy:
- For images with correct aspect (2.16): high-quality LANCZOS upscale.
- For wrong-aspect images: detect dominant edge color from top + bottom,
  pad with smooth gradient extension so the design stays centered,
  then resize to target.
"""
import os
from PIL import Image, ImageFilter

SRC = "/app/store-listing/screenshots/v3_final/source"
OUT_EN = "/app/store-listing/screenshots/v3_final/en_1242"
OUT_TR = "/app/store-listing/screenshots/v3_final/tr_1242"
os.makedirs(OUT_EN, exist_ok=True)
os.makedirs(OUT_TR, exist_ok=True)

TARGET_W, TARGET_H = 1242, 2688
TARGET_RATIO = TARGET_H / TARGET_W  # 2.164

FILES = [
    "01_home.png",
    "02_body_map.png",
    "03_themes.png",
    "04_stats.png",
    "05_achievements.png",
]


def sample_edge_color(img, side="top", samples=30):
    """Median color of a strip on the chosen side."""
    w, h = img.size
    if side == "top":
        strip = img.crop((0, 0, w, samples))
    else:  # bottom
        strip = img.crop((0, h - samples, w, h))
    # Use Pillow's getextrema/getcolors via resize to 1px
    avg = strip.resize((1, 1), Image.BILINEAR)
    return avg.getpixel((0, 0))


def extend_to_aspect(img: Image.Image, target_ratio: float) -> Image.Image:
    """Pad img vertically with edge-color extension to reach target_ratio."""
    w, h = img.size
    current_ratio = h / w
    if abs(current_ratio - target_ratio) < 0.005:
        return img

    if current_ratio < target_ratio:
        # need to add vertical space
        new_h = int(w * target_ratio)
        pad_total = new_h - h
        pad_top = pad_total // 2
        pad_bot = pad_total - pad_top

        top_color = sample_edge_color(img, "top", samples=40)
        bot_color = sample_edge_color(img, "bottom", samples=40)

        # Create canvas
        canvas = Image.new("RGB", (w, new_h), top_color)

        # Top extension: solid sampled color
        canvas.paste(Image.new("RGB", (w, pad_top), top_color), (0, 0))
        # Bottom extension
        canvas.paste(Image.new("RGB", (w, pad_bot), bot_color), (0, pad_top + h))
        # Original image in center
        canvas.paste(img, (0, pad_top))

        # Smooth seam: a thin gradient blur on the boundary rows
        boundary_blur_h = 30
        # top seam
        if pad_top > 5:
            seam_y1 = max(0, pad_top - boundary_blur_h)
            seam_y2 = min(new_h, pad_top + boundary_blur_h)
            seam = canvas.crop((0, seam_y1, w, seam_y2)).filter(ImageFilter.GaussianBlur(radius=12))
            canvas.paste(seam, (0, seam_y1))
        # bottom seam
        if pad_bot > 5:
            seam_y1 = max(0, pad_top + h - boundary_blur_h)
            seam_y2 = min(new_h, pad_top + h + boundary_blur_h)
            seam = canvas.crop((0, seam_y1, w, seam_y2)).filter(ImageFilter.GaussianBlur(radius=12))
            canvas.paste(seam, (0, seam_y1))

        return canvas
    else:
        # current is too tall — would need horizontal pad; not expected here
        new_w = int(h / target_ratio)
        pad_total = new_w - w
        pad_l = pad_total // 2
        pad_r = pad_total - pad_l
        side_color = sample_edge_color(img, "top")
        canvas = Image.new("RGB", (new_w, h), side_color)
        canvas.paste(img, (pad_l, 0))
        return canvas


def process(src_path: str, out_path: str):
    img = Image.open(src_path).convert("RGB")
    # 1) Extend to correct aspect
    img = extend_to_aspect(img, TARGET_RATIO)
    # 2) High-quality upscale to target
    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    # 3) Light sharpening to compensate for upscale softness
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=2))
    img.save(out_path, "PNG", optimize=True)
    sz = os.path.getsize(out_path) / 1024
    print(f"  ✓ {os.path.basename(out_path)}: {img.size} · {sz:.0f} KB")


def main():
    print("== EN ==")
    for f in FILES:
        process(os.path.join(SRC, f), os.path.join(OUT_EN, f))
    # TR — uploaded designs are English only.
    # Best practice for App Store: use the same EN screenshots in the TR locale
    # (Apple does NOT require localized screenshots; only metadata is required to be localized).
    # We mirror to TR folder so the user gets a complete bundle.
    print("\n== TR (mirrored EN, see note) ==")
    for f in FILES:
        src = os.path.join(OUT_EN, f)
        dst = os.path.join(OUT_TR, f)
        Image.open(src).save(dst, "PNG", optimize=True)
        print(f"  ✓ tr/{f}")
    print("\nDONE")


if __name__ == "__main__":
    main()
