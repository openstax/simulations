define(function(require) {

    'use strict';

    var PixiView = require('common/pixi/view');

    var EnergyChunkView = require('views/energy-chunk');

    /**
     * A view that represents the air model
     */
    var EnergyChunkContainerSliceView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            if (options.slice === undefined)
                throw 'EnergyChunkContainerSliceView requires an EnergyChunkContainerSlice object.';

            this.slice = options.slice;

            if (options.mvt === undefined)
                throw 'EnergyChunkContainerSliceView requires a ModelViewTransform object specified in the options as "mvt".';
            
            this.mvt = options.mvt;

            this.parent = options.parent;

            this.views = [];

            this.initGraphics();

            this.listenTo(this.slice.energyChunkList, 'add',    this.chunkAdded);
            this.listenTo(this.slice.energyChunkList, 'remove', this.chunkRemoved);
            this.listenTo(this.slice.energyChunkList, 'reset',  this.chunksReset);
        },

        initGraphics: function() {
            // Populate it with what's already in the collection
            this.slice.energyChunkList.each(this.chunkAdded, this);
        },

        chunkAdded: function(chunk) {
            var energyChunkView = new EnergyChunkView({
                model: chunk,
                mvt: this.mvt
            });
            this.displayObject.addChild(energyChunkView.displayObject);
            this.views.push(energyChunkView);
        },

        chunkRemoved: function(chunk) {
            for (var i = 0; i < this.views.length; i++) {
                if (this.views[i].model === chunk) {
                    this.views[i].removeFrom(this.displayObject);
                    this.views.slice(i, 1);
                    break;
                }
            }
        },

        chunksReset: function() {
            for (var i = this.views.length - 1; i >= 0; i--) {
                this.views[i].removeFrom(this.displayObject);
                this.views.splice(i, 1);
            }
        },

        forcePositionUpdate: function() {
            for (var i = 0; i < this.views.length; i++)
                this.views[i].forcePositionUpdate();
        },

        update: function(time, deltaTime) {
            for (var i = 0; i < this.views.length; i++)
                this.views[i].update(time, deltaTime);
        }

    });

    return EnergyChunkContainerSliceView;
});