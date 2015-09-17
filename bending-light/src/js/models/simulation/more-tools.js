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

            this.waveSensor = new WaveSensor({
                bodyPosition:   new Vector2(WaveSensor.DEFAULT_BODY_X, WaveSensor.DEFAULT_BODY_Y),
                probe1Position: new Vector2(WaveSensor.DEFAULT_PROBE1_X, WaveSensor.DEFAULT_PROBE1_Y),
                probe2Position: new Vector2(WaveSensor.DEFAULT_PROBE2_X, WaveSensor.DEFAULT_PROBE2_Y)
            });
            
            this.velocitySensor = new VelocitySensor({
                position: new Vector2(VelocitySensor.DEFAULT_X, VelocitySensor.DEFAULT_Y)
            });
        },

        resetComponents: function() {
            IntroSimulation.prototype.resetComponents.apply(this, arguments);

            this.waveSensor.setBodyPosition(WaveSensor.DEFAULT_BODY_X, WaveSensor.DEFAULT_BODY_Y);
            this.waveSensor.setProbe1Position(WaveSensor.DEFAULT_PROBE1_X, WaveSensor.DEFAULT_PROBE1_Y);
            this.waveSensor.setProbe2Position(WaveSensor.DEFAULT_PROBE2_X, WaveSensor.DEFAULT_PROBE2_Y);
            this.waveSensor.clearSamples();
            
            this.velocitySensor.setPosition(VelocitySensor.DEFAULT_X, VelocitySensor.DEFAULT_Y);
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
