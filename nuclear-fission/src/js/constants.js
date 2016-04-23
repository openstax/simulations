define(function (require) {

    'use strict';

    var range     = require('common/math/range');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

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


    /*************************************************************************
     **                                                                     **
     **                      CHAIN REACTION SIMULATION                      **
     **                                                                     **
     *************************************************************************/

    var ChainReactionSimulation = {};

    // Constants that control the range within the model where nuclei may be
    //   initially located.
    ChainReactionSimulation.MAX_NUCLEUS_RANGE_X = 400;
    ChainReactionSimulation.MAX_NUCLEUS_RANGE_Y = ChainReactionSimulation.MAX_NUCLEUS_RANGE_X * 0.75;
    ChainReactionSimulation.INTER_NUCLEUS_PROXIMITRY_LIMIT = 12;
    ChainReactionSimulation.INITIAL_CONTAINMENT_VESSEL_RADIUS = ChainReactionSimulation.MAX_NUCLEUS_RANGE_X / 6;
    ChainReactionSimulation.CONTAINMENT_VESSEL_MARGIN = 12;

    // Constants that control the position of the neutron source.
    ChainReactionSimulation.NEUTRON_SOURCE_POSITION = new Vector2(-50, 0);

    // Constant rect that defines a space around the neutron source where
    //   nuclei cannot initially be located.  This is just tweaked until
    //   things look right.
    ChainReactionSimulation.NEUTRON_SOURCE_OFF_LIMITS_RECT = new Rectangle(
        ChainReactionSimulation.NEUTRON_SOURCE_POSITION.x - 70, 
        ChainReactionSimulation.NEUTRON_SOURCE_POSITION.y - 20, 
        80, 
        50
    );

    // Constants that control the behavior of fission products.
    ChainReactionSimulation.FREED_NEUTRON_VELOCITY = 3;
    ChainReactionSimulation.INITIAL_DAUGHTER_NUCLEUS_VELOCITY = 0;
    ChainReactionSimulation.DAUGHTER_NUCLEUS_ACCELERATION = 0.2;

    // Constants for impact of collisions with containment vessel, arbitrary
    //   values empirically determined.
    ChainReactionSimulation.NEUTRON_COLLISION_IMPACT = 1;
    ChainReactionSimulation.NUCLEUS_COLLISION_IMPACT = 10;

    // Constants for convenience and optimization.
    ChainReactionSimulation.ZERO_ACCELERATION = new Vector2(0, 0);
    ChainReactionSimulation.INITIAL_NEUTRON_SOURCE_ANGLE = -0.07;

    Constants.ChainReactionSimulation = ChainReactionSimulation;


    /*************************************************************************
     **                                                                     **
     **                          CONTAINMENT VESSEL                         **
     **                                                                     **
     *************************************************************************/

    var ContainmentVessel = {};

    ContainmentVessel.CONTAINMENT_RANGE = 10;  // In femtometers.
    ContainmentVessel.APERTURE_HEIGHT = 18;    // In femtometers.
    ContainmentVessel.APERTURE_WIDTH = ContainmentVessel.CONTAINMENT_RANGE * 2.0;  // In femtometers.
    ContainmentVessel.MINIMUM_RADIUS = 15;
    
    // The following value controls how many impacts must occur to cause the
    //   containment vessel to explode.  The goal, as prescribed by the educators,
    //   is that explosion won't occur unless the containment vessel is enlarged
    //   somewhat.
    ContainmentVessel.CONTAINMENT_EXPLOSION_THRESHOLD = 1200;

    Constants.ContainmentVessel = ContainmentVessel;


    /*************************************************************************
     **                                                                     **
     **                      FISSION ENERGY CHART VIEW                      **
     **                                                                     **
     *************************************************************************/

    var FissionEnergyChartView = {};

    FissionEnergyChartView.AXIS_LABEL_FONT  = Constants.NucleusDecayChart.AXIS_LABEL_FONT;
    FissionEnergyChartView.AXIS_LABEL_COLOR = Constants.NucleusDecayChart.AXIS_LABEL_COLOR;
    FissionEnergyChartView.AXIS_LINE_WIDTH  = Constants.NucleusDecayChart.AXIS_LINE_WIDTH;
    FissionEnergyChartView.AXIS_LINE_COLOR  = Constants.NucleusDecayChart.AXIS_LINE_COLOR;
    FissionEnergyChartView.TICK_MARK_LENGTH = 6;
    FissionEnergyChartView.TICK_MARK_WIDTH  = Constants.NucleusDecayChart.TICK_MARK_WIDTH;
    FissionEnergyChartView.TICK_MARK_COLOR  = Constants.NucleusDecayChart.TICK_MARK_COLOR;
    FissionEnergyChartView.SMALL_LABEL_FONT = Constants.NucleusDecayChart.SMALL_LABEL_FONT;
    FissionEnergyChartView.LARGE_LABEL_FONT = Constants.NucleusDecayChart.LARGE_LABEL_FONT;

    FissionEnergyChartView.DECAY_LABEL_COLOR = Constants.NucleusDecayChart.DECAY_LABEL_COLOR
    FissionEnergyChartView.DECAY_LABEL_FONT  = Constants.NucleusDecayChart.DECAY_LABEL_FONT
    FissionEnergyChartView.DECAY_VALUE_FONT  = Constants.NucleusDecayChart.DECAY_VALUE_FONT

    FissionEnergyChartView.LINE_WIDTH = 2;
    FissionEnergyChartView.LINE_ALPHA = 1;
    FissionEnergyChartView.POTENTIAL_LINE_COLOR    = '#00f';
    FissionEnergyChartView.TOTAL_ENERGY_LINE_COLOR = '#ff0';

    FissionEnergyChartView.LEGEND_WIDTH = 160;
    FissionEnergyChartView.LEGEND_HEIGHT = 60;
    FissionEnergyChartView.LEGEND_Y = 34;
    FissionEnergyChartView.LEGEND_LABEL_FONT = 'bold 12px Helvetica Neue';
    FissionEnergyChartView.LEGEND_LABEL_COLOR = '#000';

    // Important Note: The Y-axis of this graph is not using real units,
    //   such as MeV, because if it did the proportions would be too hard
    //   to see.  It is thus "hollywooded" to look correct. The following
    //   constants control the scale of the Y-axis and the important
    //   points within the graph in the Y dimension.
    FissionEnergyChartView.Y_AXIS_TOTAL_POSITVE_SPAN = 100;
    FissionEnergyChartView.BOTTOM_OF_ENERGY_WELL = 65;
    FissionEnergyChartView.PEAK_OF_ENERGY_WELL = 80;
    
    // Constants the control dynamic chart behavior.
    FissionEnergyChartView.NUM_UPWARD_STEPS_FOR_NUCLEUS = 5;
    
    // Possible state values for tracking the relevant state of the model.
    FissionEnergyChartView.STATE_IDLE = 0;
    FissionEnergyChartView.STATE_FISSIONING = 1;
    FissionEnergyChartView.STATE_FISSIONED = 2;

    Constants.FissionEnergyChartView = FissionEnergyChartView;



    return Constants;
});
