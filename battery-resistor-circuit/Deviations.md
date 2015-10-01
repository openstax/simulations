# Deviations from the original PhET simulation **_and the reasons for them_**

Note that I do not list nominal changes like cosmetic differences (e.g., changing the color of the ground).

1. **Increasing the size of the highlighting ellipses for the voltage calculation overlay:**

    The ellipse doesn't circle the entire right or left wire, which is what it's actually counting.  When I look at the original, I sit there and count the circled electrons and conclude that they don't add up, and this confuses me.  I imagine the users would do the same, so I'm changing it to circle the entire left wire or entire right wire.