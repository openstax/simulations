define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FaradaySimulation    = require('models/simulation');
    var BarMagnet            = require('models/magnet/bar');
    var Compass              = require('models/compass');
    var FieldMeter           = require('models/field-meter');
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
    var PickupCoilSimulation = FaradaySimulation.extend({

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
                width:       PickupCoilSimulation.BAR_MAGNET_SIZE.width,
                height:      PickupCoilSimulation.BAR_MAGNET_SIZE.height,
                strength:    PickupCoilSimulation.BAR_MAGNET_STRENGTH,
                minStrength: Constants.BAR_MAGNET_STRENGTH_MIN,
                maxStrength: Constants.BAR_MAGNET_STRENGTH_MAX,
                position:    PickupCoilSimulation.BAR_MAGNET_LOCATION,
                direction:   PickupCoilSimulation.BAR_MAGNET_DIRECTION
            });

            // Compass model
            this.compass = new Compass({
                position: PickupCoilSimulation.COMPASS_LOCATION,
                behavior: Compass.KINEMATIC_BEHAVIOR
            }, {
                magnetModel: this.barMagnet 
            });

            // Field Meter
            this.fieldMeter = new FieldMeter({
                position: PickupCoilSimulation.FIELD_METER_LOCATION,
                enabled: false
            }, {
                magnetModel: this.barMagnet
            });

            // Pickup Coil
            var ySpacing = this.barMagnet.get('height') / 10;
            this.pickupCoil = new PickupCoil({
                position:                 PickupCoilSimulation.PICKUP_COIL_LOCATION,
                direction:                PickupCoilSimulation.PICKUP_COIL_DIRECTION,
                numberOfLoops:            PickupCoilSimulation.PICKUP_COIL_NUMBER_OF_LOOPS,
                transitionSmoothingScale: PickupCoilSimulation.PICKUP_COIL_TRANSITION_SMOOTHING_SCALE,
                samplePointsStrategy:     new SamplePointsStrategy.VariableNumberOfSamplePointsStrategy(ySpacing),
            }, {
                magnetModel: this.barMagnet,
                calibrationEmf: PickupCoilSimulation.CALIBRATION_EMF
            });
            this.pickupCoil.setLoopArea(PickupCoilSimulation.PICKUP_COIL_LOOP_AREA);

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
            this.compass.update(time, deltaTime);
            this.pickupCoil.update(time, deltaTime);
            this.lightbulb.update(time, deltaTime);
            this.voltmeter.update(time, deltaTime);
        }

    }, Constants.PickupCoilSimulation);

    return PickupCoilSimulation;
});
