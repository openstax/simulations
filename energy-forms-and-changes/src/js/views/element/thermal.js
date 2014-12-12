define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');

    var ElementView = require('views/element');
    var EnergyChunkView = require('views/energy-chunk');
    var EnergyChunkContainerSliceView = require('views/energy-chunk-container-slice');

    /**
     * A view that represents a block model
     */
    var ThermalElementView = ElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            ElementView.prototype.initialize.apply(this, [options]);
        },

        initEnergyChunks: function(energyChunkLayer) {
            energyChunkLayer.visible = false;

            _.each(this.model.slices, function(slice) {
                var view = new EnergyChunkContainerSliceView({
                    slice: slice,
                    mvt: this.mvt
                });
                energyChunkLayer.addChild(view.displayObject);
            }, this);

            this.approachingEnergyChunkViews = [];
            this.approachingEnergyChunkLayer = new PIXI.DisplayObjectContainer();
            energyChunkLayer.addChild(this.approachingEnergyChunkLayer);

            this.listenTo(this.model.approachingEnergyChunks, 'add',    this.approachingEnergyChunkAdded);
            this.listenTo(this.model.approachingEnergyChunks, 'remove', this.approachingEnergyChunkRemoved);
        },

        approachingEnergyChunkAdded: function(chunk) {
            var view = new EnergyChunkView({
                model: chunk,
                mvt: this.mvt
            });
            this.approachingEnergyChunkLayer.addChild(view.displayObject);
            this.approachingEnergyChunkViews.push(view);
        },

        approachingEnergyChunkRemoved: function(chunk) {
            for (var i = 0; i < this.approachingEnergyChunkViews.length; i++) {
                if (this.approachingEnergyChunkViews[i].model === chunk) {
                    this.approachingEnergyChunkViews[i].stopListening();
                    this.approachingEnergyChunkLayer.removeChild(this.approachingEnergyChunkViews[i].displayObject);
                    this.approachingEnergyChunkViews.splice(i, 1);
                    return;
                }
            }
        }

    });

    return ThermalElementView;
});