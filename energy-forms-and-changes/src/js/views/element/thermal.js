define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');

    var ElementView = require('views/element');
    var EnergyChunkView = require('views/energy-chunk');
    var EnergyChunkContainerSliceView = require('views/energy-chunk-container-slice');

    var thermalWanderingChunks = 0;
    var $thermalWanderingChunks = $('<div></div>').appendTo('body').wrap('<div> thermal wandering chunks: </div>');

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

            this.sliceViews = [];
            _.each(this.model.slices, function(slice) {
                var view = new EnergyChunkContainerSliceView({
                    slice: slice,
                    mvt: this.mvt,
                    parent: this.model
                });
                energyChunkLayer.addChild(view.displayObject);
                this.sliceViews.push(view);
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
                mvt: this.mvt,
                parent: this.model
            });
            this.approachingEnergyChunkLayer.addChild(view.displayObject);
            this.approachingEnergyChunkViews.push(view);
            thermalWanderingChunks++;
            $thermalWanderingChunks.html(thermalWanderingChunks);
        },

        approachingEnergyChunkRemoved: function(chunk) {
            for (var i = 0; i < this.approachingEnergyChunkViews.length; i++) {
                if (this.approachingEnergyChunkViews[i].model === chunk) {
                    this.approachingEnergyChunkViews[i].stopListening();
                    this.approachingEnergyChunkLayer.removeChild(this.approachingEnergyChunkViews[i].displayObject);
                    this.approachingEnergyChunkViews.splice(i, 1);
                    break;
                }
            }
            thermalWanderingChunks--;
            $thermalWanderingChunks.html(thermalWanderingChunks);
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.sliceViews.length; i++)
                this.sliceViews[i].update(time, deltaTime);
            for (var j = 0; j < this.approachingEnergyChunkViews.length; j++)
                this.approachingEnergyChunkViews[j].update(time, deltaTime);
        },

    });

    return ThermalElementView;
});