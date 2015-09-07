define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var PrismBreakSimulation = require('models/simulation/prism-break');

    var BendingLightSimView  = require('views/sim');

    var simHtml = require('text!templates/sim/prism-break.html');

    /**
     *
     */
    var PrismBreakSimView = BendingLightSimView.extend({

        template: _.template(simHtml),

        events: _.extend(BendingLightSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Prism Break',
                name:  'prism-break'
            }, options);
            
            BendingLightSimView.prototype.initialize.apply(this, [ options ]);

            
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PrismBreakSimulation();
        },

        render: function() {
            BendingLightSimView.prototype.render.apply(this);

            return this;
        }

    });

    return PrismBreakSimView;
});
