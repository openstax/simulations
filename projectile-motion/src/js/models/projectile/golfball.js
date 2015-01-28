define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var Golfball = Projectile.extend({

        defaults: {
            mass:            0.046,
            diameter:        0.043,
            dragCoefficient: 0.24
        }

    }, {
        getName: function() { return 'golfball'; }
    });

    return Golfball;
});
