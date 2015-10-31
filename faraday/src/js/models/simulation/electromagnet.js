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

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for the bar magnet tab
     */
    var ElectromagnetSimulation = FaradaySimulation.extend({

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
                amplitude: ElectromagnetSimulation.BATTERY_AMPLITUDE,
                enabled: true
            });

            // AC Power Supply
            this.acPowerSupply = new ACPowerSupply({
                maxVoltage: Constants.AC_VOLTAGE_MAX,
                maxAmplitude: ElectromagnetSimulation.AC_MAX_AMPLITUDE,
                frequency: ElectromagnetSimulation.AC_FREQUENCY,
                enabled: false
            });

            // Source Coil
            this.sourceCoil = new SourceCoil({
                numberOfLoops: ElectromagnetSimulation.ELECTROMAGNET_NUMBER_OF_LOOPS,
                radius:        ElectromagnetSimulation.ELECTROMAGNET_LOOP_RADIUS,
                direction:     ElectromagnetSimulation.ELECTROMAGNET_DIRECTION
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
                position: ElectromagnetSimulation.ELECTROMAGNET_LOCATION,
                direction: ElectromagnetSimulation.ELECTROMAGNET_DIRECTION
            });
            // Do NOT set the strength! -- strength will be set based on the source coil model.
            // Do NOT set the size! -- size will be based on the source coil model.
            this.electromagnet.update();

            // Compass model
            this.compass = new Compass({
                position: ElectromagnetSimulation.COMPASS_LOCATION,
                behavior: Compass.INCREMENTAL_BEHAVIOR
            }, {
                magnetModel: this.electromagnet 
            });

            // Field Meter
            this.fieldMeter = new FieldMeter({
                position: ElectromagnetSimulation.FIELD_METER_LOCATION,
                enabled: false
            }, {
                magnetModel: this.electromagnet
            });
        },

        resetComponents: function() {
            FaradaySimulation.prototype.resetComponents.apply(this, arguments);

            this.battery.reset();
            this.acPowerSupply.reset();
            this.sourceCoil.reset();
            this.electromagnet.reset();
            this.electromagnet.update();
            this.compass.reset();
            this.fieldMeter.reset();
        },

        _update: function(time, deltaTime) {
            FaradaySimulation.prototype._update.apply(this, arguments);
            
            this.compass.update(time, deltaTime);
            this.fieldMeter.update(time, deltaTime);
            this.acPowerSupply.update(time, deltaTime);
        }

    }, Constants.ElectromagnetSimulation);

    return ElectromagnetSimulation;
});
