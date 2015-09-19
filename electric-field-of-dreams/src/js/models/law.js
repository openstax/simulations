define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(Law.prototype, {

        update: function(deltaTime, system) {
            throw 'Update function not implemented.';
        }

    });

    return Law;
});
