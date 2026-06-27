"""
Generate iPad 13" Display screenshots (2064×2752) from existing 5 EN designs.

Source aspect (h/w): 1.50 to 2.16 (too tall for iPad)
Target aspect (h/w): 2752/2064 = 1.333

Strategy: extend horizontally (left + right) with dark navy edge color
and smooth seam blur, then resize to 2064×2752 with LANCZOS + UnsharpMask.
"""
import os
from PIL import Image, ImageFilter

SRC = "/app/store-listing/screenshots/v3_final/source"
OUT = "/app/store-listing/screenshots/v3_final/ipad_2064"
os.makedirs(OUT, exist_ok=True)

TARGET_W, TARGET_H = 2064, 2752
TARGET_RATIO = TARGET_H / TARGET_W  # 1.333

FILES = [
    "01_home.png",
    "02_body_map.png",
    "03_themes.png",
    "04_stats.png",
    "05_achievements.png",
]


def sample_edge_color(img, side, samples=40):
    w, h = img.size
    if side == "left":
        strip = img.crop((0, 0, samples, h))
    elif side == "right":
        strip = img.crop((w - samples, 0, w, h))
    elif side == "top":
        strip = img.crop((0, 0, w, samples))
    else:
        strip = img.crop((0, h - samples, w, h))
    avg = strip.resize((1, 1), Image.BILINEAR)
    return avg.getpixel((0, 0))


def extend_horizontally(img: Image.Image, target_ratio: float) -> Image.Image:
    """Pad img horizontally with edge-color extension. target_ratio = h/w."""
    w, h = img.size
    current_ratio = h / w
    if abs(current_ratio - target_ratio) < 0.005:
        return img

    if current_ratio > target_ratio:
        # too tall — need wider
        new_w = int(h / target_ratio)
        pad_total = new_w - w
        pad_l = pad_total // 2
        pad_r = pad_total - pad_l

        left_color = sample_edge_color(img, "left", samples=50)
        right_color = sample_edge_color(img, "right", samples=50)

        canvas = Image.new("RGB", (new_w, h), left_color)
        # Fill left
        canvas.paste(Image.new("RGB", (pad_l, h), left_color), (0, 0))
        # Fill right
        canvas.paste(Image.new("RGB", (pad_r, h), right_color), (pad_l + w, 0))
        # Original in center
        canvas.paste(img, (pad_l, 0))

        # Smooth seams: blur narrow strips around the boundaries
        seam_w = 50
        if pad_l > 5:
            sx1 = max(0, pad_l - seam_w)
            sx2 = min(new_w, pad_l + seam_w)
            seam = canvas.crop((sx1, 0, sx2, h)).filter(ImageFilter.GaussianBlur(radius=18))
            canvas.paste(seam, (sx1, 0))
        if pad_r > 5:
            sx1 = max(0, pad_l + w - seam_w)
            sx2 = min(new_w, pad_l + w + seam_w)
            seam = canvas.crop((sx1, 0, sx2, h)).filter(ImageFilter.GaussianBlur(radius=18))
            canvas.paste(seam, (sx1, 0))

        return canvas
    else:
        # too wide — need taller (unusual for our inputs)
        new_h = int(w * target_ratio)
        pad_total = new_h - h
        pad_t = pad_total // 2
        pad_b = pad_total - pad_t
        top_color = sample_edge_color(img, "top")
        bot_color = sample_edge_color(img, "bottom")
        canvas = Image.new("RGB", (w, new_h), top_color)
        canvas.paste(Image.new("RGB", (w, pad_b), bot_color), (0, pad_t + h))
        canvas.paste(img, (0, pad_t))
        return canvas


def fit_by_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """
    Scale image so it fills target dimensions; crop excess from top/bottom or sides.
    Cleaner than padding — no visible seam.
    """
    w, h = img.size
    scale_w = target_w / w
    scale_h = target_h / h
    scale = max(scale_w, scale_h)  # fill, may crop
    new_w = int(round(w * scale))
    new_h = int(round(h * scale))
    img = img.resize((new_w, new_h), Image.LANCZOS)
    # center crop
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))


def process(src_path: str, out_path: str):
    img = Image.open(src_path).convert("RGB")
    print(f"  {os.path.basename(src_path)}: {img.size} (ratio h/w={img.size[1]/img.size[0]:.3f})")
    img = fit_by_crop(img, TARGET_W, TARGET_H)
    print(f"    → fit-cropped: {img.size}")
    img = img.filter(ImageFilter.UnsharpMask(radius=1.5, percent=100, threshold=2))
    img.save(out_path, "PNG", optimize=True)
    sz = os.path.getsize(out_path) / 1024
    print(f"    ✓ saved: {os.path.basename(out_path)} ({sz:.0f} KB)")


def main():
    for f in FILES:
        process(os.path.join(SRC, f), os.path.join(OUT, f))
    print("\nDONE")


if __name__ == "__main__":
    main()
