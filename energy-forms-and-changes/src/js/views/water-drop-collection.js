define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');


    /**
     * A view that represent a collection of water drops
     */
    var WaterDropCollectionView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            this.collection = options.collection;
            this.initGraphics();
            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            
            this.displayObject.addChild(this.graphics);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.update();
        },

        update: function() {
            if (!this.displayObject.visible)
                return;

            var mvt = this.mvt;
            var models = this.collection.models;
            var graphics = this.graphics;

            graphics.clear();
            graphics.beginFill(Colors.parseHex(Constants.WATER_FILL_COLOR), 1);
            
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                var x = this.mvt.modelToViewDeltaX(model.get('position').x);
                var y = this.mvt.modelToViewDeltaY(model.get('position').y);
                var width  = mvt.modelToViewDeltaX(model.get('width'));
                var height = -mvt.modelToViewDeltaY(model.get('height'));
                graphics.drawEllipse(x, y, width / 2, height / 2);
            }

            graphics.endFill();
        }

    });

    return WaterDropCollectionView;
});