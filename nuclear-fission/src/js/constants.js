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
    ChainReactionSimulation.MAX_NUCLEUS_RANGE_Y = ChainReactionSimulation.MAX_NUCLEUS_RANGE_X * 0.85;
    ChainReactionSimulation.INTER_NUCLEUS_PROXIMITY_LIMIT = 12;
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
     **                      NUCLEAR REACTOR SIMULATION                     **
     **                                                                     **
     *************************************************************************/

    var NuclearReactorSimulation = {};

    // Constants that control the overall size of the nuclear reactor.  Note
    // that these dimensions are in femtometers in order to be consistent with
    // the nuclei size in this and the other models, but of course a real
    // nuclear reactor would have much larger dimensions.
    NuclearReactorSimulation.OVERALL_REACTOR_WIDTH = 650;
    NuclearReactorSimulation.OVERALL_REACTOR_HEIGHT = NuclearReactorSimulation.OVERALL_REACTOR_WIDTH * 0.42;
    NuclearReactorSimulation.REACTOR_WALL_WIDTH = 20;
    
    // Constant that controls where in model space the reactor resides.  This
    // assumes that the 'center of the world' is at (0,0).  It is shifted
    // slightly to the left to account for the control rod handle on the right
    // hand side.
    NuclearReactorSimulation.REACTOR_POSITION = new Vector2(
        -(NuclearReactorSimulation.OVERALL_REACTOR_WIDTH / 1.9),
        -(NuclearReactorSimulation.OVERALL_REACTOR_HEIGHT / 2)
    );
    
    // Constant that controls the number of chambers, between which are the
    // control rods.  There will always be one less control rod than there are
    // chambers.  It is assumed that the chambers are of equal size.
    NuclearReactorSimulation.NUMBER_OF_REACTION_CHAMBERS = 6;
    
    // Constant that controls the size relationship between the chambers and
    // the control rods.  This is a ratio, and can be though of as
    // (chamber width)/(control rod width).
    NuclearReactorSimulation.CHAMBER_TO_CONTROL_ROD_WIDTH_RATIO = 5;
    
    // Constants that control the initial placement of nuclei within the
    // reaction chambers.
    NuclearReactorSimulation.MIN_DISTANCE_FROM_NUCLEI_TO_WALLS  = 18;
    NuclearReactorSimulation.MIN_INTER_NUCLEI_DISTANCE          = 15;
    
    // Constants that control the behavior of neutrons fired into reaction chambers.
    NuclearReactorSimulation.NUMBER_OF_NEUTRONS_TO_FIRE = 2;
    NuclearReactorSimulation.NEUTRON_VELOCITY = 2;
    
    // Constants that control the behavior of fission products.
    NuclearReactorSimulation.FREED_NEUTRON_VELOCITY = 3;
    NuclearReactorSimulation.DAUGHTER_NUCLEI_SPLIT_DISTANCE = 10;
    
    // Constants that control the monitoring of fission events, which
    // allow us to determine the average energy released.
    NuclearReactorSimulation.MAX_TEMP_CHANGE_PER_TICK = 1.0;
    NuclearReactorSimulation.JOULES_PER_FISSION_EVENT = 3.2E-11;

    // Constants that control the ranges for the graph.  These were set up by
    //   trial and error, but it may make sense to coordinate them with the
    //   nuclear reactor model eventually.
    NuclearReactorSimulation.TOTAL_ENERGY_GRAPH_RANGE = 1.1E-8;
    NuclearReactorSimulation.ENERGY_PER_SECOND_GRAPH_RANGE = 2.5E-9;

    Constants.NuclearReactorSimulation = NuclearReactorSimulation;


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
     **                       CONTAINMENT VESSEL VIEW                       **
     **                                                                     **
     *************************************************************************/

    var ContainmentVesselView = {};

    ContainmentVesselView.CONTAINMENT_VESSEL_THICKNESS = 30;
    ContainmentVesselView.CONTAINMENT_VESSEL_COLOR = '#000';
    ContainmentVesselView.CONTAINMENT_VESSEL_RING_SEGMENTS = 32;
    ContainmentVesselView.CONTAINMENT_VESSEL_HOVER_COLOR = '#fff';

    ContainmentVesselView.ARROW_LENGTH      = 70;
    ContainmentVesselView.ARROW_TAIL_WIDTH  = 30;
    ContainmentVesselView.ARROW_HEAD_WIDTH  = 50;
    ContainmentVesselView.ARROW_HEAD_LENGTH = 30;
    ContainmentVesselView.ARROW_COLOR = '#21366b';
    ContainmentVesselView.ARROW_ANGLE = Math.PI / 4;

    ContainmentVesselView.FRAGMENT_VELOCITY_RANGE = range({ min: 200, max: 500 });
    ContainmentVesselView.MAX_FRAGMENT_SPIN_RATE = Math.PI * 4;

    Constants.ContainmentVesselView = ContainmentVesselView;


    /*************************************************************************
     **                                                                     **
     **                         NUCLEAR REACTOR VIEW                        **
     **                                                                     **
     *************************************************************************/

    var NuclearReactorView = {};

    // Constants that control the look of the reactor.
    NuclearReactorView.REACTOR_WALL_COLOR = '#000';
    NuclearReactorView.CHAMBER_WALL_COLOR = '#796579';
    NuclearReactorView.COOL_REACTOR_CHAMBER_COLOR = '#CAB3CA';
    NuclearReactorView.HOT_REACTOR_CHAMBER_COLOR = '#ffbb44';
    NuclearReactorView.CONTROL_ROD_COLOR = '#655D65';
    NuclearReactorView.CONTROL_ROD_ADJUSTOR_COLOR = '#21366b';
    NuclearReactorView.CONTROL_ROD_ADJUSTOR_HANDLE_COLOR = '#ccc';
    NuclearReactorView.CONTROL_ROD_ADJUSTOR_LABEL_FONT = 'bold 12px Helvetica Neue';
    NuclearReactorView.CONTROL_ROD_ADJUSTOR_LABEL_COLOR = '#fff';
    
    // Max temperature, with used when setting up the thermometer and in
    // in controlling the internal color of the reactor.
    NuclearReactorView.MAX_TEMPERATURE = 75;  // Unitless value.
    
    // Constants that control the position and size of the thermometer.
    NuclearReactorView.THERMOMETER_PROPORTION_FROM_LEFT_SIDE = 0.88;
    NuclearReactorView.THERMOMETER_PROPORTION_ABOVE = 0.18;
    NuclearReactorView.THERMOMETER_WIDTH_PROPORTION = 0.05;
    NuclearReactorView.THERMOMETER_HEIGHT_PROPORTION = 0.40;

    NuclearReactorView.BUTTON_PANEL_WIDTH = 200;
    NuclearReactorView.BUTTON_PANEL_HEIGHT = 48;
    NuclearReactorView.BUTTON_PANEL_BORDER_WIDTH = 4;
    NuclearReactorView.BUTTON_WIDTH = 32;
    NuclearReactorView.BUTTON_LABEL_FONT = '20px Helvetica Neue';
    NuclearReactorView.BUTTON_LABEL_COLOR = '#000';

    Constants.NuclearReactorView = NuclearReactorView;


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
    FissionEnergyChartView.POTENTIAL_LINE_COLOR    = '#583B9C';
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
