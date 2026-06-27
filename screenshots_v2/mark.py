"""Mark suspected fix regions with red rectangles to verify coordinates visually."""
from PIL import Image, ImageDraw
import os

# aqua5 - "Undock the ocean" - left subtitle
# In source 853x1844, left feature column. "3 of 9 Collected" subtitle "Undock the ocean"
# In the image's layout, the middle feature has icon then "3 of 9 Collected" then "Undock the ocean" subtitle
# Estimate y around middle-third of left column (y ~ 900-1080)
img5 = Image.open('/app/screenshots_v2/src/aqua5.png').copy()
d5 = ImageDraw.Draw(img5)
# Mark candidate regions in red
d5.rectangle((140, 1010, 380, 1070), outline='red', width=4)  # candidate
img5.save('/app/screenshots_v2/crops/aqua5_marked.png')

# aqua1 - quote inside phone with "99" icon
# Phone on right side. Quote card is dark with rounded corners. 
# Based on layout it's about y ~ 1100-1230, x ~ 470-820
img1 = Image.open('/app/screenshots_v2/src/aqua1.png').copy()
d1 = ImageDraw.Draw(img1)
d1.rectangle((465, 1110, 825, 1235), outline='red', width=4)
img1.save('/app/screenshots_v2/crops/aqua1_marked.png')

# aqua2 - top white quote card with double quote icon
# Phone on right, quote at top section of screen
img2 = Image.open('/app/screenshots_v2/src/aqua2.png').copy()
d2 = ImageDraw.Draw(img2)
d2.rectangle((460, 580, 820, 760), outline='red', width=4)
img2.save('/app/screenshots_v2/crops/aqua2_marked.png')

print('marked files saved')
