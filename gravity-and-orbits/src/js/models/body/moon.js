define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    /**
     * 
     */
    var Moon = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            name: 'moon'
        })

    });

    return Moon;
});
