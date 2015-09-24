define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WireRegion = require('models/wire-region');

    /**
     * 
     */
    var PatchWireRegion = function(min, max, wirePatch) {
        this.min = min;
        this.max = max;
        this.wirePatch = wirePatch;
    };

    /**
     * Instance functions/properties
     */
    _.extend(PatchWireRegion.prototype, WireRegion.prototype, {

        contains: function(wireParticle) {
            return (
                wireParticle.wirePatch === this.wirePatch && 
                this.max >= wireParticle.position && 
                this.min <= wireParticle.position
            );
        }

    });

    return PatchWireRegion;
});
