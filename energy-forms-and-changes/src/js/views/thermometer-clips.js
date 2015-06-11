define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var PixiView  = require('common/pixi/view');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the air model
     */
    var ThermometerClipsView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = options || {};

            this.mvt = options.mvt;
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.numThermometerSpots = options.numThermometerSpots || 3;

            this.anchors = [];

            this.initGraphics();
        },

        initGraphics: function() {
            this.displayObject.x = this.x;
            this.displayObject.y = this.y;

            var woodXOffsetPercent = 13 / 270; // Percent of total texture width
            var woodYOffsetPercent = 19 / 139; // Percent of total texture width
            var woodWidthPercent  = 236 / 270; // Percent of total texture width
            
            var base = Assets.createSprite(Assets.Images.THERMOMETER_CLIP_BASE);
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(ThermometerClipsView.BASE_WIDTH / woodWidthPercent); // in pixels
            var scale = targetSpriteWidth / base.texture.width;
            base.scale.x = scale;
            base.scale.y = scale;
            base.anchor.x = woodXOffsetPercent;
            base.anchor.y = woodYOffsetPercent;

            this.backLayer        = new PIXI.DisplayObjectContainer();
            this.thermometerLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer       = new PIXI.DisplayObjectContainer();
            
            this.displayObject.addChild(base);
            this.displayObject.addChild(this.backLayer);
            this.displayObject.addChild(this.thermometerLayer);
            this.displayObject.addChild(this.frontLayer);
            
            var width = this.mvt.modelToViewDeltaX(ThermometerClipsView.BASE_WIDTH);
            var height = width * (108 / 236);
            var spacing = width / (this.numThermometerSpots + 1);
            var point;
            var backClip;
            var frontClip;
            var targetClipWidth = this.mvt.modelToViewDeltaX(ThermometerClipsView.CLIP_WIDTH); // In pixels
            var clipXAnchor = 0.40;
            var clipYAnchor = 0.56;
            var clipScale;
            console.log(spacing)

            for (var i = 0; i < this.numThermometerSpots; i++) {
                backClip  = Assets.createSprite(Assets.Images.THERMOMETER_CLIP_BACK);
                frontClip = Assets.createSprite(Assets.Images.THERMOMETER_CLIP_FRONT);

                backClip.anchor.x = frontClip.anchor.x = clipXAnchor;
                backClip.anchor.y = frontClip.anchor.y = clipYAnchor;

                clipScale = targetClipWidth / backClip.texture.width;
                backClip.scale.x = frontClip.scale.x = clipScale;
                backClip.scale.y = frontClip.scale.y = clipScale;

                point = new PIXI.Point(
                    this.x + spacing / 2 + i * spacing - backClip.width * (1 - clipXAnchor), 
                    this.y + height / 2
                );

                backClip.position  = point;
                frontClip.position = point;

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

            this.rect = new Rectangle(this.x, this.y, this.displayObject.width, this.displayObject.height * 0.6);
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
        },

        removeThermometers: function() {
            _.each(this.anchors, function(anchor) {
                anchor.view = null;
            });
            this.thermometerLayer.removeChildren();
        }

    }, Constants.ThermometerClipsView);

    return ThermometerClipsView;
});