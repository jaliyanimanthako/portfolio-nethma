CV 1 — OFFLINE PORTFOLIO FLIPBOOK

Open index.html in Chrome, Edge, Firefox, or Safari.
No installation, internet connection, or local server is required.
If using the ZIP, extract the entire folder first. Keep all files together.

CONTROLS
- Click a page, drag a corner, swipe, or use Previous / Next.
- Page turns play the medium page-turn effect from the Heyzine demo.
  Use Sound on / Sound off to mute.
  Sound starts after you interact with the book. Your preference is remembered
  when browser storage is available. The recording is stored locally and works offline.
- Left / Right arrow keys turn pages. Home / End jump to the ends.
- The page selector jumps to any of the 27 original PDF pages.
- On wide screens, inner pages appear as a spread. Narrow screens show one page.
- Enlarge page opens the selected page in a reading view. Zoom in shows its
  full image resolution; scroll to inspect details. Escape closes the reader.
- The viewer shows only the book and compact controls on a plain white screen.
- On phones, swipe to turn pages; rotate to landscape for a larger page.
  Tap the expand icon to enlarge details. Sound begins after interaction.
- The original CV 1.pdf is also included separately in this folder.

SHARING WITH MOBILE READERS
Publish this folder on a static website host and share its HTTPS link.
Recipients can then open the interactive book in their normal phone browser,
without an HTML-viewer app or extracting a ZIP. The page turns and sound remain.
The local package does not create a public link until it is hosted.

CONTENTS
index.html, styles.css, app.js: local book viewer.
pages/page-01.jpg through page-27.jpg: PDF pages rendered at 160 dpi,
  JPEG quality 92 (1871 x 1324 pixels), in their original order.
CV 1.pdf: original, unmodified PDF.
page-flip.browser.js: StPageFlip v2.0.0 with a local cover-position fix.
VENDOR-PATCHES.txt: details of the cover and shadow coordinate correction.
LICENSE-StPageFlip.txt: its MIT license.
sounds/page-flip.mp3: page-turn recording from the Heyzine public demo.
sounds/page-flip-data.js: the same recording embedded for file:// playback.
sounds/SOURCE.txt: audio source attribution (separate from StPageFlip).

Library source: https://github.com/Nodlik/StPageFlip
Bundle: https://github.com/Nodlik/StPageFlip/releases/download/v2.0.0/page-flip.browser.js
These are attribution links only. The viewer makes no network requests.

To replace or add pages, edit the pages array in app.js and update the page
totals in index.html. Images should have matching landscape proportions.
Image pages do not expose selectable text; use the original PDF when needed.
