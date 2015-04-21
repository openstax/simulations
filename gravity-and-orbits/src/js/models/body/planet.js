define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    /**
     * 
     */
    var Planet = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
 
        })

    });

    return Planet;
});
