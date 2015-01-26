define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var TankShell = Projectile.extend({

        defaults: {
            mass:           150,
            diameter:         0.15,
            dragCoefficient:  0.05
        }

    }, {
        getName: function() { return 'tank shell'; }
    });

    return TankShell;
});
