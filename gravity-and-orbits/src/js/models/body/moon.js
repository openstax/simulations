define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    var Constants = require('constants');

    /**
     * 
     */
    var Moon = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            name: 'moon',
            referenceMassLabel: 'our moon',
            color: Constants.MOON_COLOR
        })

    });

    return Moon;
});
