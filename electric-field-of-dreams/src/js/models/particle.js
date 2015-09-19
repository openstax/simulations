define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');

    var Particle = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            charge: 1,
            mass: 1
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, arguments);
        },

        /**
         * Signals to listeners that this particle should enter a detached state.
         */
        detach: function() {
            this.trigger('detach', this);
        },

        /**
         * Signals to listeners that this particle should leave its detached state.
         */
        attach: function() {
            this.trigger('attach', this);
        }

    });

    return Particle;
});
