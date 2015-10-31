define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FaradaySimulation = require('models/simulation');
    var Turbine           = require('models/magnet/turbine');
    var Compass           = require('models/compass');
    var FieldMeter        = require('models/field-meter');
    var PickupCoil        = require('models/coil/pickup');
    var Lightbulb         = require('models/lightbulb');
    var Voltmeter         = require('models/voltmeter');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for the bar magnet tab
     */
    var GeneratorSimulation = FaradaySimulation.extend({

        defaults: _.extend(FaradaySimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            FaradaySimulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            FaradaySimulation.prototype.initComponents.apply(this, arguments);

            // Turbine
            this.turbine = new Turbine({
                width:       GeneratorSimulation.TURBINE_SIZE.width,
                height:      GeneratorSimulation.TURBINE_SIZE.height,
                maxStrength: Constants.TURBINE_STRENGTH_MAX,
                minStrength: Constants.TURBINE_STRENGTH_MIN,
                strength:    GeneratorSimulation.TURBINE_STRENGTH,
                position:    GeneratorSimulation.TURBINE_LOCATION,
                direction:   GeneratorSimulation.TURBINE_DIRECTION,
                speed:       GeneratorSimulation.TURBINE_SPEED
            });

            // Compass model
            this.compass = new Compass({
                position: GeneratorSimulation.COMPASS_LOCATION,
                behavior: Compass.SIMPLE_BEHAVIOR
            }, {
                magnetModel: this.turbine 
            });

            // Field Meter
            this.fieldMeter = new FieldMeter({
                position: GeneratorSimulation.FIELD_METER_LOCATION,
                enabled: false
            }, {
                magnetModel: this.turbine
            });

            // Pickup Coil
            this.pickupCoil = new PickupCoil({
                position:                 GeneratorSimulation.PICKUP_COIL_LOCATION,
                direction:                GeneratorSimulation.PICKUP_COIL_DIRECTION,
                numberOfLoops:            GeneratorSimulation.PICKUP_COIL_NUMBER_OF_LOOPS,
                transitionSmoothingScale: GeneratorSimulation.PICKUP_COIL_TRANSITION_SMOOTHING_SCALE
            }, {
                magnetModel: this.turbine,
                calibrationEmf: GeneratorSimulation.CALIBRATION_EMF
            });
            this.pickupCoil.setLoopArea(GeneratorSimulation.PICKUP_COIL_LOOP_AREA);

            // Lightbulb
            this.lightbulb = new Lightbulb({
                enabled: true
            }, {
                pickupCoilModel: this.pickupCoil
            });

            // Voltmeter
            this.voltmeter = new Voltmeter({
                enabled: false,
                jiggleEnabled: true
            }, {
                pickupCoilModel: this.pickupCoil
            });
        },

        resetComponents: function() {
            FaradaySimulation.prototype.resetComponents.apply(this, arguments);

            this.turbine.reset();
            this.compass.reset();
            this.fieldMeter.reset();
            this.pickupCoil.reset();
            this.lightbulb.reset();
            this.voltmeter.reset();
        },

        _update: function(time, deltaTime) {
            FaradaySimulation.prototype._update.apply(this, arguments);
            
            this.turbine.update(time, deltaTime);
            this.compass.update(time, deltaTime);
            this.fieldMeter.update(time, deltaTime);
            this.pickupCoil.update(time, deltaTime);
            this.voltmeter.update(time, deltaTime);
        }

    }, Constants.GeneratorSimulation);

    return GeneratorSimulation;
});
