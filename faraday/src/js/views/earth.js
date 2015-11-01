define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');

    /**
     * 
     */
    var EarthView = PixiView.extend({

        /**
         * Initializes the new EarthView.
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
            this.earth = Assets.createSprite(Assets.Images.EARTH);
            this.earth.anchor.x = 0.5;
            this.earth.anchor.y = 0.5;
            this.earth.alpha = 0.6;

            this.displayObject.addChild(this.earth);

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFF0000, 1);
            graphics.drawCircle(0, 0, 2);
            graphics.endFill();
            this.displayObject.addChild(graphics);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(360);
            var scale = targetWidth / this.earth.texture.width;
            this.earth.scale.x = scale;
            this.earth.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });


    return EarthView;
});