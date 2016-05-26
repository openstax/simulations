define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var MovingObject = require('hydrogen-atom/models/moving-object');
    
    var Constants = require('constants');

    /**
     * AlphaParticle is the model of an alpha particle.
     * An alpha particle has a position and direction of motion.
     */
    var AlphaParticle = MovingObject.extend({

        initialize: function(attributes, options) {
            MovingObject.prototype.initialize.apply(this, [attributes, options]);

            this.initialPosition = new Vector2(this.get('position'));
            this.initialSpeed = this.get('speed');
        },

        getInitialPosition: function() {
            return this.initialPosition;
        },
        
        getInitialSpeed: function() {
            return this.initialSpeed;
        },

        update: function(time, deltaTime) {}

    });

    return AlphaParticle;
});