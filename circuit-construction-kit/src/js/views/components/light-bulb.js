define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Vector2     = require('common/math/vector2');

    var ComponentView = require('views/component');
    var FilamentView  = require('views/components/filament');

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
         * Initializes the new LightBulbView.
         */
        initialize: function(options) {
            // Cached objects
            this._vec = new Vector2();

            ComponentView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:current change:voltageDrop', this.updateIntensity);
        },

        initComponentGraphics: function() {
            this.spriteLayer = new PIXI.Container();

            this.offTexture = Assets.Texture(Assets.Images.BULB_OFF);
            this.onTexture  = Assets.Texture(Assets.Images.BULB_ON);

            this.schematicOffTexture = Assets.Texture(Assets.Images.SCHEMATIC_BULB_OFF);
            this.schematicOnTexture  = Assets.Texture(Assets.Images.SCHEMATIC_BULB_ON);

            this.offSprite = new PIXI.Sprite(this.offTexture);
            this.onSprite  = new PIXI.Sprite(this.onTexture);
            this.offSprite.anchor.x = this.onSprite.anchor.x = 0.5;
            this.offSprite.anchor.y = this.onSprite.anchor.y = 1;
            this.onSprite.alpha = 0;

            this.glow = Assets.createSprite(Assets.Images.BULB_GLOW);
            this.glow.anchor.x = 0.5;
            this.glow.anchor.y = 0.5;
            this.glow.y = -this.onTexture.height / 2;
            this.glow.alpha = 0;

            this.spriteLayer.addChild(this.offSprite);
            this.spriteLayer.addChild(this.onSprite);

            this.effectsLayer.addChild(this.glow);

            this.filamentView = new FilamentView({
                mvt: this.mvt,
                model: this.model.filament
            });

            this.displayObject.addChild(this.filamentView.displayObject);
            this.displayObject.addChild(this.spriteLayer);
            
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = 'move';
        },

        initHoverGraphics: function() {
            this.hoverLayer.removeChildren();

            var mask = Assets.createSprite(this.circuit.get('schematic') ? Assets.Images.SCHEMATIC_BULB_MASK : Assets.Images.BULB_MASK);
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
            this.updateGraphics();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            ComponentView.prototype.updateMVT.apply(this, arguments);

            this.updateGraphics();
            this.filamentView.updateMVT(mvt);
        },

        updateGraphics: function() {
            // Direction vector from start to end junctions in model space
            var vec = this._vec
                .set(this.model.getEndPoint())
                .sub(this.model.getStartPoint());

            var modelLength = vec.length();
            var viewLength = this.mvt.modelToViewDeltaX(modelLength);
            var viewWidth = viewLength / LightBulbView.LENGTH_TO_WIDTH_RATIO;
            var imageWidth = this.onSprite.texture.width;
            var scale = viewWidth / imageWidth;

            var angle = Math.atan2(vec.y, vec.x);
            angle -= LightBulbView.getRotationOffset(this.model.get('connectAtLeft'));
            angle -= Math.PI / 2;

            if (Math.abs(scale) > 1E-4) {
                this.spriteLayer.scale.x = scale;
                this.spriteLayer.scale.y = scale;
                
                this.hoverLayer.scale.x = scale;
                this.hoverLayer.scale.y = scale;
            }

            this.spriteLayer.rotation = angle;
            this.hoverLayer.rotation = angle;

            var viewStartPosition = this.mvt.modelToView(this.model.getStartPoint());
            this.spriteLayer.x = viewStartPosition.x;
            this.spriteLayer.y = viewStartPosition.y;

            this.hoverLayer.x = viewStartPosition.x;
            this.hoverLayer.y = viewStartPosition.y;

            this.effectsLayer.x = viewStartPosition.x;
            this.effectsLayer.y = viewStartPosition.y;
        },

        updateSprites: function() {
            if (this.circuit.get('schematic')) {
                this.onSprite.texture = this.schematicOnTexture;
                this.offSprite.texture = this.schematicOffTexture;
            }
            else {
                this.onSprite.texture = this.onTexture;
                this.offSprite.texture = this.offTexture;
            }
            this.initHoverGraphics();
            this.updateGraphics();
        },

        updateIntensity: function(time, deltaTime) {
            var intensity = this.model.getIntensity();

            if (isNaN(intensity))
                throw 'intensity NaN';
            
            this.onSprite.alpha = intensity;
            this.glow.alpha = intensity;
        },

        initContextMenu: function($contextMenu) {
            ComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeResistanceMenuItem($contextMenu);
            this.initFlipMenuItem($contextMenu);
        },

        initFlipMenuItem: function($contextMenu) {
            $contextMenu.on('click', '.flip-btn', _.bind(this.flip, this));
        },

        flip: function() {
            this.model.flip(this.circuit);
            this.model.set('selected', false);
            this.updateGraphics();
            this.hidePopover();
        },

        generateTexture: function() {
            var texture = PIXI.Texture.EMPTY;
            return texture;
        },

        schematicModeChanged: function(circuit, schematic) {
            ComponentView.prototype.schematicModeChanged.apply(this, arguments);

            this.updateSprites();
        }

    }, _.extend({

        getRotationOffset: function(connectAtLeft) {
            var x = LightBulbView.END_POINT_OFFSET_PERCENT_X;
            var y = LightBulbView.END_POINT_OFFSET_PERCENT_Y;
            var sign = connectAtLeft ? 1 : -1;
            return -Math.atan2(x, -y) * sign;
        },

        getDefaultRotation: function() {
            var x = LightBulbView.END_POINT_OFFSET_PERCENT_X;
            var y = LightBulbView.END_POINT_OFFSET_PERCENT_Y;
            return Math.atan2(-y, x);
        }

    }, Constants.LightBulbView));

    return LightBulbView;
});