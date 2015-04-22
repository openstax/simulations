define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Body = require('models/body');

    /**
     * 
     */
    var Sun = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            name: 'sun',
            referenceMassLabel: 'our sun'
        })

    });

    return Sun;
});
