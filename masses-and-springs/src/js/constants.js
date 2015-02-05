define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.GRAVITATIONAL_ACCELERATION = 9.8; // m/s^2

    Constants.SPEED_SETTINGS = [{
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

    Constants.GRAVITY_SETTINGS = [{
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

    return Constants;
});
