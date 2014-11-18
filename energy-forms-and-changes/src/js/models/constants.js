define(function (require) {

    'use strict';

    var Functions               = require('common/functions');
    var Vector2                 = require('vector2-node');
    var EnergyContainerCategory = require('models/energy-container-category');

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

    // For comparing temperatures.
    Constants.SIGNIFICANT_TEMPERATURE_DIFFERENCE = 1E-3; // In degrees K.

    // Threshold for deciding when two temperatures can be considered equal.
    Constants.TEMPERATURES_EQUAL_THRESHOLD = 1E-6; // In Kelvin.


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


    /*************************************************************************
     **                                                                     **
     **                                 IRON                                **
     **                                                                     **
     *************************************************************************/

    var Iron = {};

    Iron.SPECIFIC_HEAT = 450; // In J/kg-K, source = design document.
    Iron.DENSITY = 7800; // In kg/m^3, source = design document

    Constants.Iron = Iron;


    /*************************************************************************
     **                                                                     **
     **                                 IRON                                **
     **                                                                     **
     *************************************************************************/

    var Burner = {};

    Burner.WIDTH = 0.075; // In meters.
    Burner.HEIGHT = WIDTH * 1;
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
    Beaker.RAND = new Random( 1 ); // This is seeded for consistent initial energy chunk distribution.
    Beaker.STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.

    // Constants that control the nature of the fluid in the beaker.
    Beaker.WATER_SPECIFIC_HEAT = 3000; // In J/kg-K.  The real value for water is 4186, but this was adjusted so that there
                                       //   aren't too many chunks and so that a chunk is needed as soon as heating starts.
    Beaker.WATER_DENSITY = 1000.0; // In kg/m^3, source = design document (and common knowledge).
    Beaker.INITIAL_FLUID_LEVEL = 0.5;

    Constants.Beaker = Beaker;


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
    Air.VOLUME = WIDTH * HEIGHT * DEPTH;
    Air.MASS = VOLUME * DENSITY;
    Air.INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
    Air.THERMAL_CONTACT_AREA = new ThermalContactArea( new Rectangle2D.Double( -WIDTH / 2, 0, WIDTH, HEIGHT ), true );

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
        return Math.max(Math.round(MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE( energy )), 0);
    };

    Constants.ENERGY_PER_CHUNK = Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE( 2 ) - Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE( 1 );
    

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
