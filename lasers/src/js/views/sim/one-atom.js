define(function (require) {

    'use strict';

    var _ = require('underscore');

    var LasersSimView = require('views/sim');

    var Constants = require('constants');

    // CSS
    //require('less!styles/sim');

    // HTML
    var simHtml = require('text!templates/sim.html');

    /**
     * 
     */
    var OneAtomSimView = LasersSimView.extend({

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
