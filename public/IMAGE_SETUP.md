# Image Setup Instructions

To use your custom skull logo image (orange-haired skull in blue bone 'D' frame) for favicons and social sharing:

## Option 1: Next.js File-Based Metadata (Recommended)

Next.js 15 automatically detects these files in the `src/app/` directory:
- `src/app/icon.png` - Favicon (any size, recommended: 32x32 or 512x512)
- `src/app/apple-icon.png` - Apple touch icon (180x180)
- `src/app/opengraph-image.png` - Open Graph/Twitter image (1200x630)

**Just place your image files in `src/app/` with these exact names!**

## Option 2: Public Directory (Current Setup)

Place your image files in the `public/` directory:

1. **Favicon**: `public/icon.png` (32x32 or 512x512 recommended)
2. **Apple Icon**: `public/apple-icon.png` (180x180)
3. **OG Image**: `public/og-image.png` (1200x630 for social sharing)

## Image Specifications

Based on your skull logo design:

- **Favicon/Icon**: Crop/resize to show the 'D' frame with skull, centered
- **OG Image**: Can be the full logo or a banner-style version (1200x630px)
- **Apple Icon**: Same as favicon but larger (180x180px)

## Quick Setup Steps

1. **If you have one image file:**
   - Save it as `src/app/icon.png` (Next.js will use it automatically)
   - Or save as `public/icon.png` and update paths in layout.tsx

2. **If you have multiple sizes:**
   - `src/app/icon.png` (favicon)
   - `src/app/apple-icon.png` (Apple devices)
   - `src/app/opengraph-image.png` (social sharing)

3. **The metadata in `src/app/layout.tsx` is already configured!**

## Note

The metadata is set up to use `/icon.png`, `/apple-icon.png`, and `/og-image.png` from the public directory. If you use Next.js file-based metadata (Option 1), you can remove the icon paths from the metadata object and Next.js will handle it automatically.

