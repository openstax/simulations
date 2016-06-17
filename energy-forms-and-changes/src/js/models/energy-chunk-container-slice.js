define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Backbone  = require('backbone');
    var Rectangle = require('common/math/rectangle');

    var EnergyChunkCollection = require('models/energy-chunk-collection');

    /**
     * The original 
     */
    var EnergyChunkContainerSlice = function(shape, zPosition) {
        this.shape = shape;
        this.zPosition = zPosition;
        this.energyChunkList = new EnergyChunkCollection();
    };

    _.extend(EnergyChunkContainerSlice.prototype, Backbone.Events, {

        translate: function(translation) {
            for (var i = 0; i < this.energyChunkList.length; i++)
                this.energyChunkList[i].translate(translation);
        },

        addEnergyChunk: function(chunk) {
            chunk.set('zPosition', this.zPosition);
            this.energyChunkList.add(chunk);
        },

        removeEnergyChunk: function(chunk) {
            return this.energyChunkList.remove(chunk);
        },

        containsEnergyChunk: function(chunk) {
            return this.energyChunkList.get(chunk) ? true : false;
        },

        getNumEnergyChunks: function() {
            return this.energyChunkList.length;
        },

        getBounds: function() {
            if (this.shape instanceof Rectangle)
                return this.shape;
            else
                return this.shape.getBounds();
        },

        getShape: function() {
            return this.shape;
        }

    });

    return EnergyChunkContainerSlice;
});
