define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView  = require('common/v3/pixi/view');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var CompassNeedleTexture = require('views/compass-needle-texture');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var AbstractBFieldView = PixiView.extend({

        /**
         * Initializes the new AbstractBFieldView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.magnetModel = options.magnetModel;
            this.xSpacing = options.xSpacing;
            this.ySpacing = options.ySpacing;
            this.needleWidth = options.needleWidth;
            this.bounds = new Rectangle(options.bounds);
            this.intensityScale = Constants.GRID_INTENSITY_SCALE;
            
            // Cached objects
            this._point = new Vector2();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.needleSprites = new PIXI.Container();
            this.displayObject.addChild(this.needleSprites);

            this.updateMVT(this.mvt);
        },

        createNeedleSprites: function() {},

        createNeedleSpriteAt: function(x, y) {
            var sprite = new PIXI.Sprite(this.needleTexture);
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.x = x;
            sprite.y = y;
            sprite.modelX = this.mvt.viewToModelX(x);
            sprite.modelY = this.mvt.viewToModelY(y);
            this.needleSprites.addChild(sprite);
        },

        setGridBounds: function(x, y, width, height) {
            this.bounds.set(x, y, width, height);
            this.createNeedleSprites();
        },

        setNeedleSpacing: function(spacing) {
            this.xSpacing = spacing;
            this.ySpacing = spacing;

            this.updateGrid();
        },

        setNeedleWidth: function(width) {
            this.needleWidth = width;
            
            this.updateGrid();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.needleTexture = CompassNeedleTexture.create(this.mvt.modelToViewDeltaX(this.needleWidth));
            this.needleSprites.removeChildren();
            this.createNeedleSprites();

            this.update();
        },

        updateGrid: function() {
            this.updateMVT(this.mvt);
        },

        update: function() {
            if (!this.hidden) {
                this.updateStrengthAndDirection();
            }
        },

        updateStrengthAndDirection: function() {
            var point = this._point;
            var needleSprites = this.needleSprites.children;
            var needleSprite;
            for (var i = 0; i < needleSprites.length; i++) {
                needleSprite = needleSprites[i];

                if (this.magnetModel.get('strength') === 0) {
                    needleSprite.alpha = 0;
                }
                else {
                    // Get the magnetic field information at the needle's location.
                    point.set(needleSprite.modelX, needleSprite.modelY);
                    var fieldVector = this.magnetModel.getBField(point);
                    var angle = fieldVector.angle();
                    var magnitude = fieldVector.length();

                    // convert scaled magnitude to intensity
                    var intensity = (magnitude / this.magnetModel.get('maxStrength'));

                    // scale the intensity, because in reality this drops off and we wouldn't see much of the field
                    var scaledIntensity = Math.pow(intensity, 1 / this.intensityScale);

                    // increase the intensity of compass needles just outside ends of magnet to improve the "look"
                    scaledIntensity *= 2;
                    if (scaledIntensity > 1)
                        scaledIntensity = 1;

                    // Update the grid point.
                    needleSprite.alpha = scaledIntensity;
                    needleSprite.rotation = angle;
                }
            }
        },

        show: function() {
            this.hidden = false;
            this.update();
            this.displayObject.visible = true;
        },

        hide: function() {
            this.hidden = true;
            this.displayObject.visible = false;
        }

    });


    return AbstractBFieldView;
});