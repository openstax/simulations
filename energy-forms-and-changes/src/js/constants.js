define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var Functions = require('common/math/functions');

    var ThermalContactArea = require('models/thermal-contact-area');

    var Constants = {};

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.ROOM_TEMPERATURE           = 296;    // In Kelvin.
    Constants.FREEZING_POINT_TEMPERATURE = 273.15; // In Kelvin.
    Constants.BOILING_POINT_TEMPERATURE  = 373.15; // In Kelvin.

    // Time values for normal and fast-forward motion.
    Constants.FRAMES_PER_SECOND              = 30.0;
    Constants.SIM_TIME_PER_TICK_NORMAL       = 1 / Constants.FRAMES_PER_SECOND;
    Constants.SIM_TIME_PER_TICK_FAST_FORWARD = Constants.SIM_TIME_PER_TICK_NORMAL * 4;
    Constants.MAX_HEAT_EXCHANGE_TIME_STEP    = Constants.SIM_TIME_PER_TICK_NORMAL;

    // Constants used for creating projections that have a 3D-ish look.
    Constants.Z_TO_X_OFFSET_MULTIPLIER = -0.25;
    Constants.Z_TO_Y_OFFSET_MULTIPLIER = -0.25;
    Constants.MAP_Z_TO_XY_OFFSET = function(zValue) {
        return new Vector2(zValue * Constants.Z_TO_X_OFFSET_MULTIPLIER, zValue * Constants.Z_TO_Y_OFFSET_MULTIPLIER);
    };
    Constants.PERSPECTIVE_ANGLE = Math.atan2(-Constants.Z_TO_Y_OFFSET_MULTIPLIER, -Constants.Z_TO_X_OFFSET_MULTIPLIER);
    Constants.PERSPECTIVE_EDGE_PROPORTION = Math.sqrt(
        Math.pow(Constants.Z_TO_X_OFFSET_MULTIPLIER, 2) +
        Math.pow(Constants.Z_TO_Y_OFFSET_MULTIPLIER, 2) 
    );

    // For comparing temperatures.
    Constants.SIGNIFICANT_TEMPERATURE_DIFFERENCE = 1E-3; // In degrees K.

    // Threshold for deciding when two temperatures can be considered equal.
    Constants.TEMPERATURES_EQUAL_THRESHOLD = 1E-6; // In Kelvin.

    /*************************************************************************
     **                                                                     **
     **                      ENERGY CONTAINER CATEGORIES                    **
     **                                                                     **
     *************************************************************************/

    var EnergyContainerCategory =  {
        IRON:  'iron',
        BRICK: 'brick',
        WATER: 'water',
        AIR:   'air'
    };

    Constants.EnergyContainerCategory = EnergyContainerCategory;


    /*************************************************************************
     **                                                                     **
     **                           INTRO SIMULATION                          **
     **                                                                     **
     *************************************************************************/

    var IntroSimulation = {};
    /**
     * Minimum distance allowed between two objects.  This basically prevents
     *   floating point issues.
     */
    IntroSimulation.MIN_INTER_ELEMENT_DISTANCE = 1E-9; // In meters

    /** 
     * Threshold of temperature difference between the bodies in a multi-body
     *   system below which energy can be exchanged with air.
     */
    IntroSimulation.MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE = 2.0; // In degrees K, empirically determined

    // Initial thermometer location, intended to be away from any model objects.
    IntroSimulation.INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

    IntroSimulation.NUM_THERMOMETERS = 3;
    
    IntroSimulation.BEAKER_WIDTH = 0.085; // In meters.
    IntroSimulation.BEAKER_HEIGHT = IntroSimulation.BEAKER_WIDTH * 1.1;

    // Flag that can be turned on in order to print out some profiling info.
    IntroSimulation.ENABLE_INTERNAL_PROFILING = false;

    Constants.IntroSimulation = IntroSimulation;

    var IntroSimulationView = {};

    IntroSimulationView.BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.

    Constants.IntroSimulationView = IntroSimulationView;


    /*************************************************************************
     **                                                                     **
     **                               ELEMENT                               **
     **                                                                     **
     *************************************************************************/

    var ElementView = {};

    ElementView.TEXT_FONT = '32px Arial';

    Constants.ElementView = ElementView;

    /*************************************************************************
     **                                                                     **
     **                                BLOCK                                **
     **                                                                     **
     *************************************************************************/

    var Block = {};
    
    // Height and width of all block surfaces, since it is a cube.
    Block.SURFACE_WIDTH = 0.045; // In meters
    // Number of slices where energy chunks may be placed.
    Block.NUM_ENERGY_CHUNK_SLICES = 4;
    Block.MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.

    Constants.Block = Block;

    var BlockView = {};

    BlockView.PERSPECTIVE_ANGLE = Math.atan2(-Constants.Z_TO_Y_OFFSET_MULTIPLIER, -Constants.Z_TO_X_OFFSET_MULTIPLIER);
    BlockView.PERSPECTIVE_EDGE_PROPORTION = Math.sqrt(
        Math.pow(Constants.Z_TO_X_OFFSET_MULTIPLIER, 2) + Math.pow(Constants.Z_TO_Y_OFFSET_MULTIPLIER, 2) 
    );
    BlockView.LINE_WIDTH = 3;

    Constants.BlockView = BlockView;


    /*************************************************************************
     **                                                                     **
     **                                BRICK                                **
     **                                                                     **
     *************************************************************************/

    var Brick  = {};

    Brick.SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
    Brick.DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.

    // Some constants needed for energy chunk mapping.
    Brick.ENERGY_AT_ROOM_TEMPERATURE = Math.pow(Block.SURFACE_WIDTH, 3) * Brick.DENSITY * Brick.SPECIFIC_HEAT * Constants.ROOM_TEMPERATURE; // In joules.
    Brick.ENERGY_AT_WATER_FREEZING_TEMPERATURE = Math.pow(Block.SURFACE_WIDTH, 3) * Brick.DENSITY * Brick.SPECIFIC_HEAT * Constants.FREEZING_POINT_TEMPERATURE; // In joules.

    Brick.NUM_ENERGY_CHUNKS_AT_FREEZING  = 1.25;
    Brick.NUM_ENERGY_CHUNKS_AT_ROOM_TEMP = 2.4; // Close to rounding to 3 so that little energy needed to transfer a chunk.

    Constants.Brick = Brick;

    var BrickView = {};

    BrickView.TEXT_COLOR = 0x000000;

    Constants.BrickView = BrickView;


    /*************************************************************************
     **                                                                     **
     **                                 IRON                                **
     **                                                                     **
     *************************************************************************/

    var Iron = {};

    Iron.SPECIFIC_HEAT = 450; // In J/kg-K, source = design document.
    Iron.DENSITY = 7800; // In kg/m^3, source = design document

    Constants.Iron = Iron;

    var IronBlockView = {};

    IronBlockView.FILL_COLOR = '#888888';
    IronBlockView.TEXT_COLOR = '#000000';

    Constants.IronBlockView = IronBlockView;


    /*************************************************************************
     **                                                                     **
     **                                BURNER                               **
     **                                                                     **
     *************************************************************************/

    var Burner = {};

    Burner.WIDTH = 0.075; // In meters.
    Burner.HEIGHT = Burner.WIDTH * 1;
    Burner.MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen.
    Burner.CONTACT_DISTANCE = 0.001; // In meters.
    Burner.ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // In meters, empirically chosen.

    //
    Burner.PERSPECTIVE_ANGLE = Math.PI / 4;

    // Because of the way that energy chunks are exchanged between thermal
    //   modeling elements within this simulation, things can end up looking a
    //   bit odd if a burner is turned on with nothing on it.  To account for
    //   this, a separate energy generation rate is used when a burner is
    //   exchanging energy directly with the air.
    Burner.MAX_ENERGY_GENERATION_RATE_INTO_AIR = Burner.MAX_ENERGY_GENERATION_RATE * 0.3; // joules/sec, multiplier empirically chosen.

    Constants.Burner = Burner;


    /*************************************************************************
     **                                                                     **
     **                                BEAKER                               **
     **                                                                     **
     *************************************************************************/

    var Beaker = {};

    Beaker.MATERIAL_THICKNESS = 0.001; // In meters.
    Beaker.NUM_SLICES = 6;
    Beaker.STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.

    // Constants that control the nature of the fluid in the beaker.
    Beaker.WATER_SPECIFIC_HEAT = 3000; // In J/kg-K.  The real value for water is 4186, but this was adjusted so that there
                                       //   aren't too many chunks and so that a chunk is needed as soon as heating starts.
    Beaker.WATER_DENSITY = 1000.0; // In kg/m^3, source = design document (and common knowledge).
    Beaker.INITIAL_FLUID_LEVEL = 0.5;

    Constants.Beaker = Beaker;

    var BeakerView = {};

    BeakerView.LINE_COLOR = '#cccccc';
    BeakerView.LINE_WIDTH = 3;
    BeakerView.PERSPECTIVE_PROPORTION = -Constants.Z_TO_Y_OFFSET_MULTIPLIER;
    BeakerView.TEXT_FONT = '32px Arial';
    BeakerView.SHOW_MODEL_RECT = false;
    BeakerView.FILL_COLOR = '#cccccc';
    BeakerView.FILL_ALPHA = 0.4;

    Constants.BeakerView = BeakerView;

    var WaterView = {};

    WaterView.WATER_FILL_COLOR = '#afeeee';
    WaterView.WATER_FILL_ALPHA = 0.75;
    WaterView.WATER_LINE_COLOR = '#91c7c7';
    WaterView.WATER_LINE_WIDTH = 2;
    WaterView.STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is visible.
    WaterView.STEAM_BUBBLE_SPEED_RANGE = { min: 100, max: 125 }; // In screen coords (basically pixels) per second.
    WaterView.STEAM_BUBBLE_DIAMETER_RANGE = { min: 20, max: 50 }; // In screen coords (basically pixels).
    WaterView.MAX_STEAM_BUBBLE_HEIGHT = 300;
    WaterView.STEAM_BUBBLE_PRODUCTION_RATE_RANGE = { min: 20, max: 40 }; // Bubbles per second.
    WaterView.STEAM_BUBBLE_GROWTH_RATE = 0.2; // Proportion per second.
    WaterView.MAX_STEAM_BUBBLE_OPACITY = 0.7; // Proportion, 1 is max.

    Constants.WaterView = WaterView;

    /*************************************************************************
     **                                                                     **
     **                                BURNER                               **
     **                                                                     **
     *************************************************************************/

    var BurnerStandView = {};
    // Constants that control some aspect of appearance.  These can be made
    // into constructor params if it is ever desirable to do so.
    // BurnerStandView.BURNER_STAND_STROKE = new BasicStroke( 4, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL );
    // BurnerStandView.BURNER_STAND_STROKE_COLOR = Color.BLACK;
    BurnerStandView.PERSPECTIVE_ANGLE = Math.PI / 4; // Positive is counterclockwise, a value of 0 produces a non-skewed rectangle.

    Constants.BurnerStandView = BurnerStandView;


    /*************************************************************************
     **                                                                     **
     **                                 AIR                                 **
     **                                                                     **
     *************************************************************************/

    var Air = {};
    // 2D size of the air.  It is sized such that it will extend off the left,
    // right, and top edges of screen for the most common aspect ratios of the
    // view.
    Air.WIDTH  = 0.7; 
    Air.HEIGHT = 0.3;

    // The thickness of the slice of air being modeled.  This is basically the
    // z dimension, and is used solely for volume calculations.
    Air.DEPTH = 0.1; // In meters.

    // Constants that define the heat carrying capacity of the air.
    Air.SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
    Air.DENSITY = 10; // In kg/m^3, far denser than real air, done to make things cool faster.

    // Derived constants.
    Air.VOLUME = Air.WIDTH * Air.HEIGHT * Air.DEPTH;
    Air.MASS = Air.VOLUME * Air.DENSITY;
    Air.INITIAL_ENERGY = Air.MASS * Air.SPECIFIC_HEAT * Constants.ROOM_TEMPERATURE;
    Air.THERMAL_CONTACT_AREA = new ThermalContactArea(new Rectangle(-Air.WIDTH / 2, 0, Air.WIDTH, Air.HEIGHT), true);

    Constants.Air = Air;


    /*************************************************************************
     **                                                                     **
     **                            ENERGY CHUNKS                            **
     **                                                                     **
     *************************************************************************/

    // Constant used by all of the "energy systems" in order to keep the amount
    // of energy generated, converted, and consumed consistent.
    Constants.MAX_ENERGY_PRODUCTION_RATE = 10000; // In joules/sec.

    // Model-view transform scale factor for Energy Systems tab.
    Constants.ENERGY_SYSTEMS_MVT_SCALE_FACTOR = 2200;

    // Constants that control the speed of the energy chunks
    Constants.ENERGY_CHUNK_VELOCITY = 0.04; // In meters/sec.

    // Constant function for energy chunk mapping. The basis for this function
    // is that the brick has 2 energy chunks at room temp, one at the freezing
    // point of water.
    Constants.MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE = Functions.createLinearFunction(
        Brick.ENERGY_AT_WATER_FREEZING_TEMPERATURE,
        Brick.ENERGY_AT_ROOM_TEMPERATURE,
        Brick.NUM_ENERGY_CHUNKS_AT_FREEZING,
        Brick.NUM_ENERGY_CHUNKS_AT_ROOM_TEMP
    ).createInverse();

    Constants.ENERGY_TO_NUM_CHUNKS_MAPPER = function(energy) {
        return Math.max(Math.round(Constants.MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE( energy )), 0);
    };

    Constants.ENERGY_PER_CHUNK = Constants.MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE( 2 ) - Constants.MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE( 1 );

    var EnergyChunkView = {};
    
    EnergyChunkView.Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters.
    EnergyChunkView.WIDTH = 24; // In screen coords, which is close to pixels.

    Constants.EnergyChunkView = EnergyChunkView;
    

    /*************************************************************************
     **                                                                     **
     **                       ENERGY CHUNK DISTRIBUTOR                      **
     **                                                                     **
     *************************************************************************/

    var EnergyChunkDistributor = {};

    EnergyChunkDistributor.OUTSIDE_CONTAINER_FORCE = 0.01; // In Newtons, empirically determined.
    EnergyChunkDistributor.ZERO_VECTOR = new Vector2(0, 0);

    // Parameters that can be adjusted to change they nature of the redistribution.
    EnergyChunkDistributor.MAX_TIME_STEP = 5E-3;         // In seconds, for algorithm that moves the points.
    EnergyChunkDistributor.ENERGY_CHUNK_MASS = 1E-3;     // In kilograms, chosen arbitrarily.
    EnergyChunkDistributor.FLUID_DENSITY = 1000;         // In kg / m ^ 3, same as water, used for drag.
    EnergyChunkDistributor.ENERGY_CHUNK_DIAMETER = 1E-3; // In meters, chosen empirically.
    EnergyChunkDistributor.ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow(EnergyChunkDistributor.ENERGY_CHUNK_DIAMETER, 2); // Treat energy chunk as if it is shaped like a sphere.
    EnergyChunkDistributor.DRAG_COEFFICIENT = 500;       // Unitless, empirically chosen.

    // Thresholds for deciding whether or not to perform redistribution. These value
    //   should be chosen such that particles spread out, then stop all movement.
    EnergyChunkDistributor.REDISTRIBUTION_THRESHOLD_ENERGY = 1E-4; // In joules, I think.

    Constants.EnergyChunkDistributor = EnergyChunkDistributor;


    /*************************************************************************
     **                                                                     **
     **                    ENERGY CHUNK WANDER CONTROLLER                   **
     **                                                                     **
     *************************************************************************/

    var EnergyChunkWanderController = {};

    EnergyChunkWanderController.MIN_VELOCITY = 0.06; // In m/s.
    EnergyChunkWanderController.MAX_VELOCITY = 0.10; // In m/s.
    EnergyChunkWanderController.MIN_TIME_IN_ONE_DIRECTION = 0.4;
    EnergyChunkWanderController.MAX_TIME_IN_ONE_DIRECTION = 0.8;
    EnergyChunkWanderController.DISTANCE_AT_WHICH_TO_STOP_WANDERING = 0.05; // In meters, empirically chosen.
    EnergyChunkWanderController.MAX_ANGLE_VARIATION = Math.PI * 0.2; // Max deviation from angle to destination, in radians, empirically chosen.

    Constants.EnergyChunkWanderController = EnergyChunkWanderController;


    /*************************************************************************
     **                                                                     **
     **                            HEAT TRANSFER                            **
     **                                                                     **
     *************************************************************************/

    /**
     * Constants that control the rate of heat transfer between the various 
     * elements that can contain heat and maps for looking up transfer
     * rates for any two model elements that are capable of exchanging heat.
     *
     * @author John Blanco
     */
    var HeatTransfer = {
        // Heat transfer values.  NOTE: Originally, these were constants, but the
        // design team requested that they be changeable via a developer control,
        // which is why they are now properties.
        BRICK_IRON_HEAT_TRANSFER_FACTOR:             1000,
        BRICK_WATER_HEAT_TRANSFER_FACTOR:            1000,
        BRICK_AIR_HEAT_TRANSFER_FACTOR:              50,
        IRON_WATER_HEAT_TRANSFER_FACTOR:             1000,
        IRON_AIR_HEAT_TRANSFER_FACTOR:               50,
        WATER_AIR_HEAT_TRANSFER_FACTOR:              50,
        AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR: 10000
    };

    // Maps for obtaining transfer constants for a given thermal element.
    var HEAT_TRANSFER_FACTORS_FOR_BRICK = {};
    HEAT_TRANSFER_FACTORS_FOR_BRICK[EnergyContainerCategory.IRON]  = HeatTransfer.BRICK_IRON_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_BRICK[EnergyContainerCategory.WATER] = HeatTransfer.BRICK_WATER_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_BRICK[EnergyContainerCategory.AIR]   = HeatTransfer.BRICK_AIR_HEAT_TRANSFER_FACTOR;

    var HEAT_TRANSFER_FACTORS_FOR_IRON = {};
    HEAT_TRANSFER_FACTORS_FOR_IRON[EnergyContainerCategory.BRICK] = HeatTransfer.BRICK_IRON_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_IRON[EnergyContainerCategory.WATER] = HeatTransfer.BRICK_WATER_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_IRON[EnergyContainerCategory.AIR]   = HeatTransfer.BRICK_AIR_HEAT_TRANSFER_FACTOR;

    var HEAT_TRANSFER_FACTORS_FOR_WATER = {};
    HEAT_TRANSFER_FACTORS_FOR_WATER[EnergyContainerCategory.BRICK] = HeatTransfer.BRICK_WATER_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_WATER[EnergyContainerCategory.IRON]  = HeatTransfer.IRON_WATER_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_WATER[EnergyContainerCategory.AIR]   = HeatTransfer.WATER_AIR_HEAT_TRANSFER_FACTOR;

    var HEAT_TRANSFER_FACTORS_FOR_AIR = {};
    HEAT_TRANSFER_FACTORS_FOR_AIR[EnergyContainerCategory.BRICK] = HeatTransfer.BRICK_AIR_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_AIR[EnergyContainerCategory.IRON]  = HeatTransfer.IRON_AIR_HEAT_TRANSFER_FACTOR;
    HEAT_TRANSFER_FACTORS_FOR_AIR[EnergyContainerCategory.WATER] = HeatTransfer.WATER_AIR_HEAT_TRANSFER_FACTOR;

    var CONTAINER_CATEGORY_MAP = {};
    CONTAINER_CATEGORY_MAP[EnergyContainerCategory.BRICK] = HEAT_TRANSFER_FACTORS_FOR_BRICK;
    CONTAINER_CATEGORY_MAP[EnergyContainerCategory.IRON]  = HEAT_TRANSFER_FACTORS_FOR_IRON;
    CONTAINER_CATEGORY_MAP[EnergyContainerCategory.WATER] = HEAT_TRANSFER_FACTORS_FOR_WATER;
    CONTAINER_CATEGORY_MAP[EnergyContainerCategory.AIR]   = HEAT_TRANSFER_FACTORS_FOR_AIR;

    HeatTransfer.CONTAINER_CATEGORY_MAP = CONTAINER_CATEGORY_MAP;

    HeatTransfer.getHeatTransferFactor = function(container1, container2) {
        return this.CONTAINER_CATEGORY_MAP[container1][container2];
    };

    Constants.HeatTransfer = HeatTransfer;

    return Constants;
});
