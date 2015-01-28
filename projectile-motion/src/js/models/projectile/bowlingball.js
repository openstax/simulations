define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var Bowlingball = Projectile.extend({

        defaults: {
            mass:            7.3,
            diameter:        0.25,
            dragCoefficient: 0.46
        }

    }, {
        getName: function() { return 'bowlingball'; }
    });

    return Bowlingball;
});
