define(function (require) {

    'use strict';


    var Constants = {}; 
    var ColorConstants = {
        'cool-gray' : '#6a7686',
        'dark-gray' : '#2d3239',
        'light-gray': '#939daa',
        'pale-orange': '#ef9152',
        'sky-blue'  : '#52b0ef',
        'pale-green': '#7a9d8c',
        'navy-blue' : '#21366b',
        'pale-red'  : '#e15454',
        'pale-blue' : '#549be1',
        'pale-aqua' : '#54e19b'
    };


    Constants.ColorConstants = ColorConstants;

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2



    /*************************************************************************
     **                                                                     **
     **                           SCENE CONSTANTS                           **
     **                                                                     **
     *************************************************************************/

     var Scene = {};
     Scene.DTT = 0.01;  //target time increment in seconds (independent of frame rate)
     Scene.RATE = 1;    //overall time rate: 1 = normal, 0.5 = halfspeed, 0.25 = quarter speed
     Scene.PX_PER_METER = 500;  //scale factor f=500  pixels per meter
     Scene.FPS = 20;    //frames per second of movie
     Scene.FDT = 1/Scene.FPS;   //time increment for free-falling mass
     Scene.SOUNDS_ENABLED = 'high';   //true if sounds enabled; allows user to turn off sounds

     Scene.SHELF_FROM_TOP = 0.95;

     Constants.Scene = Scene;


    /*************************************************************************
     **                                                                     **
     **                        SIM SETTINGS CONSTANTS                       **
     **                                                                     **
     *************************************************************************/
    var SimSettings = {};
    SimSettings.SPEED = [{
            label : '<sup>1</sup>/<sub>16</sub> time',
            value : 0.0625
        }, {
            label : '<sup>1</sup>/<sub>4</sub> time',
            value : 0.25
        }, {
            label : 'Normal',
            value : 1,
            isDefault : true
    }];

    SimSettings.GRAVITY = [{
            label: 'Jupiter',
            value : 2.64 * Constants.GRAVITATIONAL_ACCELERATION
        },{
            label: 'Moon',
            value : Constants.GRAVITATIONAL_ACCELERATION / 6
        },{
            label: 'Earth',
            value : Constants.GRAVITATIONAL_ACCELERATION,
            isDefault : true,
        },{
            label: 'Planet X',
            value : 0.38 * Constants.GRAVITATIONAL_ACCELERATION
        },{
            label: 'g = 0',
            value : 0,
    }];
    SimSettings.GRAVITY_DEFAULT = _.find(SimSettings.GRAVITY, {isDefault: true}).value;

    SimSettings.FRICTION_STEPS = 11;
    SimSettings.FRICTION_EQUATION = function(step){
        return (0.1*Math.pow(1.5, step)) - 0.1;
    };
    SimSettings.FRICTION_STEP_DEFAULT = 5;
    SimSettings.FRICTION_DEFAULT = SimSettings.FRICTION_EQUATION(SimSettings.FRICTION_STEP_DEFAULT);

    SimSettings.LENGTH_STEP = 0.1;
    SimSettings.LENGTH_MIN = 0.5;
    SimSettings.LENGTH_MAX = 2.5;
    SimSettings.DEFAULT_LENGTH = 2;

    SimSettings.MASS_STEP = 0.1;
    SimSettings.MASS_MIN = 0.1;
    SimSettings.MASS_MAX = 2.1;
    SimSettings.DEFAULT_MASS = 1;

    Constants.SimSettings = SimSettings;



    /*************************************************************************
     **                                                                     **
     **                       SIM SYSTEM EQUATIONS                          **
     **                                                                     **
     *************************************************************************/

    var SystemEquations = {};
    SystemEquations.PERIOD = function(mass, springStiffness){
        return 2 * Math.PI * Math.sqrt(mass/springStiffness);
    };
    SystemEquations.KINETIC_ENERGY = function(mass, velocity){
        return 0.5 * mass * velocity * velocity;
    };
    SystemEquations.ELASTIC_POTENTIAL_ENERGY = function(stiffness, deltaY){
        return 0.5 * stiffness * deltaY * deltaY;
    };
    SystemEquations.GRAVITATIONAL_POTENTIAL_ENERGY = function(mass, gravity, yPosOfMass){
        return mass * gravity * yPosOfMass;
    };
    SystemEquations.DELTA_THERMAL = function(deltaDeltaY, mass, frictionConstant, velocity2){
        return deltaDeltaY * mass * frictionConstant * velocity2;
    };
    SystemEquations.TOTAL_ENERGY = function(kinetic, elasticPotential, gravitationalPotential, thermal){
        return kinetic + elasticPotential + gravitationalPotential + thermal;
    };


    SystemEquations.ACCELERATION = function(gravity, stiffness, mass, deltaY, frictionConstant, velocity){
        return gravity - (stiffness / mass) * deltaY - frictionConstant * velocity;
    };
    SystemEquations.VELOCITY2 = function(velocity, acceleration, time){
        return velocity + acceleration * time;
    };
    SystemEquations.DISPLACEMENT = function(velocity, time, acceleration){
        return velocity * time + 0.5 * acceleration * time * time;
    };


    Constants.SystemEquations = SystemEquations;



    /*************************************************************************
     **                                                                     **
     **                       SIM DEFAULT MODEL VALUES                      **
     **                                                                     **
     *************************************************************************/

    var SpringDefaults = {};
    SpringDefaults.REST_L = 0.3;
    SpringDefaults.STIFFNESS = SimSettings.SOFTNESS_DEFAULT;

    // Appearance related
    SpringDefaults.PEG_COLOR = ColorConstants['navy-blue'];
    SpringDefaults.COLOR = ColorConstants['cool-gray'];
    SpringDefaults.COILS = 11;
    SpringDefaults.WIDTH = 0.10;

    SpringDefaults.RING_RADIUS = 0.02;
    SpringDefaults.K_TO_THICKNESS = function(k){
        return 2 + 0.03 * k;
    };


    Constants.SpringDefaults = SpringDefaults;


    var BodyDefaults = {};
    // TODO convert from px to meters
    BodyDefaults.WIDTH_TO_HOOK_RADIUS = function(width){
        return (9 + 0.1 * width)/Scene.PX_PER_METER;
    };
    BodyDefaults.MASS_TO_HEIGHT = function(mass){
        return (30 + 240 * mass)/Scene.PX_PER_METER;
    };
    BodyDefaults.MASS_TO_WIDTH = function(mass){
        return (30 + 160 * mass)/Scene.PX_PER_METER;
    };

    BodyDefaults.COLOR = ColorConstants['light-gray'];

    Constants.BodyDefaults = BodyDefaults;


    return Constants;
});
