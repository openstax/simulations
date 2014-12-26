define(function (require) {

    'use strict';

    var LightBulb = require('models/energy-user/light-bulb');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var IncandescentLightBulb = LightBulb.extend({

        defaults: _.extend({}, LightBulb.prototype.defaults, {
            hasFilament: true
        }),
        
    });

    return IncandescentLightBulb;
});
