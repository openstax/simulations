define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2      = require('common/math/vector2');
    var MotionObject = require('common/models/motion-object');
    
    var EnergyTypes = require('constants').EnergyTypes;

    /**
     * 
     */
    var EnergyChunk = MotionObject.extend({
        
        defaults: _.extend({}, MotionObject.prototype.defaults, {
            // Used for some simple 3D layering effects.
            zPosition: 0,
            // Property that controls visibility in view.
            visible: true,
            // Energy type.  This can change during the life of the energy chunk.
            energyType: EnergyTypes.THERMAL
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            // For internal use to avoid creating and destroying objects
            this._vec2 = new Vector2(0, 0);
        },

        translateBasedOnVelocity: function(deltaTime, options) {
            this._vec2.set(this.get('velocity'));
            this.translate(this._vec2.scale(deltaTime), options);
        }

    }, EnergyTypes);

    return EnergyChunk;
});
