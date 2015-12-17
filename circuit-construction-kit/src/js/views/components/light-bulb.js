define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Vector2     = require('common/math/vector2');

    var ComponentView = require('views/component');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents a resistor
     */
    var LightBulbView = ComponentView.extend({

        contextMenuContent: 
            '<li><a class="change-resistance-btn"><span class="fa fa-bolt"></span>&nbsp; Change Resistance</a></li>' +
            '<li><a class="flip-btn"><span class="fa fa-arrows-h"></span>&nbsp; Show Connection at Left</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            '<hr>' +
            ComponentView.prototype.contextMenuContent,

        /**
         * The percent of the image width/height that would equal the offset from the
         *   origin (the start junction) to the end junction
         */
        endPointOffsetPercentX: (25 / 125), 
        endPointOffsetPercentY: (40 / 213),
        /**
         * Ratio of the length of the vector from start to end junction in pixels to
         *   width of the image in pixels
         */
        lengthToWidthRatio: Math.sqrt(25 * 25 + 40 * 40) / 125,

        /**
         * Initializes the new LightBulbView.
         */
        initialize: function(options) {
            // Cached objects
            this._vec = new Vector2();

            this.defaultOffsetLengthToWidthRatio = 

            ComponentView.prototype.initialize.apply(this, [options]);
        },

        initComponentGraphics: function() {
            this.offSprite = Assets.createSprite(Assets.Images.BULB_OFF);
            this.onSprite  = Assets.createSprite(Assets.Images.BULB_ON);
            this.offSprite.anchor.x = this.onSprite.anchor.x = 0.5;
            this.offSprite.anchor.y = this.onSprite.anchor.y = 1;
            this.onSprite.alpha = 0;
            this.displayObject.addChild(this.offSprite);
            this.displayObject.addChild(this.onSprite);
            
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = 'move';
        },

        initHoverGraphics: function() {
            var mask = Assets.createSprite(Assets.Images.BULB_MASK);
            mask.anchor.x = 0.5;
            mask.anchor.y = 1;

            var bounds = mask.getLocalBounds();
            var hoverGraphics = new PIXI.Graphics();
            hoverGraphics.beginFill(this.selectionColor, 1);
            hoverGraphics.drawRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
            hoverGraphics.endFill();
            hoverGraphics.mask = mask;

            this.hoverLayer.addChild(mask);
            this.hoverLayer.addChild(hoverGraphics);
        },

        junctionsChanged: function() {
            this.update();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            ComponentView.prototype.updateMVT.apply(this, arguments);

            this.update();
        },

        update: function() {
            // Direction vector from start to end junctions in model space
            var vec = this._vec
                .set(this.model.getEndPoint())
                .sub(this.model.getStartPoint());

            var modelLength = vec.length();
            var viewLength = this.mvt.modelToViewDeltaX(modelLength);
            var viewWidth = viewLength / this.lengthToWidthRatio;
            var imageWidth = this.onSprite.texture.width;
            var scale = viewWidth / imageWidth;

            var angle = vec.angle();
            angle += LightBulbView.getRotationOffset(this.model.get('connectAtLeft'));

            if (Math.abs(scale) > 1E-4) {
                this.displayObject.scale.x = scale;
                this.displayObject.scale.y = scale;
                
                this.hoverLayer.scale.x = scale;
                this.hoverLayer.scale.y = scale;
            }

            this.displayObject.rotation = angle;
            this.hoverLayer.rotation = angle;

            var viewStartPosition = this.mvt.modelToView(this.model.getStartPoint());
            this.displayObject.x = viewStartPosition.x;
            this.displayObject.y = viewStartPosition.y;

            this.hoverLayer.x = viewStartPosition.x;
            this.hoverLayer.y = viewStartPosition.y;
        },

        initContextMenu: function($contextMenu) {
            ComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeResistanceMenuItem($contextMenu);
        },

        generateTexture: function() {
            var texture = PIXI.Texture.EMPTY;
            return texture;
        }

    }, {

        getRotationOffset: function(connectAtLeft) {
            var x = this.endPointOffsetPercentX;
            var y = this.endPointOffsetPercentY;
            var sign = connectAtLeft ? 1 : -1;
            return -Math.atan2(x, y) * sign;
        }

    });

    return LightBulbView;
});