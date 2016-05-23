define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PositionableView          = require('views/positionable');
    var EnergyChunkCollectionView = require('views/energy-chunk-collection');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var EnergySystemsElementView = PositionableView.extend({

        /**
         *
         */
        initialize: function(options) {
            this.energyChunkCollectionViews = [];

            PositionableView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:opacity', this.updateOpacity);
            this.updateOpacity(this.model, this.model.get('opacity'));
        },

        initGraphics: function() {
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer.visible = false;

            this.createEnergyChunkCollectionView('energyChunkCollectionLayer', this.model.energyChunks);
            this.energyChunkLayer.addChild(this.energyChunkCollectionLayer);
        },

        createEnergyChunkCollectionView: function(layerName, energyChunkCollection) {
            var energyChunkCollectionView = new EnergyChunkCollectionView({
                collection: energyChunkCollection,
                mvt: this.mvt
            });

            energyChunkCollectionView.hide();

            this.energyChunkCollectionViews.push(energyChunkCollectionView);
            this[layerName] = energyChunkCollectionView.displayObject;
        },

        createSpriteWithOffset: function(image, offset, anchorX, anchorY) {
            var sprite = (image instanceof PIXI.Texture) ? new PIXI.Sprite(image) : Assets.createSprite(image);

            var imageScale = this.getImageScale();
            sprite.scale.x = imageScale;
            sprite.scale.y = imageScale;

            if (anchorX === undefined)
                anchorX = 0;
            if (anchorY === undefined)
                anchorY = anchorX;

            sprite.anchor.x = anchorX;
            sprite.anchor.y = anchorY;

            var centerXOffset = (anchorX - 0.5) * sprite.width;
            var centerYOffset = (anchorY - 0.5) * sprite.height;

            if (offset) {
                sprite.x = centerXOffset + this.mvt.modelToViewDeltaX(offset.x);
                sprite.y = centerYOffset + this.mvt.modelToViewDeltaY(offset.y);    
            }
            else {
                sprite.x = centerXOffset;
                sprite.y = centerYOffset;
            }
            return sprite;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
            for (var i = 0; i < this.energyChunkCollectionViews.length; i++)
                this.energyChunkCollectionViews[i].show();
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
            for (var i = 0; i < this.energyChunkCollectionViews.length; i++)
                this.energyChunkCollectionViews[i].hide();
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.energyChunkCollectionViews.length; i++)
                this.energyChunkCollectionViews[i].update(time, deltaTime);
        },

        updateOpacity: function(model, opacity) {
            this.displayObject.alpha = opacity;
        },

        /**
         * The images were originally meant to be rendered at their
         *   natural size when the MVT is at its default zoom level,
         *   so we need to find out the ratio of the current zoom
         *   level to the default one and scale all our graphics
         *   accordingly.
         */
        getImageScale: function() {
            return this.mvt.getXScale() / Constants.EnergySystemsSimulationView.DEFAULT_MVT_SCALE;
        }

    });

    return EnergySystemsElementView;
});