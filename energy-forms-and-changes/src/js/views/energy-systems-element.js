define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PositionableView = require('views/positionable');
    var EnergyChunkView  = require('views/energy-chunk');

    var Assets = require('assets');

    /**
     * A view that represents an element model
     */
    var EnergySystemsElementView = PositionableView.extend({

        /**
         *
         */
        initialize: function(options) {
            this.energyChunkLayers = [];

            PositionableView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer.visible = false;

            this.createEnergyChunkLayer('energyChunkLayer', this.model.energyChunks);
        },

        createEnergyChunkLayer: function(layerName, energyChunkCollection) {
            var energyChunkLayer = new PIXI.DisplayObjectContainer();
            energyChunkLayer.visible = false;
            energyChunkLayer.energyChunkViews = [];

            var energyChunkViews = energyChunkLayer.energyChunkViews;

            var energyChunkAdded = function(chunk) {
                var chunkView = new EnergyChunkView({
                    model: chunk,
                    mvt: this.mvt
                });
                energyChunkViews.push(chunkView);
                energyChunkLayer.addChild(chunkView.displayObject);
            };

            var energyChunkRemoved = function(chunk) {
                for (var i = energyChunkViews.length - 1; i >= 0; i--) {
                    if (energyChunkViews[i].model === chunk) {
                        energyChunkViews[i].remove(energyChunkLayer);
                        energyChunkViews.splice(i, 1);
                        break;
                    }
                }
            };

            var energyChunksReset = function() {
                for (var i = energyChunkViews.length - 1; i >= 0; i--) {
                    energyChunkViews[i].remove(energyChunkLayer);
                    energyChunkViews.splice(i, 1);
                }
            };

            this.listenTo(energyChunkCollection, 'add',    energyChunkAdded);
            this.listenTo(energyChunkCollection, 'remove', energyChunkRemoved);
            this.listenTo(energyChunkCollection, 'reset',  energyChunksReset);

            this.energyChunkLayers.push(energyChunkLayer);
            this[layerName] = energyChunkLayer;
        },

        createSpriteWithOffset: function(image, offset, anchorX, anchorY) {
            var sprite = Assets.createSprite(image);

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
            for (var i = 0; i < this.energyChunkLayers.length; i++)
                this.energyChunkLayers[i].visible = true;
        },

        hideEnergyChunks: function() {
            for (var i = 0; i < this.energyChunkLayers.length; i++)
                this.energyChunkLayers[i].visible = false;
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.energyChunkLayers.length; i++) {
                for (var j = 0; j < this.energyChunkLayers[i].energyChunkViews.length; j++)
                    this.energyChunkLayers[i].energyChunkViews[j].update(time, deltaTime);
            }
        }

    });

    return EnergySystemsElementView;
});