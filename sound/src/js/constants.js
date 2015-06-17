define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    // Physical constants
    // The time step is set so that the waves look reasonable on the screen. It is NOT set so that
    // the simulation clock bears any certain relationship to the speed of sound
    Constants.TIME_STEP = 5;
    Constants.WAIT_TIME = 50;

    // The number of pixels a wavefront moves in a time step
    Constants.PROPOGATION_SPEED = 3;
    // Conversion factor needed to scale the clock for measurements. This
    // is based on the propogation speed, the clock's time step, and the
    // size of the ruler graphic that is used to measure waves
    Constants.METERS_PER_PIXEL = 5.0 / 222.0;        // the 5 meter stick is 222 pixels long
    // Speed of sound at room temperature at sea level
    Constants.SPEED_OF_SOUND = 335;
    // Factor to apply to time reported by the simulation clock to get seconds. This gives results
    // that correspond to the speed of sound
    Constants.CLOCK_SCALE_FACTOR = 
        Constants.PROPOGATION_SPEED * (1 / Constants.TIME_STEP) * 
        Constants.METERS_PER_PIXEL  * (1 / Constants.SPEED_OF_SOUND);

    Constants.MAX_FREQUENCY = 1000;
    Constants.DEFAULT_FREQUENCY = 500;
    Constants.MAX_AMPLITUDE = 1;
    Constants.DEFAULT_AMPLITUDE = 0.5;

    // This parameter defines how tightly spaced the waves are on the screen. If it is too small,
    //   the displayed wavelength will not get monotonically shorter as the frequency is raised.
    //   Note that the best value for this is dependent on the clock's dt.
    Constants.FREQUENCY_DISPLAY_FACTOR = 4000;

    return Constants;
});
