define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    var Constants = require('constants');

    /**
     * 
     */
    var Satellite = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            name: 'satellite',
            referenceMassLabel: 'space station',
            color: Constants.SATELLITE_COLOR
        })

    });

    return Satellite;
});
