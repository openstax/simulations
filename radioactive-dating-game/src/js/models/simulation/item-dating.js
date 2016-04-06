define(function (require, exports, module) {

    'use strict';

    var NuclearPhysicsSimulation = require('models/simulation');

    /**
     * Base simulation model for simulations where items are radiometrically dated
     */
    var ItemDatingSimulation = NuclearPhysicsSimulation.extend({

    });

    return ItemDatingSimulation;
});
