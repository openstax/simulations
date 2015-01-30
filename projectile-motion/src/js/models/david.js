define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Rectangle = require('common/math/rectangle');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * A david statue that detects collisions with projectiles
     */
    var David = Backbone.Model.extend({

        defaults: {
            x: Constants.David.DEFAULT_X,
            y: Constants.GROUND_Y,
            height: Constants.David.HEIGHT,
            collisionEnabled: true,
            naked: false
        },

        initialize: function(attributes, options) {
            this._bounds = new Rectangle();

            this.on('change:height change:x change:y', this.updateBounds);
            this.updateBounds();
        },

        updateBounds: function() {
            this._bounds.set(
                David.BOUNDS_RELATIVE_TO_HEIGHT.x * this.get('height') + this.get('x'),
                David.BOUNDS_RELATIVE_TO_HEIGHT.y * this.get('height') + this.get('y'),
                David.BOUNDS_RELATIVE_TO_HEIGHT.w * this.get('height'),
                David.BOUNDS_RELATIVE_TO_HEIGHT.h * this.get('height')
            );
        },

        calculateCollision: function(projectile) {
            var collision = this._bounds.overlaps(projectile.bounds());
            if (collision) {
                this.trigger('collide', this, projectile);
                this.set('collisionEnabled', false);
                this.set('naked', true);
            }
            return collision;
        },

        reset: function() {
            this.set('collisionEnabled', true);
            this.set('naked', false);
        },

    }, Constants.David);

    return David;
});
