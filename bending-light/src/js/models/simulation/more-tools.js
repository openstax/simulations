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

            this.waveSensor = new WaveSensor();
        },

    });

    return MoreToolsSimulation;
});
