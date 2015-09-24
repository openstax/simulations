define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WireRegion = require('models/wire-region');

    /**
     * 
     */
    var SimplePatchWireRegion = function(wirePatch) {
        this.wirePatch = wirePatch;
    };

    /**
     * Instance functions/properties
     */
    _.extend(SimplePatchWireRegion.prototype, WireRegion.prototype, {

        contains: function(wireParticle) {
            return (wireParticle.wirePatch === this.wirePatch);
        }

    });

    return SimplePatchWireRegion;
});
