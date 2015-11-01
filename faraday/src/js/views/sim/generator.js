define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var GeneratorSimulation = require('models/simulation/generator');

    var GeneratorSceneView = require('views/scene/generator');
    var FaradaySimView     = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var GeneratorSimView = FaradaySimView.extend({

        /**
         * Dom event listeners
         */
        events: _.extend(FaradaySimView.prototype.events, {
            
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Generator',
                name: 'generator',
                hideField: true,
                excludeInsideMagnet: true,
                excludeFlipPolarity: true
            }, options);

            FaradaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GeneratorSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new GeneratorSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            FaradaySimView.prototype.render.apply(this);

            this.renderPlaybackControls();
            this.renderBarMagnetControls();
            this.renderPickupCoilControls();

            return this;
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
            this.resetBarMagnetControls();
            this.resetPickupCoilControls();
        },

        changeStrength: function(event) {
            var percent = parseInt($(event.target).val());
            var strength = Constants.BAR_MAGNET_STRENGTH_RANGE.lerp(percent / 100);
            this.inputLock(function() {
                this.$strengthValue.text(percent + '%');
                this.simulation.turbine.set('strength', strength);
            });
        },

    });

    return GeneratorSimView;
});
