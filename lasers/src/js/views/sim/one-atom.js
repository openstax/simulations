define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WavelengthSliderView = require('common/controls/wavelength-slider');

    var OneAtomLaserSimulation = require('models/simulation/one-atom');

    var LasersSimView     = require('views/sim');
    var OneAtomSceneView  = require('views/scene/one-atom');
    var LaserControlsView = require('views/laser-controls');
    var LaserPowerView    = require('views/laser-power');

    var Constants = require('constants');
    var Assets = require('assets');

    // CSS
    //require('less!styles/sim');

    // HTML
    var simHtml = require('text!templates/one-atom-sim.html');

    /**
     * 
     */
    var OneAtomSimView = LasersSimView.extend({

        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: _.extend({}, LasersSimView.prototype.events, {
            
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'One Atom (Absorption and Emission)',
                name: 'one-atom',
            }, options);

            LasersSimView.prototype.initialize.apply(this, [options]);

            this.initLaserControlsView();
            this.initLaserPowerView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new OneAtomLaserSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new OneAtomSceneView({
                simulation: this.simulation
            });
        },

        initLaserControlsView: function() {
            this.laserControlsView = new LaserControlsView({
                simulation: this.simulation,
                model: this.simulation.seedBeam
            });
        },

        initLaserPowerView: function() {
            this.laserPowerView = new LaserPowerView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            LasersSimView.prototype.render.apply(this, arguments);

            this.renderLaserControls();
            this.renderLaserPower();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                Assets: Assets,
                simulation: this.simulation,
                unique: this.cid
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();
        },

        /**
         * Renders the laser controls view
         */
        renderLaserControls: function() {
            this.laserControlsView.render();
            this.$el.append(this.laserControlsView.el);
        },

        /**
         * Renders the laser controls view
         */
        renderLaserPower: function() {
            this.laserPowerView.render();
            this.$el.append(this.laserPowerView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            LasersSimView.prototype.postRender.apply(this);
            
            this.laserControlsView.postRender();
            this.laserPowerView.postRender();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            LasersSimView.prototype.resetComponents.apply(this);
            
        },

    });

    return OneAtomSimView;
});
