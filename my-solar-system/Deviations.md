# Deviations from the original PhET simulation **_and the reasons for them_**

1. **Showing actual masses in initial settings text-box matrix:**

    I can't seem to find where in their code they round, but when they have a preset mass with a value of 0.000001, the text box shows 0.001, so they somehow round 0.000001 to 0.001.  That's no way to round, and I thought it better just to use the extra screen real estate to show the full 0.000001 so students who rely on those numbers for their understanding or for calculations will get the correct numbers at the correct scale.