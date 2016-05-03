define(function (require) {

    'use strict';

    var _ = require('underscore');

    var LasersSimView    = require('views/sim');
    var OneAtomSceneView = require('views/scene/one-atom');

    var OneAtomLaserSimulation = require('models/simulation/one-atom');

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

        /**
         * Renders everything
         */
        render: function() {
            LasersSimView.prototype.render.apply(this, arguments);

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
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            
        },

    });

    return OneAtomSimView;
});
