define(function(require) {

    'use strict';

    //var _       = require('underscore');
    var PIXI    = require('pixi');
    var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var ElementView = require('views/element');
    var Beaker      = require('models/element/beaker');
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
                textFont:  BeakerView.TEXT_FONT
            }, options);

            ElementView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {

            this.backLayer  = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();
            this.grabLayer  = new PIXI.DisplayObjectContainer();
            
            // Get a version of the rectangle that defines the beaker size and
            //   location in the view.
            var beakerViewRect = this.mvt.modelToViewScale(this.model.getRawOutlineRect());
            
            // Create the shapes for the top and bottom of the beaker.  These are
            //   ellipses in order to create a 3D-ish look.
            var ellipseHeight = beakerViewRect.w * BeakerView.PERSPECTIVE_PROPORTION;
            var backCurves  = new PiecewiseCurve();
            var frontCurves = new PiecewiseCurve();
            var top    = beakerViewRect.bottom() - beakerViewRect.h;
            var bottom = beakerViewRect.bottom();
            var left   = beakerViewRect.left();
            var right  = beakerViewRect.right();

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

            // Outline style
            var lineStyle = {
                lineWidth:   this.lineWidth,
                strokeStyle: this.lineColor,
                lineJoin:    this.lineJoin
            };

            this.backLayer.addChild(this.createOutlineFromCurve(backCurves, lineStyle));
            this.frontLayer.addChild(this.createOutlineFromCurve(frontCurves, lineStyle));

            // Label
            this.label = new PIXI.Text(this.labelText, {
                font: this.textFont,
                fill: this.textColor
            });
            this.label.anchor.x = this.label.anchor.y = 0.5;
            this.label.x = 0;
            this.label.y = -(beakerViewRect.h / 2);
            this.displayObject.addChild(this.label);

            // Calculate the bounding box for the dragging bounds
            this.boundingBox = beakerViewRect.clone();
        },

        showEnergyChunks: function() {
            
        },

        hideEnergyChunks: function() {
            
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = this.grabLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = this.grabLayer.y = viewPoint.y;
        },

    }, Constants.BeakerView);

    return BeakerView;
});