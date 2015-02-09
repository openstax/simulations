define(function (require) {

    'use strict';


    var Constants = {}; 

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



    var SystemEquations = {};





    return Constants;
});
