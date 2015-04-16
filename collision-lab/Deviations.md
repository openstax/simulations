# Deviations from the original PhET simulation **_and the reasons for them_**

Note that I do not list nominal changes like cosmetic differences (e.g., changing the color of the ground).

1. **Disabling one-dimensional mode in Advanced Tab:**

    I decided to make the advanced tab only for two dimensions, since one could do everything in the advanced tab that could be done in the introduction tab with the addition of only a second dimension and the option to trace the path of objects and enable a bounding box.  Both the tracing and the bounding box is only really useful in a two-dimensional simulation.  Even when switching to one-dimension mode in the advanced tab, the ball options still show a distinction between x and y for position, acceleration, and momentum, and this is superfluous.  Therefore, I've decided that it made more sense to let the introduction tab just be the place users go for the one-dimensional version and save space in the advanced tab by not having the one-dimension/two-dimension switch.

2. **Ball interaction only enabled while paused:**

    In the original sim, a user could drag the ball around while the simulation was running but not change the velocity (the velocity controls being hidden).  The behavior of dragging the ball while the simulation is running is not very refined and seems strange, and I see no value in allowing the user to mess with the ball's position during runtime anyway, so I've removed that functionality and have limited interaction with the balls to when the simulation is paused.