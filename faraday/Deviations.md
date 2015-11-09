# Deviations from the original PhET simulation **_and the reasons for them_**

Note that I do not list nominal changes like cosmetic differences (e.g., changing the color of the ground).

1. **Removal of collision detection:**

    The way they handled collisions was annoying while dragging objects because any collision would make the object stop moving until backtracking or releasing and dragging again.  It would have been a lot of extra work to implement it in a better way, so I just decided to remove it.  It was also disabled in the Transformer tab of the original, so I thought it would be better to make it consistent everywhere and just remove it.