define(function (require) {

    'use strict';

    var range   = require('common/math/range');
    var Vector2 =require('common/math/vector2');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var Constants = require('nuclear-physics/constants'); 

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 40;


    /*************************************************************************
     **                                                                     **
     **                       ONE NUCLEUS SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var OneNucleusSimulation = {};

    OneNucleusSimulation.MOVING_NUCLEON_VELOCITY      = 1.0;  // Femtometers per tick.
    OneNucleusSimulation.INITIAL_NUCLEUS_VELOCITY     = 0.05; // Femtometers per tick.
    OneNucleusSimulation.INITIAL_NUCLEUS_ACCELERATION = 0.4;  // Femtometers per tick per tick.

    // Time, in sim milliseconds, from the capture of a neutron until fission occurs.
    OneNucleusSimulation.FISSION_INTERVAL = 1200;

    Constants.OneNucleusSimulation = OneNucleusSimulation;


    return Constants;
});
