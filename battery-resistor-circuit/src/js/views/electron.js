define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an electron
     */
    var ElectronView = PixiView.extend({

        /**
         * Initializes the new ElectronView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var sprite = Assets.createSprite(Assets.Images.ELECTRON);
            sprite.anchor.x = sprite.anchor.y = 0.5;

            this.displayObject.addChild(sprite);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.update();
        },

        updatePosition: function() {
            // First we need to convert wire position to (x,y) and then to view
            var modelPosition = this.model.wirePatch.getPosition(this.model.position);
            if (modelPosition) {
                var viewPosition = this.mvt.modelToView(modelPosition);
                this.displayObject.x = viewPosition.x;
                this.displayObject.y = viewPosition.y;    
            }
            // else {
            //     console.log(this.model.position)
            // }
        },

        update: function() {
            this.updatePosition();
        }

    });


    return ElectronView;
});