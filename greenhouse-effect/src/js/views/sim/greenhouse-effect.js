define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var range = require('common/math/range');

    var GreenhouseEffectSimulation = require('models/simulation/greenhouse-effect');
    var GreenhouseEffectSceneView  = require('views/scene/greenhouse-effect');
    var BaseGreenhouseSimView      = require('views/sim/base-greenhouse');

    var Constants = require('constants');

    /**
     * SimView for the Greenhouse Effects tab
     */
    var GreenhouseEffectSimView = BaseGreenhouseSimView.extend({

        /**
         * Dom event listeners
         */
        events: _.extend({}, BaseGreenhouseSimView.prototype.events, {
            'click .add-cloud-btn'     : 'addCloud',
            'click .remove-cloud-btn'  : 'removeCloud',

            'click #atmosphere-type-today'          : 'setAtmosphereToday',
            'click #atmosphere-type-seventeen-fifty': 'setAtmosphere1750',
            'click #atmosphere-type-ice-age'        : 'setAtmosphereIceAge',
            'click #atmosphere-type-custom'         : 'setAtmosphereCustom',

            'slide .concentration-slider': 'changeConcentration'
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Greenhouse Effect',
                name: 'greenhouse-effect',
            }, options);

            BaseGreenhouseSimView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation.atmosphere, 'change:greenhouseGasConcentration', this.updateConcentrationSlider);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GreenhouseEffectSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new GreenhouseEffectSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders page content and sets up controls.
         */
        renderScaffolding: function() {
            BaseGreenhouseSimView.prototype.renderScaffolding.apply(this, arguments);
            
            var scale = Constants.Atmosphere.CONCENTRATION_RESOLUTION;
            this.$concentrationSlider = this.$('.concentration-slider').noUiSlider({
                connect: 'lower',
                start: this.simulation.atmosphere.get('greenhouseGasConcentration') * scale,
                range: {
                    'min': Constants.Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION * scale,
                    'max': Constants.Atmosphere.MAX_GREENHOUSE_GAS_CONCENTRATION * scale
                }
            });

            var concentrationRange = range({
                min: Constants.Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION,
                max: Constants.Atmosphere.MAX_GREENHOUSE_GAS_CONCENTRATION
            });

            var percentToday  = concentrationRange.percent(Constants.Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY);
            var percent1750   = concentrationRange.percent(Constants.Atmosphere.GREENHOUSE_GAS_CONCENTRATION_1750);
            var percentIceAge = concentrationRange.percent(Constants.Atmosphere.GREENHOUSE_GAS_CONCENTRATION_ICE_AGE);

            var $ticks = $('<div class="ticks">');
            $('<div class="tick value-today">'  ).css('left', percentToday  * 100 + '%').appendTo($ticks);
            $('<div class="tick value-1750">'   ).css('left', percent1750   * 100 + '%').appendTo($ticks);
            $('<div class="tick value-ice-age">').css('left', percentIceAge * 100 + '%').appendTo($ticks);

            this.$concentrationSlider.parent().append($ticks);
        },

        /**
         * Adds a cloud to the sim.
         */
        addCloud: function() {
            this.simulation.addCloud();
        },

        /**
         * Removes a cloud from the sim.
         */
        removeCloud: function() {
            this.simulation.removeCloud();
        },

        /**
         * Sets the atmosphere to today's
         */
        setAtmosphereToday: function() {
            this.customAtmosphereSelected = false;
            this.sceneView.showTodayScene();
            this.simulation.atmosphere.set('greenhouseGasConcentration', Constants.Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY);
        },

        /**
         * Sets the atmosphere to 1750's
         */
        setAtmosphere1750: function() {
            this.customAtmosphereSelected = false;
            this.sceneView.show1750Scene();
            this.simulation.atmosphere.set('greenhouseGasConcentration', Constants.Atmosphere.GREENHOUSE_GAS_CONCENTRATION_1750);
        },

        /**
         * Sets the atmosphere to an ice age's
         */
        setAtmosphereIceAge: function() {
            this.customAtmosphereSelected = false;
            this.sceneView.showIceAgeScene();
            this.simulation.atmosphere.set('greenhouseGasConcentration', Constants.Atmosphere.GREENHOUSE_GAS_CONCENTRATION_ICE_AGE);
        },

        /**
         * Sets the atmosphere to custom
         */
        setAtmosphereCustom: function() {
            this.customAtmosphereSelected = true;
            this.sceneView.showCustomScene();
        },

        /**
         * Changes the greenhouse gas concentration and makes
         *   sure we're on custom atmosphere mode.
         */
        changeConcentration: function(event) {
            var concentration = parseFloat($(event.target).val()) / Constants.Atmosphere.CONCENTRATION_RESOLUTION;
            this.inputLock(function() {
                this.simulation.atmosphere.set('greenhouseGasConcentration', concentration);
            });
            if (!this.customAtmosphereSelected)
                this.$('#atmosphere-type-custom').click();
        },

        /**
         * Updates the greenhouse gas concentration slider value.
         */
        updateConcentrationSlider: function(atmosphere, concentration) {
            this.updateLock(function() {
                this.$concentrationSlider.val(concentration * Constants.Atmosphere.CONCENTRATION_RESOLUTION);
            });
        },

    });

    return GreenhouseEffectSimView;
});
