define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    /**
     * Class for holding info about a system
     */
    var System = Backbone.Model.extend({

        initialize: function(attributes, options) {
            // Particles that hold charge and can move around in the system
            this.particles = new Backbone.Collection();

            // Laws and Propagators (don't need any fancy collections for these)
            this.laws = [];
            this.propagators = [];
        },

        addLaw: function(law) {
            this.laws.push(law);
        },

        addPropagator: function(propagator) {
            this.propagators.push(propagator);
        }

    });

    return System;
});
