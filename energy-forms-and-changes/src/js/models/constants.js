define(function (require) {

    'use strict';

    var Functions               = require('common/functions');
    var Vector2                 = require('vector2-node');
    var EnergyContainerCategory = require('models/energy-container-category');
    var Brick                   = require('models/element/brick');

    var Constants = {};

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

    // For comparing temperatures.
    Constants.SIGNIFICANT_TEMPERATURE_DIFFERENCE = 1E-3; // In degrees K.


    // Block
    // -------------------------------------------------------
    Constants.Block = {};
    // Height and width of all block surfaces, since it is a cube.
    Constants.Block.SURFACE_WIDTH = 0.045; // In meters
    // Number of slices where energy chunks may be placed.
    Constants.Block.NUM_ENERGY_CHUNK_SLICES = 4;
    Constants.Block.MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.

    // Brick
    // -------------------------------------------------------
    Constants.Brick = {};
    Constants.Brick.SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
    Constants.Brick.DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.

    // Some constants needed for energy chunk mapping.
    Constants.Brick.ENERGY_AT_ROOM_TEMPERATURE = Math.pow(Constants.Block.SURFACE_WIDTH, 3) * Constants.Brick.DENSITY * Constants.Brick.SPECIFIC_HEAT * Constants.ROOM_TEMPERATURE; // In joules.
    Constants.Brick.ENERGY_AT_WATER_FREEZING_TEMPERATURE = Math.pow(Constants.Block.SURFACE_WIDTH, 3) * Constants.Brick.DENSITY * Constants.Brick.SPECIFIC_HEAT * Constants.FREEZING_POINT_TEMPERATURE; // In joules.

    Constants.Brick.NUM_ENERGY_CHUNKS_AT_FREEZING  = 1.25;
    Constants.Brick.NUM_ENERGY_CHUNKS_AT_ROOM_TEMP = 2.4; // Close to rounding to 3 so that little energy needed to transfer a chunk.


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
        return Math.max(Math.round(MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE( energy )), 0);
    };

    Constants.ENERGY_PER_CHUNK = Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE( 2 ) - Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE( 1 );

    // Threshold for deciding when two temperatures can be considered equal.
    Constants.TEMPERATURES_EQUAL_THRESHOLD = 1E-6; // In Kelvin.

    // Constant used by all of the "energy systems" in order to keep the amount
    // of energy generated, converted, and consumed consistent.
    Constants.MAX_ENERGY_PRODUCTION_RATE = 10000; // In joules/sec.

    // Colors that are used in multiple places.
    // Constants.NOMINAL_WATER_OPACITY = 0.75f;
    // Constants.WATER_COLOR_OPAQUE = new Color( 175, 238, 238 );
    // Constants.WATER_COLOR_IN_BEAKER = new Color( 175, 238, 238, (int) ( Math.round( Constants.NOMINAL_WATER_OPACITY * 255 ) ) );
    // Constants.FIRST_TAB_BACKGROUND_COLOR = new Color( 245, 235, 175 );
    // Constants.SECOND_TAB_BACKGROUND_COLOR = Constants.FIRST_TAB_BACKGROUND_COLOR;
    // Constants.CONTROL_PANEL_BACKGROUND_COLOR = new Color( 199, 229, 199 ); // Pale gray green.  JB, NP, and AP voted on this as a fave.  Maybe too close to water though.
    // Constants.CONTROL_PANEL_OUTLINE_STROKE = new BasicStroke( 1.5f );
    // Constants.CONTROL_PANEL_OUTLINE_COLOR = Color.BLACK;
    // Constants.CLOCK_CONTROL_BACKGROUND_COLOR = new Color( 120, 120, 120 );

    // Model-view transform scale factor for Energy Systems tab.
    Constants.ENERGY_SYSTEMS_MVT_SCALE_FACTOR = 2200;

    // Constants that control the speed of the energy chunks
    Constants.ENERGY_CHUNK_VELOCITY = 0.04; // In meters/sec.
    
    /**
     * Class containing the constants that control the rate of heat transfer
     * between the various model elements that can contain heat, as well as methods
     * for obtaining the heat transfer value for any two model elements that are
     * capable of exchanging heat.
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
    }

    // Maps for obtaining transfer constants for a given thermal element.
    HeatTransfer.CONTAINER_CATEGORY_MAP = {
        HEAT_TRANSFER_FACTORS_FOR_BRICK: {
            EnergyContainerCategory.IRON:  HeatTransfer.BRICK_IRON_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.WATER: HeatTransfer.BRICK_WATER_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.AIR:   HeatTransfer.BRICK_AIR_HEAT_TRANSFER_FACTOR
        },
        HEAT_TRANSFER_FACTORS_FOR_IRON: {
            EnergyContainerCategory.BRICK: HeatTransfer.BRICK_IRON_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.WATER: HeatTransfer.BRICK_WATER_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.AIR:   HeatTransfer.BRICK_AIR_HEAT_TRANSFER_FACTOR
        },
        HEAT_TRANSFER_FACTORS_FOR_WATER: {
            EnergyContainerCategory.BRICK: HeatTransfer.BRICK_WATER_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.IRON:  HeatTransfer.IRON_WATER_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.AIR:   HeatTransfer.WATER_AIR_HEAT_TRANSFER_FACTOR
        },
        HEAT_TRANSFER_FACTORS_FOR_AIR: {
            EnergyContainerCategory.BRICK: HeatTransfer.BRICK_AIR_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.IRON:  HeatTransfer.IRON_AIR_HEAT_TRANSFER_FACTOR,
            EnergyContainerCategory.WATER: HeatTransfer.WATER_AIR_HEAT_TRANSFER_FACTOR
        }
    };

    HeatTransfer.getHeatTransferFactor = function(container1, container2) {
        return this.CONTAINER_CATEGORY_MAP[container1][container2];
    };

    Constants.HeatTransfer = HeatTransfer;

    return Constants;
});
