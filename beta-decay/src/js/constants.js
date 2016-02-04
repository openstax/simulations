define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');

    var NucleusType = require('models/nucleus-type');

    var Constants = require('nuclear-physics/constants'); 

    /*************************************************************************
     **                                                                     **
     **                 MULTI-NUCLEUS BETA-DECAY SIMULATION                 **
     **                                                                     **
     *************************************************************************/

    var MultiNucleusBetaDecaySimulation = {};

    // Defaults for the Beta Decay model.  Could parameterize into
    //   constructor some day if necessary.
    MultiNucleusBetaDecaySimulation.MAX_NUCLEI = 99;
    MultiNucleusBetaDecaySimulation.DEFAULT_NUCLEUS_TYPE = NucleusType.HYDROGEN_3;
    
    // Size and position of the bucket of nuclei which the user uses to add
    //   nuclei to the simulation.
    MultiNucleusBetaDecaySimulation.BUCKET_ORIGIN_X = 16;
    MultiNucleusBetaDecaySimulation.BUCKET_ORIGIN_Y = 18;
    MultiNucleusBetaDecaySimulation.BUCKET_WIDTH = 18;
    MultiNucleusBetaDecaySimulation.BUCKET_HEIGHT = MultiNucleusBetaDecaySimulation.BUCKET_WIDTH * 0.65;
    MultiNucleusBetaDecaySimulation.BUCKET_RECT = new Rectangle(
        MultiNucleusBetaDecaySimulation.BUCKET_ORIGIN_X, MultiNucleusBetaDecaySimulation.BUCKET_ORIGIN_Y, 
        MultiNucleusBetaDecaySimulation.BUCKET_WIDTH, MultiNucleusBetaDecaySimulation.BUCKET_HEIGHT
    );

    Constants.MultiNucleusBetaDecaySimulation = MultiNucleusBetaDecaySimulation;


    /*************************************************************************
     **                                                                     **
     **                SINGLE-NUCLEUS BETA-DECAY SIMULATION                 **
     **                                                                     **
     *************************************************************************/

    var SingleNucleusBetaDecaySimulation = {};

    SingleNucleusBetaDecaySimulation.DEFAULT_NUCLEUS_TYPE = NucleusType.HYDROGEN_3;

    Constants.SingleNucleusBetaDecaySimulation = SingleNucleusBetaDecaySimulation;
    

    return Constants;
});
