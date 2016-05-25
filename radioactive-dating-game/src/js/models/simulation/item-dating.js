define(function (require, exports, module) {

    'use strict';

    var NuclearPhysicsSimulation = require('models/simulation');

    var DatableItem = require('radioactive-dating-game/models/datable-item');

    /**
     * Base simulation model for simulations where items are radiometrically dated
     */
    var ItemDatingSimulation = NuclearPhysicsSimulation.extend({

    	getDatableAir: function() {
    	    return DatableItem.DATABLE_AIR;
    	}

    });

    return ItemDatingSimulation;
});
