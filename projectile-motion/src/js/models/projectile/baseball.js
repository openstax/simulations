define(function (require) {

    'use strict';

    var Projectile = require('models/projectile');

    var Baseball = Projectile.extend({

        defaults: {
            mass:            0.145,
            diameter:        0.074,
            dragCoefficient: 0.4
        }

    }, {
        getName: function() { return 'baseball'; }
    });

    return Baseball;
});
