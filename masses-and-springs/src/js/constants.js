define(function (require) {

    'use strict';


    var Constants = {}; 
    var colorConstants = {
        'cool-gray' : '#768393'
    };

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2




    /*************************************************************************
     **                                                                     **
     **                        SIM SETTINGS CONSTANTS                       **
     **                                                                     **
     *************************************************************************/
    var SimSettings = {};
    SimSettings.SPEED = [{
            label : '1/16 time',
            value : 0.0625
        }, {
            label : '1/4 time',
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

    SimSettings.FRICTION_STEPS = 11;
    SimSettings.FRICTION_EQUATION = function(step){
        return (0.1*Math.pow(1.5, step)) - 0.1;
    };

    SimSettings.SOFTNESS_STEPS = 11;
    SimSettings.SOFTNESS_EQUATION = function(step){
        return 10*0.18593*Math.pow(1.4, step);
    };

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
    SpringDefaults.STIFFNESS = 10;

    // Appearance related
    SpringDefaults.COLOR = colorConstants['cool-gray'];
    SpringDefaults.COILS = 9;
    SpringDefaults.WIDTH = 50;


    Constants.SpringDefaults = SpringDefaults;






    return Constants;
});
