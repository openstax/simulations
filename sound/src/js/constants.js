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
    Constants.TIME_STEP = 5 / 1000;
    Constants.WAIT_TIME = 1 / 30;

    // The number of pixels a wavefront moves in a time step
    Constants.PROPAGATION_SPEED = 2;
    // Speed of sound at room temperature at sea level
    Constants.SPEED_OF_SOUND = 335;

    Constants.MAX_FREQUENCY = 1000;
    Constants.DEFAULT_FREQUENCY = 500;
    Constants.MAX_AMPLITUDE = 1;
    Constants.DEFAULT_AMPLITUDE = 0.5;

    // This parameter defines how tightly spaced the waves are on the screen. If it is too small,
    //   the displayed wavelength will not get monotonically shorter as the frequency is raised.
    //   Note that the best value for this is dependent on the clock's dt.
    Constants.FREQUENCY_DISPLAY_FACTOR = 7;


    /*************************************************************************
     **                                                                     **
     **                              WAVEFRONT                              **
     **                                                                     **
     *************************************************************************/

    var Wavefront = {};

    // Number of sample values we keep track of
    Wavefront.SAMPLE_LENGTH = 400; 
    // The length in meters that the sample values span
    Wavefront.LENGTH_IN_METERS = 12;

    Constants.Wavefront = Wavefront;


    /*************************************************************************
     **                                                                     **
     **                            SPEAKER VIEW                             **
     **                                                                     **
     *************************************************************************/

    var SpeakerView = {};

    SpeakerView.HEIGHT_IN_METERS = 4.5;  // Meters
    SpeakerView.WIDTH_IN_METERS  = 1.95; // Meters
    SpeakerView.CONE_MAX_OFFSET_IN_METERS = 0.07; // Meters

    Constants.SpeakerView = SpeakerView;


    return Constants;
});
