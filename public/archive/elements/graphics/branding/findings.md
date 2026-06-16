# Findings

- Source files exist and are all PNG assets in the branding directory.
- Target output directory did not exist at the start of the task.
- Source dimensions:
  - `image-1-1.png`: 1512x2160
  - `image-2-1.png`: 1282x1282
  - `image-13-1.png`: 1584x1584
  - `s25-campus-csa-eco-box-illustration.png`: 1512x2160
- Local image tooling:
  - `PIL`: available
  - `cv2`: available
  - `rembg`: unavailable
  - `magick`: unavailable
  - `pngquant`: unavailable
- `image-13-1.png` has a near-white background and should be straightforward to isolate.
- `image-2-1.png` is a scene illustration; the cutout should focus on the central character rather than the full background scene.
