
define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var EnergyChunk = require('models/energy-chunk');

    var EnergyChunkCollection = Backbone.Collection.extend({
    	model: EnergyChunk
    });

    return EnergyChunkCollection;
});
