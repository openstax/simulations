define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Vector2     = require('common/math/vector2');

    var RectangularComponentView = require('views/components/rectangular');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents a resistor
     */
    var SwitchView = RectangularComponentView.extend({

        imagePath:     Assets.Images.SWITCH_BASE,
        maskImagePath: Assets.Images.SWITCH_MASK,

        schematicImagePath:     Assets.Images.SCHEMATIC_SWITCH_BASE,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_SWITCH_MASK,

        anchorY: 0.68,
        schematicAnchorY: 0.5,
        schematicAngleOffset: 0.21,

        events: _.extend({}, RectangularComponentView.prototype.events, {
            'touchstart      .handle': 'handleDragStart',
            'mousedown       .handle': 'handleDragStart',
            'touchmove       .handle': 'handleDrag',
            'mousemove       .handle': 'handleDrag',
            'touchend        .handle': 'handleDragEnd',
            'mouseup         .handle': 'handleDragEnd',
            'touchendoutside .handle': 'handleDragEnd',
            'mouseupoutside  .handle': 'handleDragEnd',
            'mouseover       .handle': 'handleHover',
            'mouseout        .handle': 'handleUnhover'
        }),

        /**
         * Initializes the new SwitchView.
         */
        initialize: function(options) {
            this._pivotToPointer = new Vector2();

            this.defaultAnchorY = this.anchorY;

            RectangularComponentView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:handleAngle', this.updateHandleAngle);
            this.updateHandleAngle(this.model, this.model.get('handleAngle'));
        },

        initComponentGraphics: function() {
            RectangularComponentView.prototype.initComponentGraphics.apply(this, arguments);

            this.handleTexture          = Assets.Texture(Assets.Images.SWITCH_HANDLE);
            this.schematicHandleTexture = Assets.Texture(Assets.Images.SCHEMATIC_SWITCH_HANDLE);

            this.handle = new PIXI.Sprite(this.handleTexture);
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'move';

            this.handleWrapper = new PIXI.Container();
            this.handleWrapper.addChild(this.handle);

            this.pivot = Assets.createSprite(Assets.Images.SWITCH_BASE_PIVOT);
            this.pivot.anchor.y = 1;
            this.pivot.x = 290;
            this.pivot.y = -31;

            this.sprite.addChild(this.handleWrapper);
            this.sprite.addChild(this.pivot);

            this.initHandleHoverGraphics();
        },

        initHandleHoverGraphics: function() {
            var mask = Assets.createSprite(
                this.circuit.get('schematic') ? 
                    Assets.Images.SCHEMATIC_SWITCH_HANDLE_MASK : 
                    Assets.Images.SWITCH_HANDLE_MASK
            );
            mask.anchor.x = this.handle.anchor.x;
            mask.anchor.y = this.handle.anchor.y;

            var bounds = mask.getLocalBounds();
            var hoverGraphics = new PIXI.Graphics();
            hoverGraphics.beginFill(this.selectionColor, 1);
            hoverGraphics.drawRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
            hoverGraphics.endFill();
            hoverGraphics.mask = mask;

            this.handle.addChild(mask);
            this.handle.addChild(hoverGraphics);

            this.handleHoverGraphics = hoverGraphics;
            this.hideHandleHoverGraphics();
        },

        updateHandleAngle: function(model, handleAngle) {
            if (this.circuit.get('schematic'))
                this.handle.rotation = handleAngle + this.schematicAngleOffset;
            else
                this.handle.rotation = handleAngle;
        },

        showHoverGraphics: function() {
            RectangularComponentView.prototype.showHoverGraphics.apply(this, arguments);

            this.showHandleHoverGraphics();
        },

        hideHoverGraphics: function() {
            RectangularComponentView.prototype.hideHoverGraphics.apply(this, arguments);

            if (!this.handleHovering)
                this.hideHandleHoverGraphics();
        },

        handleDragStart: function(event) {
            SwitchView.setSomeComponentDragging(true);
            this.handleDragging = true;
            event.stopPropagation();
        },

        handleDrag: function(event) {
            if (this.handleDragging) {

                var pivotToPointer = this.handleWrapper.toLocal(event.data.global);
                var pivotToPointerAngle = this._pivotToPointer.set(pivotToPointer.x, pivotToPointer.y).angle();

                var angle = pivotToPointerAngle - Math.PI;

                if (this.circuit.get('schematic'))
                    angle -= this.schematicAngleOffset;

                if (angle > Constants.Switch.MAX_HANDLE_ANGLE || angle < -Math.PI / 2)
                    angle = Constants.Switch.MAX_HANDLE_ANGLE;
                else if (angle < 0)
                    angle = 0;

                this.model.set('handleAngle', angle);
            }
        },

        handleDragEnd: function(event) {
            if (this.handleDragging) {
                this.handleDragging = false;

                SwitchView.setSomeComponentDragging(false);

                if (!this.handleHovering)
                    this.hideHandleHoverGraphics();
            }
        },

        hover: function() {
            if (this.dragging || !SwitchView.someComponentIsDragging()) {
                this.hovering = true;
                if (!this.handleHovering)
                    this.showHoverGraphics();    
            }
        },

        handleHover: function(event) {
            if (this.handleDragging || !SwitchView.someComponentIsDragging()) {
                this.handleHovering = true;
                this.hideHoverGraphics();
                this.showHandleHoverGraphics();
            }
        },

        handleUnhover: function(event) {
            this.handleHovering = false;
            if (!this.handleDragging && !this.model.get('selected')) {
                if (!this.hovering && !this.dragging)
                    this.hideHandleHoverGraphics();
                else
                    this.showHoverGraphics();
            }  
        },

        showHandleHoverGraphics: function() {
            this.handleHoverGraphics.visible = true; 
        },

        hideHandleHoverGraphics: function() {
            this.handleHoverGraphics.visible = false;
        },

        schematicModeChanged: function(circuit, schematic) {
            if (schematic) {
                this.pivot.visible = false;
                this.handleWrapper.x = 255;
                this.handleWrapper.y = 0;
                this.handle.texture = this.schematicHandleTexture;
                this.handle.anchor.x = (164 / 190);
                this.handle.anchor.y = (26 / 52);
                this.anchorY = this.sprite.anchor.y = this.schematicAnchorY;
            }
            else {
                this.pivot.visible = true;
                this.handleWrapper.x = 305;
                this.handleWrapper.y = -61;
                this.handle.texture = this.handleTexture;
                this.handle.anchor.x = 1;
                this.handle.anchor.y = 0.5;
                this.anchorY = this.sprite.anchor.y = this.defaultAnchorY;
            }

            this.handle.removeChild(this.handleHoverGraphics.mask);
            this.handle.removeChild(this.handleHoverGraphics);

            RectangularComponentView.prototype.schematicModeChanged.apply(this, arguments);

            this.initHandleHoverGraphics();
            this.updateHandleAngle(this.model, this.model.get('handleAngle'));
        },

    });

    return SwitchView;
});