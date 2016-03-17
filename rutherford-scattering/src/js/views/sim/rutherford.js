define(function(require) {

    'use strict';

    var _ = require('underscore');

    var RutherfordScattering    = require('rutherford-scattering/views/sim');

    /**
     * Extends the functionality of the RutherfordScattering to create
     *   the Rutherford Atom tab.
     */
    var RutherfordAtomView = RutherfordScattering.extend({

        events: _.extend(RutherfordScattering.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Rutherford Atom',
                name:  'rutherford-atom'
            }, options);

            this.showAtomProperties = true;

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

    return RutherfordAtomView;
});