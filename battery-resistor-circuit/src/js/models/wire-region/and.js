define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WireRegion = require('models/wire-region');

    /**
     * 
     */
    var AndWireRegion = function() {
        this.regions = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(AndWireRegion.prototype, WireRegion.prototype, {

        contains: function(wireParticle) {
            for (var i = 0; i < this.regions.length; i++) {
                if (this.regions[i].contains(wireParticle))
                    return true;
            }
            return false;
        },

        addRegion: function(wireRegion) {
            this.regions.push(wireRegion);
        }

    });

    return AndWireRegion;
});
