define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = function() {};

    /**
     * Instance functions/properties
     */
    _.extend(Law.prototype, {

        iterate: function(deltaTime, system) {
            throw 'Iterate function not implemented.';
        }

    });

    return Law;
});
