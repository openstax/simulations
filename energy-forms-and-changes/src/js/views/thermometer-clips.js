define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    var Vector2 = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var PixiView = require('common/pixi/view');
    var Assets   = require('assets');

    /**
     * A view that represents the air model
     */
    var ThermometerClipsView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = options || {};

            this.x = options.x || 0;
            this.y = options.y || 0;
            this.width  = options.width || 20;
            this.height = options.height || 20;
            this.numThermometerSpots = options.numThermometerSpots || 3;

            this.anchors = [];

            this.rect = new Rectangle(this.x, this.y, this.width, this.height * 0.6);

            this.initGraphics();
        },

        initGraphics: function() {
            this.displayObject.x = this.x;
            this.displayObject.y = this.y;
            
            var base = Assets.createSprite(Assets.Images.THERMOMETER_CLIP_BASE);
            this.backLayer        = new PIXI.DisplayObjectContainer();
            this.thermometerLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer       = new PIXI.DisplayObjectContainer();
            
            this.displayObject.addChild(base);
            this.displayObject.addChild(this.backLayer);
            this.displayObject.addChild(this.thermometerLayer);
            this.displayObject.addChild(this.frontLayer);
            
            var spacing = this.width / (this.numThermometerSpots + 1);
            var point;
            var backClip;
            var frontClip;

            base.x = 9;
            base.y = -6;

            for (var i = 0; i < this.numThermometerSpots; i++) {
                point = new PIXI.Point(this.x + spacing / 2 + i * spacing, this.y + this.height / 2);

                backClip  = Assets.createSprite(Assets.Images.THERMOMETER_CLIP_BACK);
                frontClip = Assets.createSprite(Assets.Images.THERMOMETER_CLIP_FRONT);

                backClip.position  = point;
                frontClip.position = point;

                backClip.anchor.x = frontClip.anchor.x = 0.40;
                backClip.anchor.y = frontClip.anchor.y = 0.60;

                this.backLayer.addChild(backClip);
                this.frontLayer.addChild(frontClip);

                this.anchors.push({
                    point: point,
                    view: null
                });

                // var origin = new PIXI.Graphics();
                // origin.beginFill(0x0000FF, 1);
                // origin.drawCircle(point.x, point.y, 3);
                // origin.endFill();
                // this.frontLayer.addChild(origin);
            }
        },

        /**
         * The Rectangle.overlaps function can actually take an x and y
         *   value, a point, or another rectangle, so any of those will
         *   work here fore parameters.
         */
        overlaps: function(x, y) {
            return this.rect.overlaps(x, y);
        },

        /**
         * Places the thermometer at the next open anchor.  Returns
         *   false if it couldn't be placed and the coordinates of the
         *   anchor if it was placed.
         */
        addThermometer: function(thermometerView) {
            var i = 0;
            while (i < this.anchors.length) {
                if (!this.anchors[i].view)
                    return this.addThermometerAt(thermometerView, i);
                i++;
            }
            return false;
        },

        /**
         * Attempts to place a thermometer near a point. If the nearest 
         *   anchor point already has a thermometer, it tries to place
         *   it in the next nearest position and so on.
         */
        addThermometerNear: function(thermometerView, point) {
            var a = new Vector2(point.x, point.y);
            var b = new Vector2();

            // Get the distances between this point and each anchor
            var distances = _.map(this.anchors, function(anchor, index) {
                b.set(anchor.point);
                return {
                    distance: a.distance(b),
                    index: index
                };
            }, this);

            // Sort the distances to find which is closest
            _.sortBy(distances, function(obj) {
                return obj.distance;
            });

            var i = 0;
            while (i < distances.length) {
                if (!this.anchors[distances[i].index].view) {
                    // Add the thermometer to this anchor and return the coordinates
                    return this.addThermometerAt(thermometerView, distances[i].index);
                }
                i++;
            }
        },

        /**
         * If the anchor at the specified index is empty, it places
         *   the thermometer view at that anchor point, adding the
         *   thermometer view's display object to the thermometer
         *   layer and returning the anchor's coordinates.
         */
        addThermometerAt: function(thermometerView, index) {
            if (this.anchors[index].view)
                return false;

            this.anchors[index].view = thermometerView;
            this.thermometerLayer.addChild(thermometerView.displayObject);

            return this.anchors[index].point;
        },

        /**
         * Removes the specified thermometer view from its anchor
         *   and its display object from the thermometer layer.
         *   Returns false if the thermometer view is not in any
         *   of the anchors.
         */
        removeThermometer: function(thermometerView) {
            var anchor = _.findWhere(this.anchors, { view: thermometerView });
            if (!anchor)
                return false;

            anchor.view = null;
            this.thermometerLayer.removeChild(thermometerView.displayObject);

            return thermometerView;
        }

    });

    return ThermometerClipsView;
});