"""Crop suspected regions for aqua5 'Undock', aqua1 medical claim, aqua2 medical claim."""
from PIL import Image
import os

os.makedirs('/app/screenshots_v2/crops', exist_ok=True)

# aqua5 - "Undock the ocean" - left side, middle area (near "3 of 9 Collected")
img5 = Image.open('/app/screenshots_v2/src/aqua5.png')
crop5 = img5.crop((50, 850, 400, 1200))
crop5.save('/app/screenshots_v2/crops/aqua5_undock.png')
print(f"aqua5 undock region: {crop5.size}")

# aqua1 - "By the time you feel thirsty..." quote inside phone
img1 = Image.open('/app/screenshots_v2/src/aqua1.png')
crop1 = img1.crop((420, 1050, 850, 1250))
crop1.save('/app/screenshots_v2/crops/aqua1_quote.png')
print(f"aqua1 quote region: {crop1.size}")

# aqua2 - "Your body is 60% water..." quote at top of phone
img2 = Image.open('/app/screenshots_v2/src/aqua2.png')
crop2 = img2.crop((430, 550, 850, 780))
crop2.save('/app/screenshots_v2/crops/aqua2_quote.png')
print(f"aqua2 quote region: {crop2.size}")
