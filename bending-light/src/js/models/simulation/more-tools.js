define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var IntroSimulation = require('models/simulation/intro');
    var WaveSensor      = require('models/wave-sensor');
    var VelocitySensor  = require('models/velocity-sensor');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var MoreToolsSimulation = IntroSimulation.extend({

        initialize: function(attributes, options) {
            IntroSimulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            IntroSimulation.prototype.initComponents.apply(this, arguments);

            var w = Constants.MODEL_WIDTH;
            var h = Constants.MODEL_HEIGHT;

            this.waveSensor = new WaveSensor({
                bodyPosition:   new Vector2(w * -0.105, h * -0.15),
                probe1Position: new Vector2(w * -0.027, h *  0.039),
                probe2Position: new Vector2(w *  0.027, h *  0.039),
            });

            this.velocitySensor = new VelocitySensor({
                position: new Vector2(w * -0.105, h * -0.15)
            });
        },

        _update: function(time, deltaTime) {
            IntroSimulation.prototype._update.apply(this, arguments);

            this.waveSensor.addProbe1Sample(this.getWaveValue(this.waveSensor.get('probe1Position')));
            this.waveSensor.addProbe2Sample(this.getWaveValue(this.waveSensor.get('probe2Position')));

            this.velocitySensor.set('velocity', this.getVelocity(this.velocitySensor.get('position')));
        },

    });

    return MoreToolsSimulation;
});
