define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FaradaySimulation = require('models/simulation');
    var BarMagnet         = require('models/magnet/bar');
    var Compass           = require('models/compass');
    var FieldMeter        = require('models/field-meter');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for the bar magnet tab
     */
    var BarMagnetSimulation = FaradaySimulation.extend({

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

            // Bar Magnet
            this.barMagnet = new BarMagnet({
                width:       BarMagnetSimulation.BAR_MAGNET_SIZE.width,
                height:      BarMagnetSimulation.BAR_MAGNET_SIZE.height,
                strength:    BarMagnetSimulation.BAR_MAGNET_STRENGTH,
                minStrength: Constants.BAR_MAGNET_STRENGTH_MIN,
                maxStrength: Constants.BAR_MAGNET_STRENGTH_MAX,
                position:    BarMagnetSimulation.BAR_MAGNET_LOCATION,
                direction:   BarMagnetSimulation.BAR_MAGNET_DIRECTION
            });

            // Compass model
            this.compass = new Compass({
                position: BarMagnetSimulation.COMPASS_LOCATION,
                behavior: Compass.KINEMATIC_BEHAVIOR
            }, {
                magnetModel: this.barMagnet 
            });

            // Field Meter
            this.fieldMeter = new FieldMeter({
                position: BarMagnetSimulation.FIELD_METER_LOCATION,
                enabled: false
            }, {
                magnetModel: this.barMagnet
            });
        },

        _update: function(time, deltaTime) {
            FaradaySimulation.prototype._update.apply(this, arguments);
            
            this.compass.update(time, deltaTime);
            this.fieldMeter.update(time, deltaTime);
        }

    }, Constants.BarMagnetSimulation);

    return BarMagnetSimulation;
});
