define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var BendingLightSimulation = require('models/simulation');
    var BendingLightSimView    = require('views/sim');

    var simHtml = require('text!templates/sim/more-tools.html');

    /**
     *
     */
    var MoreToolsSimView = BendingLightSimView.extend({

        template: _.template(simHtml),

        events: _.extend(BendingLightSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'MoreTools',
                name:  'more-tools'
            }, options);
            
            BendingLightSimView.prototype.initialize.apply(this, [ options ]);

            
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new BendingLightSimulation();
        },

        render: function() {
            BendingLightSimView.prototype.render.apply(this);

            return this;
        }

    });

    return MoreToolsSimView;
});
