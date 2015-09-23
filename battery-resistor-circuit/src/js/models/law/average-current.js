define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Law = require('models/law');

    /**
     * 
     */
    var AverageCurrent = function() {
        throw 'Not yet implemented.';
    };

    /**
     * Instance functions/properties
     */
    _.extend(AverageCurrent.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            
        }

    });

    return AverageCurrent;
});
