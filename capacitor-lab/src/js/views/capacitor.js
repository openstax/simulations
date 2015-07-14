define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var Constants = require('constants');

    /**
     * 
     */
    var CapacitorView = PixiView.extend({

        events: {
            'touchstart      .plateAreaHandle': 'dragPlateAreaStart',
            'mousedown       .plateAreaHandle': 'dragPlateAreaStart',
            'touchmove       .plateAreaHandle': 'dragPlateArea',
            'mousemove       .plateAreaHandle': 'dragPlateArea',
            'touchend        .plateAreaHandle': 'dragPlateAreaEnd',
            'mouseup         .plateAreaHandle': 'dragPlateAreaEnd',
            'touchendoutside .plateAreaHandle': 'dragPlateAreaEnd',
            'mouseupoutside  .plateAreaHandle': 'dragPlateAreaEnd',

            'touchstart      .plateSeparationHandle': 'dragPlateSeparationStart',
            'mousedown       .plateSeparationHandle': 'dragPlateSeparationStart',
            'touchmove       .plateSeparationHandle': 'dragPlateSeparation',
            'mousemove       .plateSeparationHandle': 'dragPlateSeparation',
            'touchend        .plateSeparationHandle': 'dragPlateSeparationEnd',
            'mouseup         .plateSeparationHandle': 'dragPlateSeparationEnd',
            'touchendoutside .plateSeparationHandle': 'dragPlateSeparationEnd',
            'mouseupoutside  .plateSeparationHandle': 'dragPlateSeparationEnd',

            'mouseover .plateAreaHandle'  : 'plateAreaHover',
            'mouseout  .plateAreaHandle'  : 'plateAreaUnhover',
            //'mousedown .plateAreaHandle'  : 'plateAreaDown',
            'mouseover .plateSeparationHandle' : 'plateSeparationHover',
            'mouseout  .plateSeparationHandle' : 'plateSeparationUnhover',
            //'mousedown .plateSeparationHandle' : 'plateSeparationBtnDown',
        },

        initialize: function(options) {
            options = _.extend({
                outlineColor: '#888',
                outlineWidth: 1,
                outlineAlpha: 1,

                labelFontFamily: 'Helvetica Neue',
                labelFontSize: '16px',
                labelColor: '#000',
                labelAlpha: 1,

                handleColor: '#5c35a3',
                handleHoverColor: '#955cff'
            }, options);

            this.mvt = options.mvt;

            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineWidth = options.outlineWidth;
            this.outlineAlpha = options.outlineAlpha;

            this.labelFontFamily = options.labelFontFamily;
            this.labelFontSize = options.labelFontSize;
            this.labelColor = options.labelColor;
            this.labelAlpha = options.labelAlpha;

            this.handleColor = Colors.parseHex(options.handleColor);
            this.handleHoverColor = Colors.parseHex(options.handleHoverColor);

            // Cached objects
            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._position = new Vector2();
            this._ll = new Vector2();
            this._ur = new Vector2();

            // Initialize graphics
            this.initGraphics();

            // Listen for model events
            this.listenTo(this.model, 'change:position',  this.updatePosition);
        },

        initGraphics: function() {
            this.shapeCreator = new CapacitorShapeCreator(this.model, this.mvt);

            this.bottomLayer = new PIXI.DisplayObjectContainer();
            this.middleLayer = new PIXI.DisplayObjectContainer();
            this.topLayer    = new PIXI.DisplayObjectContainer();

            this.displayObject.addChild(this.bottomLayer);
            this.displayObject.addChild(this.middleLayer);
            this.displayObject.addChild(this.topLayer);

            this.initPlates();
            this.initPlateAreaHandle();
            this.initPlateSeparationHandle();
            this.initDielectric();
            
            this.updateMVT(this.mvt);
        },

        initPlates: function() {
            this.topPlate = new PIXI.Graphics();
            this.bottomPlate = new PIXI.Graphics();

            this.topLayer.addChild(this.topPlate);
            this.bottomLayer.addChild(this.bottomPlate);
        },

        initPlateAreaHandle: function() {
            // The rotation should make it look like it's going out diagonally
            //   from the lower left corner of the top plate and planar with it.
            var lowerLeft  = this.getPlateDragCorner();
            var upperRight = this.getOppositePlateDragCorner();
            var rotation = Math.atan2(upperRight.y - lowerLeft.y, upperRight.x - upperRight.y);

            this.plateAreaHandleGraphic = new PIXI.Graphics();
            this.plateAreaHandleHoverGraphic = new PIXI.Graphics();

            this.drawDragHandle(this.plateAreaHandleGraphic,      this.handleColor);
            this.drawDragHandle(this.plateAreaHandleHoverGraphic, this.handleHoverColor);

            this.plateAreaHandleGraphic.hitArea = new PIXI.Circle(0, 0, 17);
            this.plateAreaHandleHoverGraphic.hitArea = new PIXI.Circle(0, 0, 17);

            this.plateAreaHandleGraphic.x = this.plateAreaHandleHoverGraphic.x = -32;

            var dots = new PIXI.Graphics();
            dots.beginFill(0x000000, 1);
            for (var x = -14; x < 0; x += 4)
                dots.drawCircle(x, 0, 1);
            dots.endFill();

            var graphicsWrapper = new PIXI.DisplayObjectContainer();
            graphicsWrapper.rotation = rotation;
            graphicsWrapper.addChild(this.plateAreaHandleGraphic);
            graphicsWrapper.addChild(this.plateAreaHandleHoverGraphic);
            graphicsWrapper.addChild(dots);

            var plateAreaHandle = new PIXI.DisplayObjectContainer();
            plateAreaHandle.buttonMode = true;
            plateAreaHandle.x = lowerLeft.x;
            plateAreaHandle.y = lowerLeft.y;
            //plateAreaHandle.hitArea = new PIXI.Circle(0, 0, 16);
            plateAreaHandle.addChild(graphicsWrapper);

            this.plateAreaHandle = plateAreaHandle;
            this.displayObject.addChild(plateAreaHandle);
        },

        initPlateSeparationHandle: function() {
            var plateSeparationHandle = new PIXI.Graphics();

            plateSeparationHandle.buttonMode = true;
            plateSeparationHandle.defaultCursor = 'move';

            this.plateSeparationHandle = plateSeparationHandle;

            // var textSettings = {
            //     font: this.labelFontSize + ' ' + this.labelFontFamily,
            //     fill: this.labelColor
            // };

            // var label = new PIXI.Text(this.labelText, textSettings);
            // label.anchor.x = 0.5;
            // label.anchor.y = 0.47;
            // label.x = 0;
            // label.y = 0;
        },

        drawDragHandle: function(graphics, color) {
            var length = 16;
            var headLength = 10;
            var headWidth = 14;
            var tailWidth = 6;

            graphics.beginFill(color, 1);
            graphics.drawRect(0, -tailWidth / 2, length - headLength, tailWidth);
            graphics.drawRect(-length + headLength, -tailWidth / 2, length - headLength, tailWidth);
            graphics.endFill();

            graphics.beginFill(color, 1);
            graphics.moveTo(length, 0);
            graphics.lineTo(length - headLength,  headWidth / 2);
            graphics.lineTo(length - headLength, -headWidth / 2);
            graphics.endFill();

            graphics.beginFill(color, 1);
            graphics.moveTo(-length, 0);
            graphics.lineTo(-length + headLength,  headWidth / 2);
            graphics.lineTo(-length + headLength, -headWidth / 2);
            graphics.endFill();
        },

        getPlateDragCorner: function() {
            var x = this.model.get('position').x;
            var y = this.model.getTopPlateCenter().y;
            var z = this.model.get('position').z;
            var width = this.model.get('plateWidth');
            var depth = this.model.get('plateDepth');
            return this._ur.set(this.mvt.modelToView(
                x - (width / 2), 
                y, 
                z - (depth / 2))
            );
        },

        getOppositePlateDragCorner: function() {
            var x = this.model.get('position').x;
            var y = this.model.getTopPlateCenter().y;
            var z = this.model.get('position').z;
            var width = this.model.get('plateWidth');
            var depth = this.model.get('plateDepth');
            return this._ll.set(this.mvt.modelToView(
                x + (width / 2), 
                y, 
                z + (depth / 2))
            );
        },

        initDielectric: function() {
            
        },

        drawPlates: function() {
            this.bottomPlate.clear();
            this.shapeCreator.drawBottomPlateShape(this.bottomPlate, '#f2f2f2', 1);
            this.shapeCreator.outlineBottomPlateShape(this.bottomPlate, 1, this.outlineColor, 1);

            this.topPlate.clear();
            this.shapeCreator.drawTopPlateShape(this.topPlate, '#f2f2f2', 1);
            this.shapeCreator.outlineTopPlateShape(this.topPlate, 1, this.outlineColor, 1);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawPlates();
        },

        dragPlateAreaStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingPlateArea = true;
        },

        dragPlateArea: function(data) {
            if (this.draggingPlateArea) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);

            }
        },

        dragPlateAreaEnd: function(data) {
            this.draggingPlateArea = false;
        },

        dragPlateSeparationStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingPlateSeparation = true;
        },

        dragPlateSeparation: function(data) {
            if (this.draggingPlateSeparation) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);

            }
        },

        dragPlateSeparationEnd: function(data) {
            this.draggingPlateSeparation = false;
        },

        plateAreaHover: function() {
            this.plateAreaHandleGraphic.visible = false;
            this.plateAreaHandleHoverGraphic.visible = true;
        },

        plateAreaUnhover: function() {
            this.plateAreaHandleGraphic.visible = true;
            this.plateAreaHandleHoverGraphic.visible = false;
        },

        /**
         * Returns the y-value that should be used for sorting.
         */
        getYSortValue: function() {
            return this.mvt.modelToViewY(this.model.getY());
        }

    });

    return CapacitorView;
});