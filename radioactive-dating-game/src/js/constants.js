define(function (require) {

    'use strict';

    var range   = require('common/math/range');
    var Vector2 =require('common/math/vector2');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var Constants = require('nuclear-physics/constants'); 

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 40;

    // Preferred distance between nucleus centers when placing them on the canvas.
    Constants.PREFERRED_INTER_NUCLEUS_DISTANCE = 15;  // In femtometers.
    // Minimum distance between the center of a nucleus and a wall or other obstacle.
    Constants.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE = 10;  // In femtometers.


    /*************************************************************************
     **                                                                     **
     **                        HALF-LIFE SIMULATION                         **
     **                                                                     **
     *************************************************************************/

    var HalfLifeSimulation = {};

    HalfLifeSimulation.MAX_NUCLEI = 99;
    HalfLifeSimulation.DEFAULT_NUCLEUS_TYPE = NucleusType.CARBON_14;
    
    // Size and position of the bucket of nuclei which the user uses to add
    //   nuclei to the simulation.
    HalfLifeSimulation.BUCKET_ORIGIN_X = 40;
    HalfLifeSimulation.BUCKET_ORIGIN_Y = 40;
    HalfLifeSimulation.BUCKET_WIDTH = 45;
    HalfLifeSimulation.BUCKET_HEIGHT = HalfLifeSimulation.BUCKET_WIDTH * 0.65;

    Constants.HalfLifeSimulation = HalfLifeSimulation;


    /*************************************************************************
     **                                                                     **
     **                       DECAY RATES SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var DecayRatesSimulation = {};

    DecayRatesSimulation.MAX_NUCLEI = 1000;
    DecayRatesSimulation.DEFAULT_NUCLEUS_TYPE = NucleusType.CARBON_14;
    
    DecayRatesSimulation.PLACEMENT_LOCATION_SEARCH_COUNT = 100;
    DecayRatesSimulation.DEFAULT_MIN_INTER_NUCLEUS_DISTANCE = 10;

    Constants.DecayRatesSimulation = DecayRatesSimulation;


    /*************************************************************************
     **                                                                     **
     **                       MEASUREMENT SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var MeasurementSimulation = {};

    MeasurementSimulation.MODE_TREE = 0;
    MeasurementSimulation.MODE_ROCK = 1;

    // Constants that control the conversion between simulation time (which is
    // essentially real time) and model time, which is often thousands or
    // billions of years in this model.
    MeasurementSimulation.INITIAL_TREE_AGING_RATE = HalfLifeInfo.convertYearsToMs(300) / 1000; // 300 years per second.
    MeasurementSimulation.INITIAL_ROCK_AGING_RATE = HalfLifeInfo.convertDaysToMs(90) / 10000;  // 90 days over 10 seconds - this will be the total eruption time (~3 months). 
    MeasurementSimulation.FINAL_ROCK_AGING_RATE   = HalfLifeInfo.convertYearsToMs(1E9) / 5000; // 1 billion years every 5 seconds.

    MeasurementSimulation.AGING_ROCK_EMISSION_TIME        = 4000; // Simulation milliseconds
    MeasurementSimulation.FLYING_ROCK_EMISSION_INTERVAL   =  300; // Simulation millisecond between emission attempts
    MeasurementSimulation.FLYING_ROCK_EMISSION_DEVIATION  = 0.5;
    MeasurementSimulation.FLYING_ROCK_START_EMISSION_TIME =  800; // Simulation milliseconds
    MeasurementSimulation.FLYING_ROCK_END_EMISSION_TIME   = 5000; // Simulation milliseconds
    MeasurementSimulation.ERUPTION_END_TIME               = 6000; // Simulation milliseconds

    // Constants that control how time accelerates after the volcano has
    // erupted.
    MeasurementSimulation.TIME_ACC_COUNTER_RESET_VAL = 50;
    MeasurementSimulation.TIME_ACC_INCREMENT = (MeasurementSimulation.FINAL_ROCK_AGING_RATE - MeasurementSimulation.INITIAL_ROCK_AGING_RATE) / (Math.pow(2, MeasurementSimulation.TIME_ACC_COUNTER_RESET_VAL) - 1); 

    MeasurementSimulation.VOLCANO_TOP_POSITION = new Vector2(140, 250);
    MeasurementSimulation.VOLCANO_POSITION = new Vector2(140, 210);
    MeasurementSimulation.VOLCANO_WIDTH = 120;
    MeasurementSimulation.VOLCANO_HEIGHT = 112;
    MeasurementSimulation.FLYING_ROCK_WIDTH = 8;
    MeasurementSimulation.INITIAL_AGING_ROCK_WIDTH = 10;
    MeasurementSimulation.INITIAL_ROCK_METER_POSITION = new Vector2(-200, 88);

    MeasurementSimulation.INITIAL_TREE_POSITION = new Vector2(-150, 130);
    MeasurementSimulation.INITIAL_TREE_WIDTH = 60;
    MeasurementSimulation.INITIAL_TREE_METER_POSITION = new Vector2(-150, 100);

    Constants.MeasurementSimulation = MeasurementSimulation;


    /*************************************************************************
     **                                                                     **
     **                        DATING GAME SIMULATION                       **
     **                                                                     **
     *************************************************************************/

    var DatingGameSimulation = {};

    DatingGameSimulation.INITIAL_METER_POSITION = new Vector2(540, 180);
    // Constant that controls how close the user must be to the actual age
    //   of an item to be considered correct.  This is a percentage, and a
    //   value of 0 means the user must be perfectly accurate and a value
    //   of 1 means that they can be off by as much as the value of the age.
    DatingGameSimulation.AGE_GUESS_TOLERANCE_PERCENTAGE = 0.2;

    Constants.DatingGameSimulation = DatingGameSimulation;


    /*************************************************************************
     **                                                                     **
     **                       RADIOMETRIC DATING METER                      **
     **                                                                     **
     *************************************************************************/

    var RadiometricDatingMeter = {};

    RadiometricDatingMeter.OBJECTS = 0;
    RadiometricDatingMeter.AIR = 1;

    Constants.RadiometricDatingMeter = RadiometricDatingMeter;


    /*************************************************************************
     **                                                                     **
     **                        ANIMATED DATABLE ITEM                        **
     **                                                                     **
     *************************************************************************/

    var AnimatedDatableItem = {};

    /**
     * This enum defines the possible states with respect to closure, which
     *   is the time at which the item begins aging radiometrically and its
     *   radioactive elements start decreasing.  For example, if the item is
     *   organic, closure occurs when the item dies.
     */
    AnimatedDatableItem.CLOSURE_NOT_POSSIBLE = 0; // Closure cannot be forced.
    AnimatedDatableItem.CLOSURE_POSSIBLE = 1;     // Closure has not occurred, but could be forced.
    AnimatedDatableItem.CLOSED = 2;               // Closure has occurred.

    Constants.AnimatedDatableItem = AnimatedDatableItem;

    
    /*************************************************************************
     **                                                                     **
     **                             FLYING ROCK                             **
     **                                                                     **
     *************************************************************************/

    var FlyingRock = {};

    FlyingRock.MIN_ARC_HEIGHT_INCREMENT = 0.6;
    FlyingRock.MAX_ARC_HEIGHT_INCREMENT = 1.7;
    FlyingRock.ARC_HEIGHT_INCREMENT_RANGE = range({
        min: FlyingRock.MIN_ARC_HEIGHT_INCREMENT,
        max: FlyingRock.MAX_ARC_HEIGHT_INCREMENT
    });
    FlyingRock.MAX_X_TRANSLATION_INCREMENT = 10;
    FlyingRock.MAX_ROTATION_CHANGE = Math.PI / 10;
    FlyingRock.NUM_FLIGHT_STEPS = 50;
    FlyingRock.FLIGHT_STEP_INTERVAL = HalfLifeInfo.convertHoursToMs(10);

    Constants.FlyingRock = FlyingRock;


    /*************************************************************************
     **                                                                     **
     **                              AGING ROCK                             **
     **                                                                     **
     *************************************************************************/

    var AgingRock = {};

    AgingRock.FLY_COUNT = 50; // Controls how long it takes the rock to fly out and then hit the ground.
    AgingRock.FINAL_X = -150; // Model units
    AgingRock.FINAL_Y = 72;
    AgingRock.FINAL_ROCK_WIDTH = 180; // Model units
    AgingRock.FIRST_PART_ARC_HEIGHT = 200; // Higher for higher arc.
    AgingRock.FIRST_PART_ARC_TIME = 0.4; // Time at which the rock reaches the top of its arc as the percent of total flight time
    AgingRock.ROTATION_PER_STEP = Math.PI * 0.1605; // Controls rate of rotation when flying.
    AgingRock.COOLING_START_PAUSE_STEPS = 50; // Length of pause before after landing & before starting to cool.
    AgingRock.COOLING_STEPS = 100; // Number of steps to cool down.

    Constants.AgingRock = AgingRock;


    /*************************************************************************
     **                                                                     **
     **                               VOLCANO                               **
     **                                                                     **
     *************************************************************************/

    var Volcano = {};

    Volcano.PRE_ERUPTION_INITIAL_AGE = HalfLifeInfo.convertYearsToMs(1E9);

    Constants.Volcano = Volcano;


    /*************************************************************************
     **                                                                     **
     **                              AGING TREE                             **
     **                                                                     **
     *************************************************************************/

    var AgingTree = {};

    AgingTree.FULL_GROWN_TREE_HEIGHT = 400; // Model units
    AgingTree.GROWTH_RATE = 1.03; // High number for faster growth.
    AgingTree.AGE_OF_NATURAL_DEATH = HalfLifeInfo.convertYearsToMs(1000);
    AgingTree.DEATH_COUNT = 30; // Controls how long it takes for tree to die.
    AgingTree.SWAY_COUNT = 30; // Controls how long tree sways before falling over.
    AgingTree.MAX_SWAY_DEFLECTION = 0.01; // In radians, controls amount of sway.
    AgingTree.FALL_COUNT = 30; // Controls how long it takes the tree to fall over.
    AgingTree.FALL_ANGLE_SCALE_FACTOR = Math.PI / (AgingTree.FALL_COUNT * AgingTree.FALL_COUNT);
    AgingTree.BOUNCE_COUNT = 9; // Controls length of bounce after falling.
    AgingTree.BOUNCE_PROPORTION = 0.01; // Controls magnitude of bounds.
    AgingTree.DECOMPOSE_COUNT = 60; // Controls how long it takes for the tree to decompose

    Constants.AgingTree = AgingTree;


    /*************************************************************************
     **                                                                     **
     **                       DECAY RATES GRAPH VIEW                        **
     **                                                                     **
     *************************************************************************/

    var DecayProportionChartView = {};

    DecayProportionChartView.AXIS_LABEL_FONT    = Constants.NucleusDecayChart.AXIS_LABEL_FONT;
    DecayProportionChartView.AXIS_LABEL_COLOR   = Constants.NucleusDecayChart.AXIS_LABEL_COLOR;
    DecayProportionChartView.AXIS_LINE_WIDTH    = Constants.NucleusDecayChart.AXIS_LINE_WIDTH;
    DecayProportionChartView.AXIS_LINE_COLOR    = Constants.NucleusDecayChart.AXIS_LINE_COLOR;
    DecayProportionChartView.BORDER_COLOR       = Constants.NucleusDecayChart.AXIS_LINE_COLOR;
    DecayProportionChartView.BORDER_WIDTH       = 1;
    DecayProportionChartView.BORDER_ALPHA       = 0.7;
    DecayProportionChartView.Y_VALUE_LINE_COLOR = Constants.NucleusDecayChart.AXIS_LINE_COLOR;
    DecayProportionChartView.Y_VALUE_LINE_WIDTH = 1;
    DecayProportionChartView.Y_VALUE_LINE_ALPHA = 0.1;
    DecayProportionChartView.TICK_MARK_LENGTH   = Constants.NucleusDecayChart.TICK_MARK_LENGTH;
    DecayProportionChartView.TICK_MARK_WIDTH    = Constants.NucleusDecayChart.TICK_MARK_WIDTH;
    DecayProportionChartView.TICK_MARK_COLOR    = Constants.NucleusDecayChart.TICK_MARK_COLOR;
    DecayProportionChartView.SMALL_LABEL_FONT   = Constants.NucleusDecayChart.SMALL_LABEL_FONT;
    DecayProportionChartView.LARGE_LABEL_FONT   = Constants.NucleusDecayChart.LARGE_LABEL_FONT;
    DecayProportionChartView.ISOTOPE_FONT_SIZE  = Constants.NucleusDecayChart.ISOTOPE_FONT_SIZE;

    DecayProportionChartView.HALF_LIFE_LINE_WIDTH  = Constants.NucleusDecayChart.HALF_LIFE_LINE_WIDTH;
    DecayProportionChartView.HALF_LIFE_LINE_DASHES = Constants.NucleusDecayChart.HALF_LIFE_LINE_DASHES;
    DecayProportionChartView.HALF_LIFE_LINE_COLOR  = Constants.NucleusDecayChart.HALF_LIFE_LINE_COLOR;
    DecayProportionChartView.HALF_LIFE_LINE_ALPHA  = Constants.NucleusDecayChart.HALF_LIFE_LINE_ALPHA;

    DecayProportionChartView.DECAY_LABEL_COLOR = Constants.NucleusDecayChart.DECAY_LABEL_COLOR;
    DecayProportionChartView.DECAY_LABEL_FONT  = Constants.NucleusDecayChart.DECAY_LABEL_FONT;
    DecayProportionChartView.DECAY_VALUE_FONT  = Constants.NucleusDecayChart.DECAY_VALUE_FONT;

    DecayProportionChartView.POINT_RADIUS = 2;

    Constants.DecayProportionChartView = DecayProportionChartView;


    /*************************************************************************
     **                                                                     **
     **       PRE-POPULATED DATABLE ITEM DECAY PROPORTION CHART VIEW        **
     **                                                                     **
     *************************************************************************/

    var PrePopulatedDatableItemDecayProportionChartView = {};

    PrePopulatedDatableItemDecayProportionChartView.NUM_SAMPLES_ON_DECAY_CHART = 500;
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_MARGIN = 6;
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_WIDTH = 90;
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_HEIGHT = 32;
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_LABEL_FONT = 'bold 10px Helvetica Neue';
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_LABEL_COLOR = '#000';
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_VALUE_FONT = '10px Helvetica Neue';
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_VALUE_COLOR = '#000';
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_BG_COLOR = '#EDF7FF';
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_BG_ALPHA = 1;
    PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_RADIUS = 4;

    PrePopulatedDatableItemDecayProportionChartView.HANDLE_COLOR = '#21366b';
    PrePopulatedDatableItemDecayProportionChartView.HANDLE_DRAGGING_COLOR = '#fff';

    Constants.PrePopulatedDatableItemDecayProportionChartView = PrePopulatedDatableItemDecayProportionChartView;


    /*************************************************************************
     **                                                                     **
     **                            LANDSCAPE VIEW                           **
     **                                                                     **
     *************************************************************************/

    var LandscapeView = {};

    LandscapeView.BACKGROUND_IMAGE_WIDTH = 1600;
    LandscapeView.DEFAULT_BACKGROUND_WIDTH = 1500;
    LandscapeView.SHORT_SCREEN_BACKGROUND_WIDTH = 1060;

    Constants.LandscapeView = LandscapeView;


    /*************************************************************************
     **                                                                     **
     **                          VOLCANO SMOKE VIEW                         **
     **                                                                     **
     *************************************************************************/

    var VolcanoSmokeView = {};

    VolcanoSmokeView.NUM_PARTICLES = 600;
    VolcanoSmokeView.PARTICLE_COLOR = '#ddd';
    VolcanoSmokeView.PARTICLE_SPREAD_ANGLE = Math.PI / 12;
    VolcanoSmokeView.PARTICLE_SPREAD_ANGLE_RANGE = range({ min: -VolcanoSmokeView.PARTICLE_SPREAD_ANGLE / 2, max: VolcanoSmokeView.PARTICLE_SPREAD_ANGLE / 2 }); // radians
    VolcanoSmokeView.PARTICLE_VELOCITY_RANGE = range({ min: 30, max: 80 });
    VolcanoSmokeView.PARTICLE_MAX_ANGULAR_ACCELERATION = 0.34;
    VolcanoSmokeView.PARTICLE_LIFE_SPAN = range({ min: 4, max: 6.0 });
    VolcanoSmokeView.PARTICLE_EMISSION_FREQUENCY = 0.01;
    VolcanoSmokeView.PARTICLE_ALPHA = 0.5;
    VolcanoSmokeView.PARTICLE_FADE_POINT = 0.6;

    Constants.VolcanoSmokeView = VolcanoSmokeView;


    return Constants;
});
