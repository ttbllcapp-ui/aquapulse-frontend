"""Crop suspected problem regions to find exact coordinates."""
from PIL import Image
import os

os.makedirs('/app/screenshots_v2/crops', exist_ok=True)

# aqua3 - "Sleep" issue is in the right phone, near bottom Reminders section
img3 = Image.open('/app/screenshots_v2/src/aqua3.png')
# Right phone roughly takes right ~half. Reminders section is lower part.
# Try a wide crop around right phone bottom area
crop3 = img3.crop((440, 1200, 850, 1500))
crop3.save('/app/screenshots_v2/crops/aqua3_sleep_region.png')
print(f"aqua3 sleep region saved: {crop3.size}")

# aqua4 - "Weekly Avg" / "Day Total" - middle of phone
img4 = Image.open('/app/screenshots_v2/src/aqua4.png')
crop4a = img4.crop((400, 850, 850, 1200))
crop4a.save('/app/screenshots_v2/crops/aqua4_numbers_region.png')
print(f"aqua4 numbers region saved: {crop4a.size}")
