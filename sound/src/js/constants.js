define(function (require) {

    'use strict';


    var Constants = {}; 


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
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    // The number of steps a wavefront moves in a simulation time step
    Constants.PROPAGATION_SPEED = 2; // Wavefront units per step
    // The length in meters of every step in a wavefront
    Constants.METERS_PER_SAMPLE_UNIT = Wavefront.LENGTH_IN_METERS / Wavefront.SAMPLE_LENGTH;
    // Speed of sound at room temperature at sea level
    Constants.SPEED_OF_SOUND = 335;

    // The delta time per step is set so that the waves look reasonable on the
    //   screen. It is NOT set so that the simulation clock bears any certain
    //   relationship to the speed of sound - PhET
    Constants.DT_PER_FRAME = 5 / 1000;
    Constants.FRAME_DURATION = 1 / 30;

    // I've decided to calculate this a different way, since our scale of px per
    //   meters is different depending on the window size.  Because the desired
    //   end result is to have a propagation speed that matches the speed of
    //   sound (the actual speed of propagation, which would be in meters per
    //   second, vs our PROPAGATION_SPEED, which is in units per step), we need
    //   to find a scale factor that reconciles those terms.  The resulting scale
    //   factor, then, will actually be in sim seconds, which is different from
    //   real seconds, since we use a fixed delta time that doesn't have to
    //   match real seconds based on the frame duration.  We use this equation
    //   to find that scale:
    //
    //   (Note that a unit is relative to the wavefront.)
    //   (Units are given in []; for example [m] is meters.)
    //
    //   let P  = propagation speed in wavefront units per step
    //   let M  = meters per wavefront unit
    //   let c  = speed of sound in meters per second
    //   let dt = delta time per step
    //   find Scale
    //
    //    c[m] =   P[u]  *  M[m]  *  1 [step]  * Scale
    //   ------   ------   ------   ----------
    //     [s]    [step]     [u]      dt [s]
    //
    //   You can see that the units all match up.
    //   We then rearrange that to solve for Scale.
    //
    //                                                               - Patrick
    //
    var SIM_TIME_REPORTING_SCALE = Constants.PROPAGATION_SPEED * Constants.METERS_PER_SAMPLE_UNIT * (1 / Constants.DT_PER_FRAME) * (1 / Constants.SPEED_OF_SOUND);
    var FRAMES_PER_SECOND = 1 / Constants.FRAME_DURATION;
    var SIM_SECONDS_PER_SECOND = Constants.DT_PER_FRAME * FRAMES_PER_SECOND;
    Constants.TIME_REPORTING_SCALE = SIM_TIME_REPORTING_SCALE * SIM_SECONDS_PER_SECOND;

    Constants.MIN_FREQUENCY =    0;    // Herz 
    Constants.MAX_FREQUENCY = 1000;    // Herz
    Constants.DEFAULT_FREQUENCY = 500; // Herz

    Constants.MIN_AMPLITUDE = 0;
    Constants.MAX_AMPLITUDE = 1;
    Constants.DEFAULT_AMPLITUDE = 0.5;

    Constants.MIN_WALL_ANGLE = 10;     // Degrees
    Constants.MAX_WALL_ANGLE = 90;     // Degrees
    Constants.DEFAULT_WALL_ANGLE = 60; // Degrees

    Constants.MIN_WALL_POSITION = 0;     // Meters
    Constants.MAX_WALL_POSITION = 9.9;   // Meters
    Constants.DEFAULT_WALL_POSITION = 4; // Meters

    // This parameter defines how tightly spaced the waves are on the screen.
    //   If it is too small, the displayed wavelength will not get monotonic-
    //   ally shorter as the frequency is raised. Note that the best value for
    //   this is dependent on the clock's dt.
    Constants.FREQUENCY_DISPLAY_FACTOR = 4.5;

    Constants.DEFAULT_LISTENER_X = 5.9; // Meters
    Constants.DEFAULT_LISTENER_Y = 0;   // Meters


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


    /*************************************************************************
     **                                                                     **
     **                            LISTENER VIEW                            **
     **                                                                     **
     *************************************************************************/

    var ListenerView = {};

    ListenerView.HEIGHT_IN_METERS = 3;   // Meters
    ListenerView.MIN_X_IN_METERS  = 2.5; // Meters
    ListenerView.MAX_X_IN_METERS = 10;   // Meters

    Constants.ListenerView = ListenerView;


    /*************************************************************************
     **                                                                     **
     **                            SPEAKER VIEW                             **
     **                                                                     **
     *************************************************************************/

    var BoxView = {};

    BoxView.HEIGHT_IN_METERS = 7.161290322580646; // Meters
    BoxView.WIDTH_IN_METERS  = 4; // Meters
    BoxView.LEFT_OFFSET_IN_METERS = -1; // Meters

    var rightOffset = BoxView.WIDTH_IN_METERS + BoxView.LEFT_OFFSET_IN_METERS;
    var startAngleXOffset = rightOffset;
    var startAngleYOffset = -BoxView.HEIGHT_IN_METERS / 2;
    var radius = Math.sqrt(Math.pow(startAngleXOffset, 2) + Math.pow(startAngleYOffset, 2));
    BoxView.RADIUS_IN_METERS = radius; // Meters

    BoxView.TRANSITION_TIME = 20; // Seconds
    BoxView.DENSITY_CHANGE_PER_SECOND = 1 / BoxView.TRANSITION_TIME;

    Constants.BoxView = BoxView;


    return Constants;
});
