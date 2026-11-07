"""Export the supplied vector logo as web and native app icons."""
from pathlib import Path
import xml.etree.ElementTree as ET
import cairosvg

root = Path(__file__).resolve().parents[1]
images = root / 'assets' / 'images'
source = (images / 'redy-logo.svg').read_text(encoding='utf-8')
cairosvg.svg2png(bytestring=source.encode(), write_to=str(images / 'icon.png'),
                 output_width=1024, output_height=1024, background_color='#F65737')
cairosvg.svg2png(bytestring=source.encode(), write_to=str(images / 'favicon.png'),
                 output_width=64, output_height=64)

# Android applies its own launcher mask; keep the animal inside its safe zone.
logo = ET.fromstring(source)
logo.remove(list(logo)[0])  # The orange tile is supplied by adaptiveIcon.backgroundColor.
logo.set('x', '282')
logo.set('y', '282')
logo.set('width', '460')
logo.set('height', '460')
canvas = ET.Element('svg', xmlns='http://www.w3.org/2000/svg',
                    width='1024', height='1024', viewBox='0 0 1024 1024')
canvas.append(logo)
cairosvg.svg2png(bytestring=ET.tostring(canvas),
                 write_to=str(images / 'android-icon-foreground.png'))
for element in logo.iter():
    if 'fill' in element.attrib and element.get('fill') != 'none':
        element.set('fill', '#FFFFFF')
cairosvg.svg2png(bytestring=ET.tostring(canvas),
                 write_to=str(images / 'android-icon-monochrome.png'))
