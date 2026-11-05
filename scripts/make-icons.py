"""Builds the site icons in static/ from the guitar + skyline drawings in assets/.
Run from the project root after editing the art: python3 scripts/make-icons.py
Needs Pillow and Google Chrome (used to turn the SVGs into PNGs)."""
import os
import shutil
import subprocess
import tempfile
from PIL import Image

CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def render(svg, size):
    """Rasterize an SVG to a size x size image using headless Chrome."""
    with tempfile.TemporaryDirectory() as tmp:
        page = os.path.join(tmp, "icon.html")
        out = os.path.join(tmp, "icon.png")
        with open(page, "w") as f:
            f.write(f'<body style="margin:0"><img src="file://{os.path.abspath(svg)}" '
                    f'width="{size}" height="{size}" style="display:block">')
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
                        "--allow-file-access-from-files", "--default-background-color=00000000",
                        f"--window-size={size},{size}", f"--screenshot={out}", f"file://{page}"],
                       check=True, capture_output=True)
        return Image.open(out).convert("RGBA").crop((0, 0, size, size))


big = render("assets/icon.svg", 720)
small = render("assets/icon-small.svg", 256)

# iOS home screen: 180x180, no transparency (iOS rounds the corners itself).
big.resize((180, 180), Image.LANCZOS).convert("RGB").save("static/apple-touch-icon.png")
# Older browsers and bookmark bars that don't take SVG.
small.resize((32, 32), Image.LANCZOS).save("static/favicon-32.png")
small.save("static/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
# Modern browsers use the SVG directly (sharp at any size).
shutil.copyfile("assets/icon-small.svg", "static/favicon.svg")
print("Wrote static/apple-touch-icon.png, favicon-32.png, favicon.ico, favicon.svg")
