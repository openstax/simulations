define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var Football = Projectile.extend({

        defaults: {
            mass:            0.41,
            diameter:        0.17,
            dragCoefficient: 0.15
        }

    }, {
        getName: function() { return 'football'; }
    });

    return Football;
});
