define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');

    var IntroElementView = require('views/intro-element');
    var EnergyChunkView  = require('views/energy-chunk');
    var EnergyChunkContainerSliceView = require('views/energy-chunk-container-slice');

    /**
     * A view that represents a block model
     */
    var ThermalElementView = IntroElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            IntroElementView.prototype.initialize.apply(this, [options]);
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
        },

        approachingEnergyChunkRemoved: function(chunk) {
            for (var i = 0; i < this.approachingEnergyChunkViews.length; i++) {
                if (this.approachingEnergyChunkViews[i].model === chunk) {
                    this.approachingEnergyChunkViews[i].removeFrom(this.approachingEnergyChunkLayer);
                    this.approachingEnergyChunkViews.splice(i, 1);
                    break;
                }
            }
        },

        forceEnergyChunkPositionsUpdate: function() {
            for (var i = 0; i < this.sliceViews.length; i++)
                this.sliceViews[i].forcePositionUpdate();
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