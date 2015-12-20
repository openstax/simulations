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

        anchorY: 0.68,

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

            RectangularComponentView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:handleAngle', this.updateHandleAngle);
        },

        initComponentGraphics: function() {
            RectangularComponentView.prototype.initComponentGraphics.apply(this, arguments);

            this.handle = Assets.createSprite(Assets.Images.SWITCH_HANDLE);
            this.handle.anchor.x = 1;
            this.handle.anchor.y = 0.5;
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'move';

            this.handleWrapper = new PIXI.Container();
            this.handleWrapper.x = 305;
            this.handleWrapper.y = -61;
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
            var mask = Assets.createSprite(Assets.Images.SWITCH_HANDLE_MASK);
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

                // TODO:
                // Instead of keeping track of starting angle and everything, let's just
                //   use the dot product between the component's direction vector and
                //   the vector from the pivot to our pointer.
                //
                //   A dot B = |A| * |B| * cos(t)
                //   cos(t) = (A dot B) / (|A| * |B|)
                //   t = acos((A dot B) / (|A| * |B|))

                // var pivot = this._pivot
                //     .set(this.displayObject.x, this.displayObject.y)
                //     .add(this.handle.x, this.handle.y);

                // var pivotToPointer = this._pivotToPointer
                //     .set(event.data.global.x, event.data.global.y)
                //     .sub(pivot);

                var pivotToPointer = this.handleWrapper.toLocal(event.data.global);
                pivotToPointer = this._pivotToPointer.set(pivotToPointer.x, pivotToPointer.y);
                // var pivotToPointer = event.data.getLocalPosition(this.handleWrapper, this._pivotToPointer);
                var componentDirection = this._direction.set(this.model.getStartPoint()).sub(this.model.getEndPoint());

                var theta = 0;
                var magProduct = pivotToPointer.length() * componentDirection.length();
                if (magProduct)
                    theta = Math.acos(pivotToPointer.dot(componentDirection) / magProduct);

                if (theta > Math.PI)
                    theta = Math.PI;
                if (theta < 0)
                    theta = 0;

                this.model.set('handleAngle', theta);
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

    });

    return SwitchView;
});