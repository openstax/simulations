define(function (require) {

    'use strict';

    var glMatrix = require('glmatrix');

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
        return glMatrix.fromValues(zValue * Constants.Z_TO_X_OFFSET_MULTIPLIER, zValue * Constants.Z_TO_Y_OFFSET_MULTIPLIER);
    };

    // For comparing temperatures.
    Constants.SIGNIFICANT_TEMPERATURE_DIFFERENCE = 1E-3; // In degrees K.

    // Constant function for energy chunk mapping. The basis for this function
    // is that the brick has 2 energy chunks at room temp, one at the freezing
    // point of water.
    Constants.LOW_ENERGY_FOR_MAP_FUNCTION = Brick.ENERGY_AT_WATER_FREEZING_TEMPERATURE;
    Constants.HIGH_ENERGY_FOR_MAP_FUNCTION = Brick.ENERGY_AT_ROOM_TEMPERATURE;
    Constants.NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING = 1.25;
    Constants.NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP = 2.4; // Close to rounding to 3 so that little energy needed to transfer a chunk.
    Constants.MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE = new Function.LinearFunction( LOW_ENERGY_FOR_MAP_FUNCTION,
                                                                             HIGH_ENERGY_FOR_MAP_FUNCTION,
                                                                             NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
                                                                             NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP );
    Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE = MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE.createInverse();

    Constants.ENERGY_TO_NUM_CHUNKS_MAPPER = function(energy) {
        return Math.max(Math.round(MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE.evaluate(energy)), 0);
    };

    Constants.ENERGY_PER_CHUNK = Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE.evaluate( 2 ) - Constants.MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE.evaluate( 1 );

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
    

    return Constants;
});
