define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/v3/app/sim');

    var BRCSimulation = require('models/simulation');
    var BRCSceneView  = require('views/scene');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml = require('text!templates/sim.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var BRCSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'  : 'play',
            'click .pause-btn' : 'pause',

            'click #show-cores-check'               : 'toggleCores',
            'click #show-voltage-calculation-check' : 'toggleVoltageCalculation',
            'click #show-inside-battery-check'      : 'toggleInsideBattery',

            'slide .resistance-slider' : 'changeResistance',
            'slide .voltage-slider'    : 'changeVoltage'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Battery-Resistor Circuit',
                name: 'battery-resistor-circuit',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new BRCSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new BRCSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation
            };
            this.$el.html(this.template(data));
            
            this.$('.resistance-slider').noUiSlider({
                start: Constants.RESISTANCE_RANGE.defaultValue,
                connect: 'lower',
                range: {
                    'min': Constants.RESISTANCE_RANGE.min,
                    'max': Constants.RESISTANCE_RANGE.max
                }
            });

            this.$('.voltage-slider').noUiSlider({
                start: Constants.VOLTAGE_RANGE.defaultValue,
                connect: 'lower',
                range: {
                    'min': Constants.VOLTAGE_RANGE.min,
                    'max': Constants.VOLTAGE_RANGE.max
                }
            });

            this.$resistance = this.$('#resistance');
            this.$voltage    = this.$('#voltage');
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            this.initSceneView();
        },

        /**
         * This is run every tick of the updater.  It updates the wave
         *   simulation and the views.
         */
        update: function(time, deltaTime) {
            // Update the model
            this.simulation.update(time, deltaTime);

            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the scene
            this.sceneView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
        },

        /**
         * The simulation changed its paused state.
         */
        pausedChanged: function() {
            if (this.simulation.get('paused'))
                this.$el.removeClass('playing');
            else
                this.$el.addClass('playing');
        },

        /**
         * Responds to changes in the resistance slider
         */
        changeResistance: function(event) {
            var coreCount = parseInt($(event.target).val());
            this.inputLock(function() {
                this.$resistance.text(Constants.coreCountToOhms(coreCount).toFixed(2) + ' Ohms');
                this.simulation.set('coreCount', coreCount);
            });
        },

        /**
         * Responds to changes in the voltage slider
         */
        changeVoltage: function(event) {
            var voltage = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$voltage.text(voltage.toFixed(2) + ' Volts');
                this.simulation.set('voltage', voltage);
            });
        },

        toggleCores: function(event) {
            // if ($(event.target).is(':checked'))
            //     this.sceneView.showVelocityArrows();
            // else
            //     this.sceneView.hideVelocityArrows();
        },

        toggleVoltageCalculation: function(event) {
            // if ($(event.target).is(':checked'))
            //     this.sceneView.showVelocityArrows();
            // else
            //     this.sceneView.hideVelocityArrows();
        },

        toggleInsideBattery: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showCutawayBattery();
            else
                this.sceneView.showSolidBattery();
        },

    });

    return BRCSimView;
});
