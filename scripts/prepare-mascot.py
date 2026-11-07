"""Retain original dark artwork while removing only the outer video background."""
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

root = Path(__file__).resolve().parents[1]
width = height = 720
decoder = subprocess.Popen([
    'ffmpeg', '-v', 'error', '-i', str(root / 'assets/video/mascot-appear-source.mp4'),
    '-vf', 'scale=720:720', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
], stdout=subprocess.PIPE)
frames = []
qa = root / 'public/qa/mascot'
qa.mkdir(parents=True, exist_ok=True)
while True:
    raw = decoder.stdout.read(width * height * 3)
    if not raw:
        break
    if len(raw) != width * height * 3:
        raise RuntimeError('Incomplete source frame')
    rgb = np.frombuffer(raw, dtype=np.uint8).reshape(height, width, 3)
    # A global black color key removes the eyes, mouth and outlines as well.
    # Start with the colored artwork, fill its enclosed dark details, then
    # extend the mask three pixels into the original black outline. RGB is
    # copied unchanged from the source; this does not redraw the character.
    foreground = rgb.max(axis=2) > 28
    silhouette = ndimage.binary_fill_holes(foreground)
    silhouette = ndimage.binary_dilation(silhouette, iterations=3)
    alpha = Image.fromarray((silhouette * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.35))
    frame = Image.fromarray(rgb).convert('RGBA')
    frame.putalpha(alpha)
    if len(frames) in (0, 24, 72, 120):
        paper = Image.new('RGBA', frame.size, '#FBF8F7')
        paper.alpha_composite(frame)
        paper.convert('RGB').save(qa / f'frame-{len(frames):03d}.png')
    frames.append(frame)
if decoder.wait() != 0 or not frames:
    raise RuntimeError('Source video could not be decoded')
frames[0].save(root / 'assets/redy/mascot_appear.webp', save_all=True,
               append_images=frames[1:], duration=round(1000 / 24), loop=1,
               lossless=True, method=4)
print(f'Prepared {len(frames)} frames with preserved dark outlines')
