define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var IntroSimulation = require('models/simulation/intro');
    var WaveSensor      = require('models/wave-sensor');

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
        },

    });

    return MoreToolsSimulation;
});
