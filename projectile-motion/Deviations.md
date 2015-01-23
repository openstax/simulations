# Deviations from the original PhET simulation **_and the reasons for them_**

Note that I do not list nominal changes like cosmetic differences (e.g., changing the color of the ground).

1. **Extension of axis lines to edges of screen:**

    It seemed like a pretty arbitrary decision in the original sim to have the axis lines stop, like it was just easier not to calculate the ends of the screen and redraw it, and so they chose a width and height big enough for general purposes.  I can change it to always have a static axis line boundary if it's determined that this is not a good deviation, but my thinking was that if the axis lines are helpful at all, they should extend to where they're needed.