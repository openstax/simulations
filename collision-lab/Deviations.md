# Deviations from the original PhET simulation **_and the reasons for them_**

Note that I do not list nominal changes like cosmetic differences (e.g., changing the color of the ground).

1. **Disabling one-dimensional mode in Advanced Tab:**

    I decided to make the advanced tab only for two dimensions, since one could do everything in the advanced tab that could be done in the introduction tab with the addition of only a second dimension and the option to trace the path of objects and enable a bounding box.  Both the tracing and the bounding box is only really useful in a two-dimensional simulation.  Even when switching to one-dimension mode in the advanced tab, the ball options still show a distinction between x and y for position, acceleration, and momentum, and this is superfluous.  Therefore, I've decided that it made more sense to let the introduction tab just be the place users go for the one-dimensional version and save space in the advanced tab by not having the one-dimension/two-dimension switch.