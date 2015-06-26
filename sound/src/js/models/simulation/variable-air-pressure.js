define(function (require, exports, module) {

    'use strict';

    var SoundSimulation = require('models/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var VariableAirPressureSimulation = SoundSimulation.extend({

        defaults: _.extend({}, SoundSimulation.prototype.defaults, {
            densityPercent: 1
        }),

        /**
         * 
         */
        initialize: function(attributes, options) {
            SoundSimulation.prototype.initialize.apply(this, arguments);

            this.on('change:densityPercent', this.densityPercentChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            SoundSimulation.prototype.initComponents.apply(this, arguments);

            // Create an attenuation function that returns different attenuation values
            //   depending on whether the point is within a certain radius or not.
            var attenuationFunction = function(x, y) {
                if (x * x + y * y <= attenuationFunction.radius * attenuationFunction.radius)
                    return attenuationFunction.insideRadiusAttenuation;
                else
                    return attenuationFunction.outsideRadiusAttenuation;
            };
            attenuationFunction.radius = Constants.BoxView.RADIUS_IN_METERS - Constants.SpeakerView.WIDTH_IN_METERS;
            attenuationFunction.insideRadiusAttenuation = 1;
            attenuationFunction.outsideRadiusAttenuation = 1;
            
            this.waveMedium.attenuationFunction = attenuationFunction;
        },

        setInsideRadiusAttenuation: function(attenuation) {
            this.waveMedium.attenuationFunction.insideRadiusAttenuation = attenuation;
        },

        densityPercentChanged: function(simulation, densityPercent) {
            this.setInsideRadiusAttenuation(densityPercent);
        }

    });

    return VariableAirPressureSimulation;
});
