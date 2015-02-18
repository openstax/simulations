define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');
    var range    = require('common/math/range');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the particle tank
     */
    var ParticleTankView = PixiView.extend({

        events: {
            'touchstart      .lid': 'dragStart',
            'mousedown       .lid': 'dragStart',
            'touchmove       .lid': 'drag',
            'mousemove       .lid': 'drag',
            'touchend        .lid': 'dragEnd',
            'mouseup         .lid': 'dragEnd',
            'touchendoutside .lid': 'dragEnd',
            'mouseupoutside  .lid': 'dragEnd'
        },

        initialize: function(options) {
            options = _.extend({
                lidDraggable: true
            }, options);

            this.simulation = options.simulation;
            this.lidDraggable = options.lidDraggable;

            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.simulation, 'change:particleContainerHeight', this.updateLidPosition);
        },

        initGraphics: function() {
            this.initTank();
            this.initLid();

            this._leftConnectorPosition  = new Vector2();
            this._rightConnectorPosition = new Vector2();
        },

        initTank: function() {
            this.tank = Assets.createSprite(Assets.Images.TANK);
            this.tank.anchor.x = 0.5;
            this.tank.anchor.y = 1;

            this.displayObject.addChild(this.tank);
        },

        initLid: function() {
            this.lidYRange = range({ max: -20, min: -20 - 255  });

            this.lid = Assets.createSprite(Assets.Images.TANK_LID);
            this.lid.anchor.x = 0.5;
            this.lid.anchor.y = 1;
            this.lid.y = this.lidYRange.min;
            if (this.lidDraggable) {
                this.lid.buttonMode = true;
                this.lid.defaultCursor = 'ns-resize';
            }

            this.displayObject.addChild(this.lid);
        },

        updateLidPosition: function() {
            var relativeHeight = this.simulation.get('particleContainerHeight') / Constants.CONTAINER_BOUNDS.height;
            
            this.lid.y = this.lidYRange.lerp(1 - relativeHeight);
        },

        getLeftConnectorPosition: function() {
            return this._leftConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(-this.displayObject.width / 2, -37);
        },

        getRightConnectorPosition: function() {
            return this._rightConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(this.displayObject.width / 2, -37);
        },

        dragStart: function(data) {
            if (!this.lidDraggable)
                return;

            this.dragOffset = data.getLocalPosition(this.lid, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var y = local.y - this.dragOffset.y;
                
                if (y > this.lidYRange.max)
                    y = this.lidYRange.max;
                if (y < this.lidYRange.min)
                    y = this.lidYRange.min;
                    
                this.lid.y = y;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

    });

    return ParticleTankView;
});