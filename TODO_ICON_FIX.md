# TODO: Fix Caveman Icon in King of the Hill Badge

## Issue
The caveman icon (`/public/icon.png`) is not loading in the King of the Hill badge.

## Current Status
- Badge displays correctly with text "KING OF THE HILL"
- Orange glowing border works
- Icon placeholder is there but not rendering

## Files to Check
- `src/components/king-of-the-hill-badge.tsx` - Badge component
- `public/icon.png` - Icon file location
- Verify file path and Next.js static asset serving

## Potential Fixes (when revisiting)
1. Check if icon.png exists and is accessible
2. Verify Next.js is serving static files from /public correctly
3. Try using Next.js Image component instead of img tag
4. Check browser console for 404 errors on icon.png
5. Verify file size/format is correct

## Priority
- Low priority - badge works fine without icon
- Revisit when convenient



