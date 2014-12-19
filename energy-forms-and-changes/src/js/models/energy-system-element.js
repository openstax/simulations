define(function (require) {

    'use strict';

    var Positionable = require('models/positionable');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergySystemElement = Positionable.extend({

        defaults: {

        },
        
        initialize: function(attributes, options) {},

        update: function(time, delta) {},

    });

    return EnergySystemElement;
});
