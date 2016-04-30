define(function (require) {

    'use strict';

    var _ = require('underscore');

    var LasersSimView = require('views/sim');

    var OneAtomLaserSimulation = require('models/simulation/one-atom');

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
         * Renders everything
         */
        render: function() {
            LasersSimView.prototype.render.apply(this, arguments);

            return this;
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
