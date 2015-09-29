define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');

    /**
     * A view that represents a resistor core
     */
    var Core = PixiView.extend({

        /**
         * Initializes the new Core.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var sprite = Assets.createSprite(Assets.Images.CORE);
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.alpha = 0.9;

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
            var viewPosition = this.mvt.modelToView(this.model.get('position'));
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y; 
        },

        update: function() {
            this.updatePosition();
        }

    });


    return Core;
});