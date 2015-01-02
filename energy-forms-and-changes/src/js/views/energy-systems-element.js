define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var PositionableView = require('views/positionable');
    var EnergyChunkView  = require('views/energy-chunk');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var EnergySystemsElementView = PositionableView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            PositionableView.prototype.initialize.apply(this, [options]);

            this.energyChunkViews = [];

            this.listenTo(this.model.energyChunks, 'add',    this.energyChunkAdded);
            this.listenTo(this.model.energyChunks, 'remove', this.energyChunkRemoved);
        },

        initGraphics: function() {
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer.visible = false;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
        },

        energyChunkAdded: function(chunk) {
            var chunkView = new EnergyChunkView({
                model: chunk,
                mvt: this.mvt
            });
            this.energyChunkViews.push(chunkView);
            this.energyChunkLayer.addChild(chunkView.displayObject);
        },

        energyChunkRemoved: function(chunk) {
            for (var i = this.energyChunkViews.length - 1; i >= 0; i--) {
                if (this.energyChunkViews[i].model === chunk) {
                    this.energyChunkViews[i].remove(this.energyChunkLayer);
                    this.energyChunkViews.splice(i, 1);
                    break;
                }
            }
        },

        update: function(time, deltaTime) {
            for (var j = 0; j < this.energyChunkViews.length; j++)
                this.energyChunkViews[j].update(time, deltaTime);
        },

    });

    return EnergySystemsElementView;
});