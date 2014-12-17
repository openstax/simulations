define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');
    var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var ThermalElementView = require('views/element/thermal');
    var Block              = require('models/element/block');

    var Constants = require('constants');

    /**
     * A view that represents a block model
     */
    var BlockView = ThermalElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                movable: true
            }, options);

            ThermalElementView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {

            this.energyChunkLayer = new PIXI.DisplayObjectContainer();
            this.outlineBack  = new PIXI.DisplayObjectContainer();
            this.faces        = new PIXI.DisplayObjectContainer();
            this.outlineFront = new PIXI.DisplayObjectContainer();

            this.displayObject.addChild(this.outlineBack);
            this.displayObject.addChild(this.faces);
            this.displayObject.addChild(this.outlineFront);
            
            var rect = this.mvt.modelToViewScale(Block.getRawShape());
            var perspectiveEdgeSize = this.mvt.modelToViewDeltaX(this.model.getRect().w * Constants.PERSPECTIVE_EDGE_PROPORTION);

            var blockFaceOffset  = (new Vector2(-perspectiveEdgeSize / 2, 0)).rotate(-Constants.PERSPECTIVE_ANGLE);
            var backCornerOffset = (new Vector2(perspectiveEdgeSize,      0)).rotate(-Constants.PERSPECTIVE_ANGLE);

            this.initEnergyChunks(this.energyChunkLayer);
            this.initBlock(rect, perspectiveEdgeSize, blockFaceOffset, backCornerOffset);
            this.initLabel(rect, blockFaceOffset);

            // Just for debugging
            //this.renderTopCenterPoint();
            //this.renderBottomCenterPoint();
            this.initDebugSlices();
        },

        initDebugSlices: function() {
            this.debugLayer = new PIXI.DisplayObjectContainer();

            this.debugSlicesGraphics = new PIXI.Graphics();
            this.debugLayer.addChild(this.debugSlicesGraphics);

            this.debugSliceColors = [];
            for (var i = 0; i < this.model.slices.length; i++) {
                this.debugSliceColors[i] = Math.random() * 0xAAAAAA;
            }
        },

        initBlock: function(rect, perspectiveEdgeSize, blockFaceOffset, backCornerOffset) {
            // Front face
            var lowerLeftFrontCorner  = (new Vector2(rect.left(),   rect.bottom())).add(blockFaceOffset);
            var lowerRightFrontCorner = (new Vector2(rect.right(),  rect.bottom())).add(blockFaceOffset);
            var upperRightFrontCorner = (new Vector2(rect.right(), -rect.top()   )).add(blockFaceOffset);
            var upperLeftFrontCorner  = (new Vector2(rect.left(),  -rect.top()   )).add(blockFaceOffset);

            var frontFacePoints = [
                lowerLeftFrontCorner,
                lowerRightFrontCorner,
                upperRightFrontCorner,
                upperLeftFrontCorner,
                lowerLeftFrontCorner
            ];
            this.faces.addChild(this.createFrontFace(frontFacePoints));

            // Top face
            var upperLeftBackCorner  = upperLeftFrontCorner.clone().add(backCornerOffset);
            var upperRightBackCorner = upperRightFrontCorner.clone().add(backCornerOffset);

            var topFacePoints = [
                upperLeftFrontCorner,
                upperRightFrontCorner,
                upperRightBackCorner,
                upperLeftBackCorner,
                upperLeftFrontCorner
            ];
            this.faces.addChild(this.createTopFace(topFacePoints));

            // Side face
            var lowerRightBackCorner = lowerRightFrontCorner.clone().add(backCornerOffset);

            var rightFacePoints = [
                upperRightFrontCorner,
                lowerRightFrontCorner,
                lowerRightBackCorner,
                upperRightBackCorner,
                upperRightFrontCorner
            ];
            this.faces.addChild(this.createRightFace(rightFacePoints));

            // Front outline
            var lineStyle = {
                lineWidth: this.lineWidth,
                strokeStyle: this.lineColor,
                lineJoin: 'bevel'
            };
            var pointArrays = [frontFacePoints, topFacePoints, rightFacePoints];
            this.outlineFront.addChild(PIXI.Sprite.fromPointArrays(pointArrays, lineStyle));

            // Back outline
            var lowerLeftBackCorner = lowerLeftFrontCorner.clone().add(backCornerOffset);

            pointArrays = [[
                lowerLeftBackCorner,
                lowerRightBackCorner
            ],[
                lowerLeftBackCorner,
                lowerLeftFrontCorner
            ],[
                lowerLeftBackCorner,
                upperLeftBackCorner
            ]];
            this.outlineBack.addChild(PIXI.Sprite.fromPointArrays(pointArrays, lineStyle));

            this.outlineBack.visible = false;

            // Calculate the bounding box for the dragging bounds
            var outline = PiecewiseCurve.fromPointArrays(pointArrays);
            this.boundingBox = outline.getBounds().clone();
            this.boundingBox.x -= (this.lineWidth / 2);
            this.boundingBox.y -= (this.lineWidth / 2);
            this.boundingBox.w += this.lineWidth;
            this.boundingBox.h += (this.lineWidth / 2) - blockFaceOffset.y;
        },

        createFrontFace: function(points) {
            return PIXI.createColoredPolygonFromPoints(points, this.fillColor, this.fillAlpha);
        },

        createTopFace: function(points) {
            return PIXI.createColoredPolygonFromPoints(points, this.fillColor, this.fillAlpha);
        },

        createRightFace: function(points) {
            return PIXI.createColoredPolygonFromPoints(points, this.fillColor, this.fillAlpha);
        },

        initLabel: function(rect, blockFaceOffset) {
            // Label
            this.label = new PIXI.Text(this.labelText, {
                font: this.textFont,
                fill: this.textColor
            });
            this.label.anchor.x = this.label.anchor.y = 0.5;
            this.label.x = blockFaceOffset.x;
            this.label.y = -(rect.h / 2) + blockFaceOffset.y;
            this.displayObject.addChild(this.label);
        },

        /**
         * For debugging purposes
         */
        renderTopCenterPoint: function() {
            var top = new PIXI.Graphics();
            top.beginFill(0x0000FF, 1);
            top.drawCircle(0, this.mvt.modelToViewDeltaY(this.model.topSurface.yPos - this.model.get('position').y), 3);
            top.endFill();
            this.displayObject.addChild(top);
        },

        /**
         * For debugging purposes
         */
        renderBottomCenterPoint: function() {
            var origin = new PIXI.Graphics();
            origin.beginFill(0xFF0000, 1);
            origin.drawCircle(0, 0, 3);
            origin.endFill();
            this.displayObject.addChild(origin);
        },

        update: function(time, deltaTime) {
            ThermalElementView.prototype.update.apply(this, [time, deltaTime]);

            // this.debugSlicesGraphics.clear();
            // for (var i = 0; i < this.model.slices.length; i++) {
            //     this.debugSlicesGraphics.lineStyle(2, this.debugSliceColors[i], 0.5);
            //     var rect = this.mvt.modelToView(this.model.slices[i].getShape());
            //     this.debugSlicesGraphics.drawRect(rect.x, rect.y - rect.h, rect.w, rect.h);
            // }
        },

        calculateDragBounds: function(dx, dy) {
            return this._dragBounds
                .set(this.boundingBox)
                .translate(this.displayObject.x + dx, this.displayObject.y + dy);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.displayObject.x = viewPoint.x;
            this.displayObject.y = viewPoint.y;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
            this.outlineBack.visible = true;
            this.faces.alpha = 0.62;
            this.label.alpha = 0.62;
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
            this.outlineBack.visible = false;
            this.faces.alpha = 1;
            this.label.alpha = 1;
        },

    });

    return BlockView;
});