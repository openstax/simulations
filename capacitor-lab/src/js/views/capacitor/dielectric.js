define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var CapacitorView = require('views/capacitor');

    var Constants = require('constants');

    /**
     * 
     */
    var DielectricCapacitorView = CapacitorView.extend({

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

            'mouseover .plateAreaHandle'       : 'plateAreaHover',
            'mouseout  .plateAreaHandle'       : 'plateAreaUnhover',
            'mouseover .plateSeparationHandle' : 'plateSeparationHover',
            'mouseout  .plateSeparationHandle' : 'plateSeparationUnhover',
        },

        initialize: function(options) {
            options = _.extend({
                handleColor: '#5c35a3',
                handleHoverColor: '#955cff',

                labelFontFamily: 'Helvetica Neue',
                labelFontSize: '14px',
                labelColor: '#000',
                labelAlpha: 1
            }, options);

            // Handle colors
            this.handleColor = Colors.parseHex(options.handleColor);
            this.handleHoverColor = Colors.parseHex(options.handleHoverColor);

            // Label text
            this.labelAlpha = options.labelAlpha;
            this.labelTitleStyle = {
                font: 'bold ' + options.labelFontSize + ' ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelTitleHoverStyle = _.clone(this.labelTitleStyle);
            this.labelTitleHoverStyle.fill = options.handleHoverColor;

            this.labelValueStyle = {
                font: options.labelFontSize + ' ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelValueHoverStyle = _.clone(this.labelValueStyle);
            this.labelValueHoverStyle.fill = options.handleHoverColor;

            // Cached objects
            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._ll = new Vector2();
            this._ur = new Vector2();

            CapacitorView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:plateDepth', this.update);
        },

        initGraphics: function() {
            CapacitorView.prototype.initGraphics.apply(this, arguments);

            this.initPlateAreaHandle();
            this.initPlateSeparationHandle();
            this.initDielectric();
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

            this.plateAreaHandleGraphic.hitArea      = new PIXI.Circle(0, 0, 17);
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
            
            this.plateAreaLabelTitle = new PIXI.Text('Plate Area', this.labelTitleStyle);
            this.plateAreaLabelValue = new PIXI.Text('100.0 mm²', this.labelValueStyle);
            this.plateAreaLabelValue.y = 18;
            var textWrapper = new PIXI.DisplayObjectContainer();
            textWrapper.addChild(this.plateAreaLabelTitle);
            textWrapper.addChild(this.plateAreaLabelValue);
            textWrapper.x = -76;
            textWrapper.y = -38;

            var plateAreaHandle = new PIXI.DisplayObjectContainer();
            plateAreaHandle.buttonMode = true;
            plateAreaHandle.addChild(graphicsWrapper);
            plateAreaHandle.addChild(textWrapper);

            this.plateAreaHandle = plateAreaHandle;
            this.topLayer.addChild(plateAreaHandle);
        },

        initPlateSeparationHandle: function() {
            this.plateSeparationHandleGraphic = new PIXI.Graphics();
            this.plateSeparationHandleHoverGraphic = new PIXI.Graphics();

            this.drawDragHandle(this.plateSeparationHandleGraphic,      this.handleColor);
            this.drawDragHandle(this.plateSeparationHandleHoverGraphic, this.handleHoverColor);

            this.plateSeparationHandleGraphic.hitArea      = new PIXI.Circle(0, 0, 17);
            this.plateSeparationHandleHoverGraphic.hitArea = new PIXI.Circle(0, 0, 17);

            this.plateSeparationHandleGraphic.x = this.plateSeparationHandleHoverGraphic.x = -58;

            var dots = new PIXI.Graphics();
            dots.beginFill(0x000000, 1);
            for (var x = -40; x <= 0; x += 4)
                dots.drawCircle(x, 0, 1);
            dots.endFill();

            var graphicsWrapper = new PIXI.DisplayObjectContainer();
            graphicsWrapper.rotation = Math.PI / 2;
            graphicsWrapper.addChild(this.plateSeparationHandleGraphic);
            graphicsWrapper.addChild(this.plateSeparationHandleHoverGraphic);
            graphicsWrapper.addChild(dots);
            
            this.plateSeparationLabelTitle = new PIXI.Text('Separation', this.labelTitleStyle);
            this.plateSeparationLabelValue = new PIXI.Text('5.0 mm', this.labelValueStyle);
            this.plateSeparationLabelValue.y = 18;
            var textWrapper = new PIXI.DisplayObjectContainer();
            textWrapper.addChild(this.plateSeparationLabelTitle);
            textWrapper.addChild(this.plateSeparationLabelValue);
            textWrapper.x = -66;
            textWrapper.y = -100;

            var plateSeparationHandle = new PIXI.Graphics();
            plateSeparationHandle.buttonMode = true;
            plateSeparationHandle.addChild(graphicsWrapper);
            plateSeparationHandle.addChild(textWrapper);

            this.plateSeparationHandle = plateSeparationHandle;
            this.topLayer.addChild(plateSeparationHandle);
        },

        updateHandlePositions: function() {
            var lowerLeft  = this.getPlateDragCorner();
            this.plateAreaHandle.x = Math.round(lowerLeft.x);
            this.plateAreaHandle.y = Math.round(lowerLeft.y);

            var modelSHandleLoc = this.model.getTopPlateCenter();
            modelSHandleLoc.x -= this.model.get('plateWidth') / 4;
            var sHandleLoc = this.mvt.modelToView(modelSHandleLoc);
            this.plateSeparationHandle.x = Math.round(sHandleLoc.x);
            this.plateSeparationHandle.y = Math.round(sHandleLoc.y);
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

        updateMVT: function(mvt) {
            CapacitorView.prototype.updateMVT.apply(this, arguments);

            this.updateHandlePositions();
        },

        dragPlateAreaStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.draggingPlateArea = true;
        },

        dragPlateArea: function(data) {
            if (this.draggingPlateArea) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;

                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                
            }
        },

        dragPlateAreaEnd: function(data) {
            this.draggingPlateArea = false;
            if (!this.plateAreaHandleHovering)
                this.plateAreaUnhover();
        },

        dragPlateSeparationStart: function(data) {
            this.lastDragY = data.global.y;
            this.draggingPlateSeparation = true;
        },

        dragPlateSeparation: function(data) {
            if (this.draggingPlateSeparation) {
                var dy = data.global.y - this.lastDragY;

                var mdy = this.mvt.viewToModelDeltaY(dy);

                var newSeparation = this.model.get('plateSeparation') - (mdy * 2);

                if (newSeparation < Constants.PLATE_SEPARATION_RANGE.min)
                    newSeparation = Constants.PLATE_SEPARATION_RANGE.min;
                if (newSeparation > Constants.PLATE_SEPARATION_RANGE.max)
                    newSeparation = Constants.PLATE_SEPARATION_RANGE.max;
                
                this.model.set('plateSeparation', newSeparation);

                this.lastDragY = data.global.y;
            }
        },

        dragPlateSeparationEnd: function(data) {
            this.draggingPlateSeparation = false;
            if (!this.plateSeparationHandleHovering)
                this.plateSeparationUnhover();
        },

        plateAreaHover: function() {
            this.plateAreaHandleHovering = true;

            this.plateAreaHandleGraphic.visible = false;
            this.plateAreaHandleHoverGraphic.visible = true;

            this.plateAreaLabelTitle.setStyle(this.labelTitleHoverStyle);
            this.plateAreaLabelValue.setStyle(this.labelValueHoverStyle);
        },

        plateAreaUnhover: function() {
            this.plateAreaHandleHovering = false;

            if (!this.draggingPlateArea) {
                this.plateAreaHandleGraphic.visible = true;
                this.plateAreaHandleHoverGraphic.visible = false;

                this.plateAreaLabelTitle.setStyle(this.labelTitleStyle);
                this.plateAreaLabelValue.setStyle(this.labelValueStyle);
            }
        },

        plateSeparationHover: function() {
            this.plateSeparationHandleHovering = true;

            this.plateSeparationHandleGraphic.visible = false;
            this.plateSeparationHandleHoverGraphic.visible = true;

            this.plateSeparationLabelTitle.setStyle(this.labelTitleHoverStyle);
            this.plateSeparationLabelValue.setStyle(this.labelValueHoverStyle);
        },

        plateSeparationUnhover: function() {
            this.plateSeparationHandleHovering = false;

            if (!this.draggingPlateSeparation) {
                this.plateSeparationHandleGraphic.visible = true;
                this.plateSeparationHandleHoverGraphic.visible = false;

                this.plateSeparationLabelTitle.setStyle(this.labelTitleStyle);
                this.plateSeparationLabelValue.setStyle(this.labelValueStyle);
            }
        },

        update: function() {
            this.drawPlates();
            this.updateHandlePositions();
        }

    });

    return DielectricCapacitorView;
});