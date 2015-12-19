define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');

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
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

        initComponentGraphics: function() {
            RectangularComponentView.prototype.initComponentGraphics.apply(this, arguments);

            this.handle = Assets.createSprite(Assets.Images.SWITCH_HANDLE);
            this.handle.anchor.x = 1;
            this.handle.anchor.y = 0.5;
            this.handle.x = 305;
            this.handle.y = -61;
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'move';

            this.pivot = Assets.createSprite(Assets.Images.SWITCH_BASE_PIVOT);
            this.pivot.anchor.y = 1;
            this.pivot.x = 290;
            this.pivot.y = -31;

            this.sprite.addChild(this.handle);
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
            SwitchView.setSomeComponentIsDragging(true);
            this.handleDragging = true;
            event.stopPropagation();
            console.log('hey')
        },

        handleDrag: function(event) {
            if (this.handleDragging) {
                
            }
        },

        handleDragEnd: function(event) {
            if (this.handleDragging) {
                SwitchView.setSomeComponentIsDragging(false);

                console.log('dragging handle')

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