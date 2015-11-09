define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var PickupCoilSimulation = require('models/simulation/pickup-coil');

    var FaradaySimView      = require('views/sim');
    var PickupCoilSceneView = require('views/scene/pickup-coil');

    var Constants = require('constants');

    /**
     * 
     */
    var PickupCoilSimView = FaradaySimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Pickup Coil',
                name: 'pickup-coil',
                hideCompass: true
            }, options);

            FaradaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PickupCoilSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PickupCoilSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            FaradaySimView.prototype.render.apply(this);

            this.renderBarMagnetControls();
            this.renderPickupCoilControls();

            return this;
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            FaradaySimView.prototype.postRender.apply(this);
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
            this.resetBarMagnetControls();
            this.resetPickupCoilControls();
        },

        showElectrons: function() {
            this.coilView.showElectrons();
        },

        hideElectrons: function() {
            this.coilView.hideElectrons();
        }

    });

    return PickupCoilSimView;
});
