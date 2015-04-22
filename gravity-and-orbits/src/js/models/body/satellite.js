define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    /**
     * 
     */
    var Satellite = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            name: 'satellite',
            referenceMassLabel: 'space station'
        })

    });

    return Satellite;
});
