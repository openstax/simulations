define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');
    var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var IntroElementView = require('views/intro-element');
    //var Assets      = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a block model
     */
    var BurnerStandView = IntroElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                lineWidth: BurnerStandView.LINE_WIDTH,
                lineColor: BurnerStandView.LINE_COLOR,
                lineJoin:  BurnerStandView.LINE_JOIN,
                rectangle: null,
                projectedEdgeLength: null
            }, options);

            if (options.rectangle === undefined)
                throw 'BurnerStandView constructor requires a rectangle.';
            if (options.projectedEdgeLength === undefined)
                throw 'BurnerStandView constructor requires a projectedEdgeLength.';
            
            this.rectangle = options.rectangle;
            this.projectedEdgeLength = options.projectedEdgeLength;

            IntroElementView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            var rect = this.rectangle;

            var leftCurve  = this.createSideCurve(new Vector2(rect.x,       rect.y), rect.h, this.projectedEdgeLength);
            var rightCurve = this.createSideCurve(new Vector2(rect.right(), rect.y), rect.h, this.projectedEdgeLength);
            var topCurve   = this.createTopCurve( new Vector2(rect.x,       rect.y), rect.w, this.projectedEdgeLength);

            // Outline style
            var lineStyle = {
                lineWidth:   this.lineWidth,
                strokeStyle: this.lineColor,
                lineJoin:    this.lineJoin
            };

            var leftSprite  = PIXI.Sprite.fromPiecewiseCurve(leftCurve, lineStyle);
            var rightSprite = PIXI.Sprite.fromPiecewiseCurve(rightCurve, lineStyle);
            var topSprite   = PIXI.Sprite.fromPiecewiseCurve(topCurve, lineStyle);

            leftSprite.y = rightSprite.y = topSprite.y = -rect.h;

            this.displayObject.addChild(leftSprite);
            this.displayObject.addChild(rightSprite);
            this.displayObject.addChild(topSprite);
        },

        createSideCurve: function(leftCenter, height, edgeLength) {
            // Draw the side as a parallelogram.
            var upperLeftCorner = leftCenter.clone().add((new Vector2(-edgeLength / 2, 0)).rotate(-BurnerStandView.PERSPECTIVE_ANGLE));
            var lowerLeftCorner = upperLeftCorner.clone().add(0, height);
            var lowerRightCorner = lowerLeftCorner.clone().add((new Vector2(edgeLength, 0)).rotate(-BurnerStandView.PERSPECTIVE_ANGLE));
            var upperRightCorner = lowerRightCorner.clone().add(0, -height);

            var curve = new PiecewiseCurve()
                .moveTo(upperLeftCorner)
                .lineTo(lowerLeftCorner)
                .lineTo(lowerRightCorner)
                .lineTo(upperRightCorner)
                .close();

            return curve;
        },

        createTopCurve: function(topCenter, width, edgeLength) {
            // Create the points for the outline of the perspective rectangle.
            var upperLeftCorner  = topCenter.clone().add(new Vector2(edgeLength / 2, 0).rotate(-BurnerStandView.PERSPECTIVE_ANGLE));
            var upperRightCorner = upperLeftCorner.clone().add(width, 0);
            var lowerRightCorner = upperRightCorner.clone().add(new Vector2(-edgeLength, 0).rotate(-BurnerStandView.PERSPECTIVE_ANGLE));
            var lowerLeftCorner  = lowerRightCorner.clone().add(-width, 0);

            // Create the points for the circular opening in the top.
            var upperLeftCircularOpeningCorner  = upperLeftCorner.clone().add(width * 0.25, 0);
            var upperRightCircularOpeningCorner = upperLeftCorner.clone().add(width * 0.75, 0);
            var lowerLeftCircularOpeningCorner  = lowerLeftCorner.clone().add(width * 0.25, 0);
            var lowerRightCircularOpeningCorner = lowerLeftCorner.clone().add(width * 0.75, 0);

            // Create the control points for the circular opening in the top.
            var circularOpeningPerspectiveVector = new Vector2(edgeLength * 0.5, 0).rotate(-BurnerStandView.PERSPECTIVE_ANGLE);

            var curve = new PiecewiseCurve()
                .moveTo(upperLeftCorner)
                .lineTo(upperLeftCircularOpeningCorner)
                .curveTo( 
                    upperLeftCircularOpeningCorner.clone().add(circularOpeningPerspectiveVector),
                    upperRightCircularOpeningCorner.clone().add(circularOpeningPerspectiveVector),
                    upperRightCircularOpeningCorner 
                )
                .lineTo(upperRightCorner)
                .lineTo(lowerRightCorner)
                .lineTo(lowerRightCircularOpeningCorner)
                .curveTo( 
                    lowerRightCircularOpeningCorner.clone().sub(circularOpeningPerspectiveVector),
                    lowerLeftCircularOpeningCorner.clone().sub(circularOpeningPerspectiveVector),
                    lowerLeftCircularOpeningCorner 
                )
                .lineTo(lowerLeftCorner)
                .close();

            return curve;
        },

        showEnergyChunks: function() {
            
        },

        hideEnergyChunks: function() {
            
        }

    }, Constants.BurnerStandView);

    return BurnerStandView;
});