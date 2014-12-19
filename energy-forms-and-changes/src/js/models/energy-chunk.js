define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Vector2  = require('common/math/vector2');
    var Pool     = require('object-pool');

    var Positionable = require('models/positionable');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    /**
     * Energy types
     */
    var EnergyTypes = {
        THERMAL:    0,
        ELECTRICAL: 1,
        MECHANICAL: 2,
        LIGHT:      3,
        CHEMICAL:   4,
        HIDDEN:     5
    };

    /**
     * 
     */
    var EnergyChunk = Positionable.extend({
        defaults: _.extend({}, Positionable.prototype.defaults, {
            // Used for some simple 3D layering effects.
            zPosition: 0,
            // At the time of this writing, this is only used in the
            // algorithms that distribute energy chunks in a container.
            velocity: null, // In meters/sec.
            // Property that controls visibility in view.
            visible: true,
            // Energy type.  This can change during the life of the energy chunk.
            energyType: EnergyTypes.THERMAL
        }),

        initialize: function(attributes, options) {
            Positionable.prototype.initialize.apply(this, [attributes, options]);
            
            // Create new vectors
            this.set('velocity', vectorPool.create().set(this.get('velocity')));

            // For internal use to avoid creating and destroying objects
            this._vec2 = new Vector2(0, 0);
        },

        translateBasedOnVelocity: function(time, options) {
            this._vec2.set(this.get('velocity'));
            this.translate(this._vec2.scale(time), options);
        },

        /**
         * Shortcut function that allows setting velocity to the values
         *   from an arbitrary vector but still triggering a change.
         */
        setVelocity: function(x, y, options) {
            var oldVelocity = this.get('velocity');
            
            if (x instanceof Vector2)
                this.set('velocity', vectorPool.create().set(x), y);
            else
                this.set('velocity', vectorPool.create().set(x, y), options);

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldVelocity);
        },

        addVelocity: function(x, y, options) {
            var oldVelocity = this.get('velocity');
            var newVelocity = vectorPool.create().set(this.get('velocity'));

            if (x instanceof Vector2)
                this.set('velocity', newVelocity.add(x), y);
            else
                this.set('velocity', newVelocity.add(x, y), options);
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldVelocity);
        }

    }, EnergyTypes);

    return EnergyChunk;
});
