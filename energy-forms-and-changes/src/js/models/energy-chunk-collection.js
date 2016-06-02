
define(function (require) {

    'use strict';

    var VanillaCollection = require('common/collections/vanilla');

    var EnergyChunk = require('models/energy-chunk');

    var EnergyChunkCollection = VanillaCollection.extend({
    	model: EnergyChunk
    });

    return EnergyChunkCollection;
});
