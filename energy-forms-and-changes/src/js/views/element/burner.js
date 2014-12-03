define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');
    //var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var ElementView = require('views/element');
    //var Assets      = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a block model
     */
    var BurnerView = ElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                width:  10,
                height: 10,
                openingHeight: 2,
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.openingHeight = options.openingHeight;

            ElementView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            // Layers
            this.backLayer        = new PIXI.DisplayObjectContainer();
            this.frontLayer       = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();

            this.backLayer.addChild(this.energyChunkLayer);

            this.energyChunkLayer.visible = false;

            // Graphical components
            this.initBucket();

        },

        initBucket: function() {
            var width = this.width;
            var height = this.height;
            var openingHeight = this.openingHeight;
            var bottomWidth = width * 0.8;

            // Bucket inside (just an ellipse)
            var bucketInsideCurve = new PiecewiseCurve();
            bucketInsideCurve
                .moveTo(0, 0)
                .curveTo(
                    0,     -openingHeight / 2,
                    width, -openingHeight / 2,
                    width, 0
                )
                .curveTo(
                    width, openingHeight / 2,
                    0,     openingHeight / 2,
                    0,     0
                )
                .close();

            var bucketInsideStyle = {
                lineWidth: 0,
                fillStyle: function(ctx, width, height) {
                    var gradient = ctx.createLinearGradient(0, 0, width, height);
                    gradient.addColorStop(0, '#cdd7e2');
                    gradient.addColorStop(1, '#535e6a');
                    ctx.fillStyle = gradient;
                }
            };

            // Bucket outside
            var bucketOutsideCurve = new PiecewiseCurve();
            bucketOutsideCurve
                .moveTo(0, 0)                              // Start in upper left corner
                .curveTo(                                  // Curve to upper right corner
                    0,     openingHeight / 2,
                    width, openingHeight / 2,
                    width, 0
                )
                .lineTo((width + bottomWidth) / 2, height) // Line down to lower right corner
                .curveTo(                                  // Curve over to lower left corner
                    (width + bottomWidth) / 2, height + openingHeight / 2,
                    (width - bottomWidth) / 2, height + openingHeight / 2,
                    (width - bottomWidth) / 2, height
                )
                .lineTo(0, 0)                              // Line back up to upper left corner
                .close();

            var bucketOutsideStyle = {
                lineWidth: 0,
                fillStyle: function(ctx, width, height) {
                    var gradient = ctx.createLinearGradient(0, 0, width, height);
                    gradient.addColorStop(0, '#7a8b9b');
                    gradient.addColorStop(1, '#ced9e5');
                    ctx.fillStyle = gradient;
                }
            };

            var bucketInside = this.createShapeFromCurve(bucketInsideCurve, bucketInsideStyle);
            bucketInside.x = -width / 2;
            bucketInside.y = -height;
            this.backLayer.addChild(bucketInside);

            var bucketOutside = this.createShapeFromCurve(bucketOutsideCurve, bucketOutsideStyle);
            bucketOutside.x = -width / 2;
            bucketOutside.y = -height;
            this.frontLayer.addChild(bucketOutside);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
        }

    }, Constants.BurnerView);

    return BurnerView;
});