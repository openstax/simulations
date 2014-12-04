define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');
    //var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Colors = require('common/colors/colors');

    var ElementView = require('views/element');
    //var Beaker      = require('models/element/beaker');
    //var Assets      = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a block model
     */
    var BeakerView = ElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                fillColor: BeakerView.FILL_COLOR,
                fillAlpha: BeakerView.FILL_ALPHA,
                lineWidth: BeakerView.LINE_WIDTH,
                lineColor: BeakerView.LINE_COLOR,
                lineJoin:  'round',
                textFont:  BeakerView.TEXT_FONT,

                fluidFillColor: BeakerView.WATER_FILL_COLOR,
                fluidFillAlpha: BeakerView.WATER_FILL_ALPHA,
                fluidLineColor: BeakerView.WATER_LINE_COLOR,
                fluidLineWidth: BeakerView.WATER_LINE_WIDTH
            }, options);

            this.fluidFillColor = options.fluidFillColor;
            this.fluidFillAlpha = options.fluidFillAlpha;
            this.fluidLineColor = options.fluidLineColor;
            this.fluidLineWidth = options.fluidLineWidth;

            this.fluidFillColorHex = Colors.parseHex(this.fluidFillColor);
            this.fluidLineColorHex = Colors.parseHex(this.fluidLineColor);

            ElementView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:fluidLevel', this.updateFluidLevel);
            this.updateFluidLevel(this.model, this.model.get('fluidLevel'));
        },

        initGraphics: function() {

            this.backLayer  = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();
            this.grabLayer  = new PIXI.DisplayObjectContainer();
            
            // Get a version of the rectangle that defines the beaker size and
            //   location in the view.
            this.beakerViewRect = this.mvt.modelToViewScale(this.model.getRawOutlineRect()).clone();
            this.ellipseHeight = this.beakerViewRect.w * BeakerView.PERSPECTIVE_PROPORTION;
            
            this.initBeaker();
            this.initFluid();
            this.initLabel();
            
            // Calculate the bounding box for the dragging bounds
            this.boundingBox = this.beakerViewRect.clone();
        },

        initBeaker: function() {
            // Create the shapes for the top and bottom of the beaker.  These are
            //   ellipses in order to create a 3D-ish look.
            var backCurves  = new PiecewiseCurve();
            var frontCurves = new PiecewiseCurve();
            var backFill  = new PiecewiseCurve();
            var frontFill = new PiecewiseCurve();

            var top    = this.beakerViewRect.bottom() - this.beakerViewRect.h;
            var bottom = this.beakerViewRect.bottom();
            var left   = this.beakerViewRect.left();
            var right  = this.beakerViewRect.right();
            var ellipseHeight = this.ellipseHeight;

            // Front fill
            frontFill
                .moveTo(left, bottom)
                .curveTo(
                    left,  bottom + ellipseHeight / 2,
                    right, bottom + ellipseHeight / 2,
                    right, bottom
                )
                .lineTo(right, top)
                .curveTo(
                    right, top + ellipseHeight / 2,
                    left,  top + ellipseHeight / 2,
                    left,  top
                )
                .lineTo(left, bottom)
                .close();
            // Back fill (the top little ellipse area)
            backFill
                .moveTo(left, top)
                .curveTo(
                    left,  top - ellipseHeight / 2,
                    right, top - ellipseHeight / 2,
                    right, top
                )
                .moveTo(left, top)
                .curveTo(
                    left,  top + ellipseHeight / 2,
                    right, top + ellipseHeight / 2,
                    right, top
                );

            var fillStyle = {
                lineWidth: 0,
                fillStyle: this.fillColor,
                fillAlpha: this.fillAlpha
            };

            this.frontLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(frontFill, fillStyle));
            this.backLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(backFill, fillStyle));

            // Top back curve
            backCurves
                .moveTo(left, top)
                .curveTo(
                    left,  top - ellipseHeight / 2,
                    right, top - ellipseHeight / 2,
                    right, top
                );
            // Top front curve
            frontCurves
                .moveTo(left, top)
                .curveTo(
                    left,  top + ellipseHeight / 2,
                    right, top + ellipseHeight / 2,
                    right, top
                );
            // Bottom back curve
            backCurves
                .moveTo(left, bottom)
                .curveTo(
                    left,  bottom - ellipseHeight / 2,
                    right, bottom - ellipseHeight / 2,
                    right, bottom
                );
            // Bottom front curve
            frontCurves
                .moveTo(left, bottom)
                .curveTo(
                    left,  bottom + ellipseHeight / 2,
                    right, bottom + ellipseHeight / 2,
                    right, bottom
                );
            // Vertical edges
            frontCurves
                .moveTo(left, bottom)
                .lineTo(left, top)
                .moveTo(right, bottom)
                .lineTo(right, top);


            // Outline style
            var lineStyle = {
                lineWidth:   this.lineWidth,
                strokeStyle: this.lineColor,
                lineJoin:    this.lineJoin
            };

            this.backLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(backCurves, lineStyle));
            this.frontLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(frontCurves, lineStyle));
        },

        initFluid: function() {

            var left  = this.beakerViewRect.left();
            var right = this.beakerViewRect.right();
            var ellipseHeight = this.ellipseHeight;

            var fluidTopCurve = new PiecewiseCurve();
            fluidTopCurve
                .moveTo(left, 0)
                .curveTo(
                    left,  -ellipseHeight / 2,
                    right, -ellipseHeight / 2,
                    right, 0
                )
                .curveTo(
                    right, ellipseHeight / 2,
                    left,  ellipseHeight / 2,
                    left,  0
                );

            var fluidStyle = {
                fillStyle:   this.fluidFillColor,
                fillAlpha:   this.fluidFillAlpha,
                strokeStyle: this.fluidLineColor,
                lineWidth:   this.fluidLineWidth
            };

            this.fluidTop = PIXI.Sprite.fromPiecewiseCurve(fluidTopCurve, fluidStyle);
            this.fluidFront = new PIXI.Graphics();

            this.frontLayer.addChildAt(this.fluidTop, 0);
            this.frontLayer.addChildAt(this.fluidFront, 0);
        },

        initLabel: function() {
            // Label
            this.label = new PIXI.Text(this.labelText, {
                font: this.textFont,
                fill: this.textColor
            });
            this.label.anchor.x = this.label.anchor.y = 0.5;
            this.label.x = 0;
            this.label.y = -(this.beakerViewRect.h / 2);
            this.frontLayer.addChild(this.label);
        },

        showEnergyChunks: function() {
            this.fluidTop.alpha = this.fluidFront.alpha = 0.8;
        },

        hideEnergyChunks: function() {
            this.fluidTop.alpha = this.fluidFront.alpha = 1;
        },

        updateFluidLevel: function(model, fluidLevel) {
            var top    = (this.beakerViewRect.bottom() - this.beakerViewRect.h) * fluidLevel;
            var bottom = this.beakerViewRect.bottom();
            var left   = this.beakerViewRect.left();
            var right  = this.beakerViewRect.right();
            var ellipseHeight = this.ellipseHeight;

            this.fluidTop.y = top;

            this.fluidFront
                .clear()
                .beginFill(this.fluidFillColorHex, this.fluidFillAlpha)
                .lineStyle(this.fluidLineWidth, this.fluidLineColorHex, 1)
                .moveTo(left, top)
                .bezierCurveTo(
                    left,  top + ellipseHeight / 2,
                    right, top + ellipseHeight / 2,
                    right, top
                )
                .lineTo(right, bottom)
                .bezierCurveTo(
                    right, bottom + ellipseHeight / 2,
                    left,  bottom + ellipseHeight / 2,
                    left,  bottom
                )
                .lineTo(left, top)
                .endFill();
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = this.grabLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = this.grabLayer.y = viewPoint.y;
        },

    }, Constants.BeakerView);

    return BeakerView;
});