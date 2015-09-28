define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Force = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(Force.prototype, {

        getForce: function(wireParticle) {
            throw 'Function not implemented.';
        }

    });

    return Force;
});
