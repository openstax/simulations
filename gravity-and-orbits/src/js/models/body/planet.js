define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    var Constants = require('constants');

    /**
     * 
     */
    var Planet = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            name: 'planet',
            referenceMassLabel: 'Earth',
            color: Constants.PLANET_COLOR
        })

    });

    return Planet;
});
