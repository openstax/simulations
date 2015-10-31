define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FaradaySimulation = require('models/simulation');
    var Electromagnet     = require('models/magnet/electromagnet');
    var Compass           = require('models/compass');
    var FieldMeter        = require('models/field-meter');
    var SourceCoil        = require('models/coil/source');
    var ACPowerSupply     = require('models/current-source/ac-power-supply');
    var Battery           = require('models/current-source/battery');
    var PickupCoil           = require('models/coil/pickup');
    var Lightbulb            = require('models/lightbulb');
    var Voltmeter            = require('models/voltmeter');
    var SamplePointsStrategy = require('models/sample-points-strategy');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for the bar magnet tab
     */
    var TransformerSimulation = FaradaySimulation.extend({

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

            // Battery
            this.battery = new Battery({
                maxVoltage: Constants.BATTERY_VOLTAGE_MAX,
                amplitude: TransformerSimulation.BATTERY_AMPLITUDE,
                enabled: true
            });

            // AC Power Supply
            this.acPowerSupply = new ACPowerSupply({
                maxVoltage: Constants.AC_VOLTAGE_MAX,
                maxAmplitude: TransformerSimulation.AC_MAX_AMPLITUDE,
                frequency: TransformerSimulation.AC_FREQUENCY,
                enabled: false
            });

            // Source Coil
            this.sourceCoil = new SourceCoil({
                numberOfLoops: TransformerSimulation.ELECTROMAGNET_NUMBER_OF_LOOPS,
                radius:        TransformerSimulation.ELECTROMAGNET_LOOP_RADIUS,
                direction:     TransformerSimulation.ELECTROMAGNET_DIRECTION
            });

            // Electromagnet
            var currentSource;
            if (this.battery.get('enabled'))
                currentSource = this.battery;
            else if (this.acPowerSupply.get('enabled'))
                currentSource = this.acPowerSupply;
            
            this.electromagnet = new Electromagnet({
                sourceCoilModel: this.sourceCoil, 
                currentSource: currentSource,
                maxStrength: Constants.ELECTROMAGNET_STRENGTH_MAX,
                position: TransformerSimulation.ELECTROMAGNET_LOCATION,
                direction: TransformerSimulation.ELECTROMAGNET_DIRECTION
            });
            // Do NOT set the strength! -- strength will be set based on the source coil model.
            // Do NOT set the size! -- size will be based on the source coil model.
            this.electromagnet.update();

            // Compass model
            this.compass = new Compass({
                position: TransformerSimulation.COMPASS_LOCATION,
                behavior: Compass.INCREMENTAL_BEHAVIOR
            }, {
                magnetModel: this.electromagnet 
            });

            // Field Meter
            this.fieldMeter = new FieldMeter({
                position: TransformerSimulation.FIELD_METER_LOCATION,
                enabled: false
            }, {
                magnetModel: this.electromagnet
            });

            // Pickup Coil
            var ySpacing = this.electromagnet.get('height') / 20;
            this.pickupCoil = new PickupCoil({
                position:                 TransformerSimulation.PICKUP_COIL_LOCATION,
                direction:                TransformerSimulation.PICKUP_COIL_DIRECTION,
                numberOfLoops:            TransformerSimulation.PICKUP_COIL_NUMBER_OF_LOOPS,
                transitionSmoothingScale: TransformerSimulation.PICKUP_COIL_TRANSITION_SMOOTHING_SCALE,
                samplePointsStrategy:     new SamplePointsStrategy.VariableNumberOfSamplePointsStrategy(ySpacing),
            }, {
                magnetModel: this.electromagnet,
                calibrationEmf: TransformerSimulation.CALIBRATION_EMF
            });
            this.pickupCoil.setLoopArea(TransformerSimulation.PICKUP_COIL_LOOP_AREA);

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

        _update: function(time, deltaTime) {
            FaradaySimulation.prototype._update.apply(this, arguments);
            
            this.acPowerSupply.update(time, deltaTime);
            this.compass.update(time, deltaTime);
            this.fieldMeter.update(time, deltaTime);
            this.pickupCoil.update(time, deltaTime);
            this.lightbulb.update(time, deltaTime);
            this.voltmeter.update(time, deltaTime);
        }

    }, Constants.TransformerSimulation);

    return TransformerSimulation;
});
