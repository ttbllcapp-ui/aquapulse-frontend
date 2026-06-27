"""Resize new high-res screenshots (1-5.png, 3260x7056) to iPhone 6.5 and iPad 13 formats."""
import os
from PIL import Image, ImageFilter

SRC_DIR = "/app/screenshots_v3/src"
OUT_IPHONE = "/app/screenshots_v3/iphone_6_5"
OUT_IPAD = "/app/screenshots_v3/ipad_13"
os.makedirs(OUT_IPHONE, exist_ok=True)
os.makedirs(OUT_IPAD, exist_ok=True)

IPHONE = (1242, 2688)
IPAD = (2064, 2752)


def make_iphone(src_path, out_path):
    img = Image.open(src_path).convert("RGB")
    img_resized = img.resize(IPHONE, Image.LANCZOS)
    img_resized.save(out_path, "PNG", optimize=True)


def make_ipad(src_path, out_path):
    img = Image.open(src_path).convert("RGB")
    target_h = IPAD[1]
    scale = target_h / img.height
    new_w = int(img.width * scale)
    img_scaled = img.resize((new_w, target_h), Image.LANCZOS)
    canvas = Image.new("RGB", IPAD, (0, 0, 0))
    side_pad = (IPAD[0] - new_w) // 2
    # blurred edge extension
    strip_w = max(80, img.width // 40)
    left = img.crop((0, 0, strip_w, img.height)).resize(
        (side_pad, target_h), Image.LANCZOS
    ).filter(ImageFilter.GaussianBlur(60))
    right = img.crop((img.width - strip_w, 0, img.width, img.height)).resize(
        (side_pad, target_h), Image.LANCZOS
    ).filter(ImageFilter.GaussianBlur(60))
    canvas.paste(left, (0, 0))
    canvas.paste(right, (IPAD[0] - side_pad, 0))
    canvas.paste(img_scaled, (side_pad, 0))
    canvas.save(out_path, "PNG", optimize=True)


for i in range(1, 6):
    fn = f"{i}.png"
    src = os.path.join(SRC_DIR, fn)
    make_iphone(src, os.path.join(OUT_IPHONE, fn))
    make_ipad(src, os.path.join(OUT_IPAD, fn))
    print(f"OK: {fn}")

print("\nAll done.")
