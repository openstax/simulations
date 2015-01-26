define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var AdultHuman = Projectile.extend({

        defaults: {
            mass:           70,
            diameter:        0.5,
            dragCoefficient: 1.3
        }

    }, {
        getName: function() { return 'adult human'; }
    });

    return AdultHuman;
});
