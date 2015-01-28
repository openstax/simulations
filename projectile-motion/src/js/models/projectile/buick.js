define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var Buick = Projectile.extend({

        defaults: {
            mass:         1000,
            diameter:        2.5,
            dragCoefficient: 1.3
        }

    }, {
        getName: function() { return 'Buick'; }
    });

    return Buick;
});
