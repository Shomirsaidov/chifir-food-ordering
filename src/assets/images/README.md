# Internal Images Directory

Place your product images here. These images can be referenced in the database by filename only.

## Usage

1. Add your image files to this directory (e.g., `sushi-roll.jpg`, `pizza.png`)
2. In Supabase, set the `image_loc` column to just the filename: `sushi-roll.jpg`
3. The app will automatically load the image from this directory

## Supported Formats

- JPG/JPEG
- PNG
- WebP
- GIF
- SVG

## Naming Convention

Use lowercase with hyphens for filenames:
- ✅ `california-roll.jpg`
- ✅ `tom-yum-soup.png`
- ❌ `California Roll.jpg`
- ❌ `TomYumSoup.PNG`
