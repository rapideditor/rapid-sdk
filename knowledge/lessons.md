# Lessons

## Rotate-extent-rotate needs the same pivot both ways

When computing a surrounding rectangle by rotating points into a frame, taking the extent, and rotating back, `_getRotatedExtent` (entering the frame) and `_buildSurroundingRectangle` (leaving it) must use the identical pivot.

The extent's center is not a valid substitute. The pivot cancels out in the area and shape calculation, so a wrong pivot still picks the right angle and size, but it doesn't cancel in the position calculation, so the rectangle ends up in the wrong place.
