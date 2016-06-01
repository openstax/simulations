define(function(require) {

    'use strict';

    var PixiView = require('common/pixi/view');

    var EnergyChunkCollectionView = require('views/energy-chunk-collection');

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

            this.initGraphics();
        },

        initGraphics: function() {
            this.energyChunkCollectionView = new EnergyChunkCollectionView({
                collection: this.slice.energyChunkList,
                mvt: this.mvt
            });

            this.displayObject.addChild(this.energyChunkCollectionView.displayObject);
        },

        update: function(time, deltaTime) {
            this.energyChunkCollectionView.update(time, deltaTime);
        }

    });

    return EnergyChunkContainerSliceView;
});