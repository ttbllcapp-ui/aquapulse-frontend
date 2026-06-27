"""Multi-rect test to triangulate the 'Undock the ocean' position in aqua5."""
from PIL import Image, ImageDraw

img5 = Image.open('/app/screenshots_v2/src/aqua5.png').copy()
d5 = ImageDraw.Draw(img5)
# Three candidate boxes at different y values
d5.rectangle((140, 970, 380, 1010), outline='red', width=3)
d5.text((150, 945), "A", fill='red')
d5.rectangle((140, 1040, 380, 1080), outline='lime', width=3)
d5.text((150, 1015), "B", fill='lime')
d5.rectangle((140, 1110, 380, 1150), outline='yellow', width=3)
d5.text((150, 1085), "C", fill='yellow')
img5.save('/app/screenshots_v2/crops/aqua5_triangulate.png')

# Resize for analysis
img5.thumbnail((500, 1100))
img5.save('/app/screenshots_v2/crops/aqua5_triangulate_small.png')
print('saved')
