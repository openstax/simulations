define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var Piano = Projectile.extend({

        defaults: {
            mass:          400,
            diameter:        2,
            dragCoefficient: 1.2
        }

    }, {
        getName: function() { return 'piano'; }
    });

    return Piano;
});
