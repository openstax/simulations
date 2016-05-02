define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');
    var Rectangle          = require('common/math/rectangle');

    var Nucleon = require('models/nucleon');

    /**
     * This class represents the position and behavior of the control rods within
     *   a model of a nuclear reactor.
     */
    var ControlRod = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            width: 0,
            height: 0
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            this.rect = new Rectangle();

            this.on('change:position', this.positionChanged);
            this.positionChanged(this, this.get('position'))
        },

        getRectangle: function() {
            return this.rect;
        },

        /**
         * Returns true if the particle can be absorbed by the control rod,
         *   false if not.
         */
        particleAbsorbed: function(particle) {
            return (this.rect.contains(particle.getPosition()));
        },

        positionChanged: function(model, position) {
            this.rect.set(
                position.x,
                position.y,
                this.get('width'),
                this.get('height')
            );
        }

    });

    return ControlRod;
});