define(function(require) {

    'use strict';

    var _    = require('underscore');
    //var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
    var EnergyChunkView = require('views/energy-chunk');

    /**
     * A view that represents the air model
     */
    var AirView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            if (options.mvt === undefined)
                throw 'EnergyChunkView requires a ModelViewTransform object specified in the options as "mvt".';

            this.mvt = options.mvt;

            this.energyChunkViews = [];
            this.displayObject.visible = false;

            this.listenTo(this.model.energyChunkList, 'add',    this.chunkAdded);
            this.listenTo(this.model.energyChunkList, 'remove', this.chunkRemoved);
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.energyChunkViews.length; i++)
                this.energyChunkViews[i].update(time, deltaTime);
        },

        chunkAdded: function(chunk) {
            var energyChunkView = new EnergyChunkView({
                model: chunk,
                mvt: this.mvt,
                parent: this.model
            });
            this.displayObject.addChild(energyChunkView.displayObject);
            this.energyChunkViews.push(energyChunkView);
        },

        chunkRemoved: function(chunk) {
            var energyChunkView = _.findWhere(this.energyChunkViews, { model: chunk });
            this.displayObject.removeChild(energyChunkView.displayObject);
            this.energyChunkViews = _.without(this.energyChunkViews, energyChunkView);
        },

        showEnergyChunks: function() {
            this.displayObject.visible = true;
        },

        hideEnergyChunks: function() {
            this.displayObject.visible = false;
        }

    });

    return AirView;
});