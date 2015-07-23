define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var CapacitorLabSimulation = require('models/simulation');

    var CapacitorLabSceneView = require('views/scene');
    var CapacitanceMeterView  = require('views/bar-meter/capacitance');
    var PlateChargeMeterView  = require('views/bar-meter/plate-charge');
    var StoredEnergyMeterView = require('views/bar-meter/stored-energy');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml    = require('text!templates/sim.html');
    var metersHtml = require('text!templates/meters.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var CapacitorLabSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Templates for rendering the basic scaffolding
         */
        template:       _.template(simHtml),
        metersTemplate: _.template(metersHtml),

        /**
         * Dom event listeners
         */
        events: {
            'change .plate-charges-check'        : 'togglePlateCharges',
            'change .electric-field-lines-check' : 'toggleEFieldLines'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'capacitor-lab'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initBarMeterViews();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new CapacitorLabSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new CapacitorLabSceneView({
                simulation: this.simulation
            });
        },

        initBarMeterViews: function() {
            this.capacitanceMeterView = new CapacitanceMeterView({
                model: this.simulation,
                dragFrame: this.el
            });
            
            this.plateChargeMeterView = new PlateChargeMeterView({
                model: this.simulation,
                dragFrame: this.el
            });

            this.storedEnergyMeterView = new StoredEnergyMeterView({
                model: this.simulation,
                dragFrame: this.el
            });

            this.capacitanceMeterView.setPosition(380, 20);
            this.plateChargeMeterView.setPosition(510, 20);
            this.storedEnergyMeterView.setPosition(640, 20);
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderBarMeterViews();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                unique: this.cid
            };

            // Basic sim scaffolding
            this.$el.html(this.template(data));

            // Meters control panel
            this.$('.sim-controls-group-1').append(this.metersTemplate(data));
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
            this.$el.append(this.sceneView.ui);
        },

        renderBarMeterViews: function() {
            this.capacitanceMeterView.render();
            this.plateChargeMeterView.render();
            this.storedEnergyMeterView.render();

            this.$el.append(this.capacitanceMeterView.el);
            this.$el.append(this.plateChargeMeterView.el);
            this.$el.append(this.storedEnergyMeterView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.capacitanceMeterView.postRender();
            this.plateChargeMeterView.postRender();
            this.storedEnergyMeterView.postRender();
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

            // Update the bar meters
            this.capacitanceMeterView.update(timeSeconds, dtSeconds);
            this.plateChargeMeterView.update(timeSeconds, dtSeconds);
            this.storedEnergyMeterView.update(timeSeconds, dtSeconds);
        },

        togglePlateCharges: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showPlateCharges();
            else
                this.sceneView.hidePlateCharges();
        },

        toggleEFieldLines: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showEFieldLines();
            else
                this.sceneView.hideEFieldLines();
        }

    });

    return CapacitorLabSimView;
});
