# Deviations from the original PhET simulation **_and the reasons for them_**

Note that I do not list nominal changes like cosmetic differences (e.g., changing the color of the ground).

1. **Framerate increase:**

    The original framerate updates at a lower framerate (20 frames per second).  I've found that it makes the simulation--at least in the new one--look like it's struggling to keep up when in fact it's operating precisely as it should.  People are used to no less than 30 frames per second (fps), or else they think there is something wrong with the application or device.  Games run at 60fps (60Hz), which matches the standard in screen refresh rate, which is 60Hz.  Because the time reported in the stopwatch tool is abstracted away from actual time and is tied to simulation time, the speed at which we run the sim does not matter for accuracy.  A lower speed may have other merits--like being easier to measure--but the perceived performance is more important in my opinion for a good user experience.  The user can always use the step button to make measurement easier.  In the end, I decided to up the framerate from 20fps to 30fps.