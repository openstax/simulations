define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var Colors  = require('common/colors/colors');
    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var CapacitorView             = require('views/capacitor');
    var DielectricTotalChargeView = require('views/dielectric-total-charge');

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

            'touchstart      .dielectricHandle': 'dragDielectricStart',
            'mousedown       .dielectricHandle': 'dragDielectricStart',
            'touchmove       .dielectricHandle': 'dragDielectric',
            'mousemove       .dielectricHandle': 'dragDielectric',
            'touchend        .dielectricHandle': 'dragDielectricEnd',
            'mouseup         .dielectricHandle': 'dragDielectricEnd',
            'touchendoutside .dielectricHandle': 'dragDielectricEnd',
            'mouseupoutside  .dielectricHandle': 'dragDielectricEnd',

            'mouseover .plateAreaHandle'       : 'plateAreaHover',
            'mouseout  .plateAreaHandle'       : 'plateAreaUnhover',
            'mouseover .plateSeparationHandle' : 'plateSeparationHover',
            'mouseout  .plateSeparationHandle' : 'plateSeparationUnhover',
            'mouseover .dielectricHandle'      : 'dielectricHover',
            'mouseout  .dielectricHandle'      : 'dielectricUnhover'
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

            this.maxDielectricEField = options.maxDielectricEField;

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
            this._vec3 = new Vector3();

            CapacitorView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:plateDepth', this.update);
            this.listenTo(this.model, 'change:dielectricMaterial', this.update);
            this.listenTo(this.model, 'change:dielectricOffset', this.update);
        },

        initGraphics: function() {
            CapacitorView.prototype.initGraphics.apply(this, arguments);

            this.initPlateAreaHandle();
            this.initPlateSeparationHandle();
            this.initDielectric();
            this.initDielectricHandle();
            this.initDielectricTotalChargeView();
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

        initDielectricHandle: function() {
            this.dielectricHandleGraphic = new PIXI.Graphics();
            this.dielectricHandleHoverGraphic = new PIXI.Graphics();

            this.drawDragHandle(this.dielectricHandleGraphic,      this.handleColor);
            this.drawDragHandle(this.dielectricHandleHoverGraphic, this.handleHoverColor);

            this.dielectricHandleGraphic.hitArea      = new PIXI.Circle(0, 0, 17);
            this.dielectricHandleHoverGraphic.hitArea = new PIXI.Circle(0, 0, 17);

            this.dielectricHandleGraphic.x = this.dielectricHandleHoverGraphic.x = 58;

            var dots = new PIXI.Graphics();
            dots.beginFill(0x000000, 1);
            for (var x = 0; x <= 40; x += 4)
                dots.drawCircle(x, 0, 1);
            dots.endFill();

            var graphicsWrapper = new PIXI.DisplayObjectContainer();
            graphicsWrapper.addChild(this.dielectricHandleGraphic);
            graphicsWrapper.addChild(this.dielectricHandleHoverGraphic);
            graphicsWrapper.addChild(dots);
            
            this.dielectricLabelTitle = new PIXI.Text('Offset', this.labelTitleStyle);
            this.dielectricLabelValue = new PIXI.Text('5.0 mm', this.labelValueStyle);
            this.dielectricLabelValue.y = 18;
            var textWrapper = new PIXI.DisplayObjectContainer();
            textWrapper.addChild(this.dielectricLabelTitle);
            textWrapper.addChild(this.dielectricLabelValue);
            textWrapper.x = 50;
            textWrapper.y = 10;

            var dielectricHandle = new PIXI.Graphics();
            dielectricHandle.buttonMode = true;
            dielectricHandle.addChild(graphicsWrapper);
            dielectricHandle.addChild(textWrapper);

            this.dielectricHandle = dielectricHandle;
            this.middleLayer.addChild(dielectricHandle);
        },

        updateHandlePositions: function() {
            // Plate area handle
            var lowerLeft  = this.getPlateDragCorner();
            this.plateAreaHandle.x = Math.round(lowerLeft.x);
            this.plateAreaHandle.y = Math.round(lowerLeft.y);

            // Plate separation handle
            var modelPoint = this.model.getTopPlateCenter();
            modelPoint.x -= this.model.get('plateWidth') / 4;
            var viewPoint = this.mvt.modelToView(modelPoint);
            this.plateSeparationHandle.x = Math.round(viewPoint.x);
            this.plateSeparationHandle.y = Math.round(viewPoint.y);

            // Dielectric offset handle
            modelPoint = this._vec3.set(this.model.get('position'));
            modelPoint.x += this.model.get('dielectricOffset') + (this.model.getDielectricWidth() / 2);
            viewPoint = this.mvt.modelToView(modelPoint);
            this.dielectricHandle.x = Math.round(viewPoint.x);
            this.dielectricHandle.y = Math.round(viewPoint.y);
        },

        updateHandleLabels: function() {
            var separationInMM = this.model.get('plateSeparation') * 1000;
            var areaInMM = this.model.getPlateArea() * (1000 * 1000); // It's a squared measurement.
            var offsetInMM = this.model.get('dielectricOffset') * 1000;

            this.plateSeparationLabelValue.setText(separationInMM.toFixed(1) + ' mm');
            this.plateAreaLabelValue.setText(areaInMM.toFixed(1) + ' mm²');
            this.dielectricLabelValue.setText(offsetInMM.toFixed(1) + ' mm');
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
            this.dielectric = new PIXI.Graphics();
            this.middleLayer.addChild(this.dielectric);
        },

        drawDielectric: function() {
            var outlineColor = Colors.darkenHex(this.model.get('dielectricMaterial').get('color'), 0.4);

            this.dielectric.clear();
            this.shapeCreator.outlineDielectricBack(this.dielectric, 1, outlineColor, 1);
            this.shapeCreator.drawDielectric(
                this.dielectric, 
                this.model.get('dielectricMaterial').get('color'), 
                this.model.get('dielectricMaterial').get('alpha')
            );
            this.shapeCreator.outlineDielectric(this.dielectric, 1, outlineColor, 1);
        },

        initDielectricTotalChargeView: function() {
            this.dielectricTotalChargeView = new DielectricTotalChargeView({
                model: this.model,
                mvt: this.mvt,
                maxDielectricEField: this.maxDielectricEField
            });
            this.middleLayer.addChild(this.dielectricTotalChargeView.displayObject);
        },

        dragPlateAreaStart: function(data) {
            this.lastDragX = data.global.x;
            this.draggingPlateArea = true;
        },

        dragPlateArea: function(data) {
            if (this.draggingPlateArea) {
                var dx = data.global.x - this.lastDragX;

                var mdx = this.mvt.viewToModelDeltaX(dx);

                var newWidth = this.model.get('plateWidth') - mdx;

                if (newWidth < Constants.PLATE_WIDTH_RANGE.min)
                    newWidth = Constants.PLATE_WIDTH_RANGE.min;
                if (newWidth > Constants.PLATE_WIDTH_RANGE.max)
                    newWidth = Constants.PLATE_WIDTH_RANGE.max;
                
                this.model.set('plateWidth', newWidth);

                this.lastDragX = data.global.x;
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

        dragDielectricStart: function(data) {
            this.lastDragX = data.global.x;
            this.draggingDielectric = true;
        },

        dragDielectric: function(data) {
            if (this.draggingDielectric) {
                var dx = data.global.x - this.lastDragX;

                var mdx = this.mvt.viewToModelDeltaX(dx);

                var newOffset = this.model.get('dielectricOffset') + mdx;

                if (newOffset < Constants.DIELECTRIC_OFFSET_RANGE.min)
                    newOffset = Constants.DIELECTRIC_OFFSET_RANGE.min;
                if (newOffset > Constants.DIELECTRIC_OFFSET_RANGE.max)
                    newOffset = Constants.DIELECTRIC_OFFSET_RANGE.max;
                
                this.model.set('dielectricOffset', newOffset);

                this.lastDragX = data.global.x;
            }
        },

        dragDielectricEnd: function(data) {
            this.draggingDielectric = false;
            if (!this.dielectricHandleHovering)
                this.dielectricUnhover();
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

        dielectricHover: function() {
            this.dielectricHandleHovering = true;

            this.dielectricHandleGraphic.visible = false;
            this.dielectricHandleHoverGraphic.visible = true;

            this.dielectricLabelTitle.setStyle(this.labelTitleHoverStyle);
            this.dielectricLabelValue.setStyle(this.labelValueHoverStyle);
        },

        dielectricUnhover: function() {
            this.dielectricHandleHovering = false;

            if (!this.draggingDielectric) {
                this.dielectricHandleGraphic.visible = true;
                this.dielectricHandleHoverGraphic.visible = false;

                this.dielectricLabelTitle.setStyle(this.labelTitleStyle);
                this.dielectricLabelValue.setStyle(this.labelValueStyle);
            }
        },

        update: function() {
            CapacitorView.prototype.update.apply(this, arguments);

            this.updateHandlePositions();
            this.updateHandleLabels();
            this.drawDielectric();
        }

    });

    return DielectricCapacitorView;
});