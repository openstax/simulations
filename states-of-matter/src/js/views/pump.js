define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var range    = require('common/math/range');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the particle tank
     */
    var PumpView = PixiView.extend({

        events: {
            'touchstart      .handle': 'dragStart',
            'mousedown       .handle': 'dragStart',
            'touchmove       .handle': 'drag',
            'mousemove       .handle': 'drag',
            'touchend        .handle': 'dragEnd',
            'mouseup         .handle': 'dragEnd',
            'touchendoutside .handle': 'dragEnd',
            'mouseupoutside  .handle': 'dragEnd'
        },

        initialize: function(options) {
            this.simulation = options.simulation;
            this.pumpAmount = 0;

            this._leftConnectorPosition  = new Vector2();
            this._rightConnectorPosition = new Vector2();
            this._dragOffset = new PIXI.Point();

            this.initGraphics();
        },

        initGraphics: function() {
            // Base
            this.base = Assets.createSprite(Assets.Images.PUMP_BASE);
            this.base.anchor.x = 0.5;
            this.base.anchor.y = 1;

            // Handle
            this.handle = Assets.createSprite(Assets.Images.PUMP_HANDLE);
            this.handle.anchor.x = 0.5;
            this.handle.anchor.y = 1;
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'move';

            this.handleYRange = range({ 
                min: -this.base.height + this.handle.height * 0.24, 
                max: -this.base.height + this.handle.height * 0.9 
            });
            this.handle.y = this.handleYRange.lerp(0.8);

            this.displayObject.addChild(this.handle);
            this.displayObject.addChild(this.base);

            this.pumpingRequiredToInject = this.handle.height * PumpView.PUMPING_PROPORTION_REQUIRE_TO_INJECT;
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.handle, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.displayObject, this._dragLocation);
                var y = local.y - this.dragOffset.y;
                
                if (y > this.handleYRange.max)
                    y = this.handleYRange.max;
                if (y < this.handleYRange.min)
                    y = this.handleYRange.min;

                var dy = y - this.handle.y;
                if (dy > 0) {
                    this.pumpAmount += dy;
                    if (this.pumpAmount >= this.pumpingRequiredToInject) {
                        this.simulation.injectMolecule();
                        this.pumpAmount = 0;
                    }
                }
                    
                this.handle.y = y;
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        getLeftConnectorPosition: function() {
            return this._leftConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(-22, -37);
        },

        getRightConnectorPosition: function() {
            return this._rightConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(22, -37);
        },

    }, Constants.PumpView);

    return PumpView;
});