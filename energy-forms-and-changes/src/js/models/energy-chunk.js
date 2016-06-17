define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var VanillaMotionObject = require('common/models/motion-object-vanilla');
    
    var EnergyTypes = require('constants').EnergyTypes;

    /**
     * 
     */
    var EnergyChunk = VanillaMotionObject.extend({
        
        defaults: _.extend({}, VanillaMotionObject.prototype.defaults, {
            // Used for some simple 3D layering effects.
            zPosition: 0,
            // Property that controls visibility in view.
            visible: true,
            // Energy type.  This can change during the life of the energy chunk.
            energyType: EnergyTypes.THERMAL
        }),

        translateBasedOnVelocity: function(deltaTime, options) {
            this._vec2.set(this.get('velocity'));
            this.translate(this._vec2.scale(deltaTime), options);
        }

    }, EnergyTypes);

    return EnergyChunk;
});
