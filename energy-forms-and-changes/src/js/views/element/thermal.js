define(function(require) {

    'use strict';

    var _ = require('underscore');

    var IntroElementView              = require('views/intro-element');
    var EnergyChunkCollectionView     = require('views/energy-chunk-collection');
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

            this.approachingEnergyChunkCollectionView = new EnergyChunkCollectionView({
                collection: this.model.approachingEnergyChunks,
                mvt: this.mvt
            });

            energyChunkLayer.addChild(this.approachingEnergyChunkCollectionView.displayObject);
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.sliceViews.length; i++)
                this.sliceViews[i].update(time, deltaTime);

            this.approachingEnergyChunkCollectionView.update(time, deltaTime);
        }

    });

    return ThermalElementView;
});