define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WireRegion = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(WireRegion.prototype, {

        contains: function(wireParticle) {
            throw 'Update function not implemented.';
        }

    });

    return WireRegion;
});
