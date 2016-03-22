define(function(require) {

    'use strict';

    var _ = require('underscore');

    var RutherfordScattering = require('rutherford-scattering/views/sim');
    /**
     * Extends the functionality of the RutherfordScattering to create
     *   the Rutherford Atom tab.
     */
    var PlumPuddingView = RutherfordScattering.extend({

        events: _.extend(RutherfordScattering.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Plum Pudding Atom',
                name:  'plum-pudding-atom'
            }, options);

            this.showAtomProperties = false;
            
            RutherfordScattering.prototype.initialize.apply(this, [ options ]);

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
        },

        /**
         * Renders everything
         */
        render: function() {
            RutherfordScattering.prototype.render.apply(this);

            this.renderPlaybackControls();

            this.simulation.trigger('change:paused');

            return this;
        }

    });

    return PlumPuddingView;
});