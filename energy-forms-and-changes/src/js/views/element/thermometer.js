define(function(require) {

    'use strict';

    // var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');
    var Colors  = require('common/colors/colors');

    var ElementView = require('views/element');
    var Assets   = require('assets');

    /**
     * A view that represents the air model
     */
    var ThermometerView = ElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                movable: true
            }, options);
            
            ElementView.prototype.initialize.apply(this, [options]);

            this._position = new Vector2();
        },

        initGraphics: function() {
            var back  = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_BACK);
            var front = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_FRONT);

            // back.anchor.x = front.anchor.x = 0.5;
            back.anchor.y = front.anchor.y = 1;
            var halfWidth = back.width / 2;

            this.displayObject.addChild(back);
            this.displayObject.addChild(front);

            var centerOfBulb = new Vector2(halfWidth, back.height);

            this.initMarker(back.width, halfWidth);

            // var origin = new PIXI.Graphics();
            // origin.beginFill(0xFF0000, 1);
            // origin.drawCircle(0, 0, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            // TODO: add tick marks and the column of red liquid
        },

        initMarker: function(width, halfWidth) {
            var borderThickness = 2;
            var width  = halfWidth * 0.5;
            var height = halfWidth * 0.7;

            var triangleTipOffset = new Vector2(-width - borderThickness * 2, -halfWidth);
            this.triangleTipOffset = triangleTipOffset;

            var triangleBackground = new PIXI.Graphics();
            var triangleForeground = new PIXI.Graphics();

            this.displayObject.addChild(triangleBackground);
            this.displayObject.addChild(triangleForeground);

            var trianglePolygon = new PIXI.Polygon(
                triangleTipOffset.x, triangleTipOffset.y,
                triangleTipOffset.x + width, triangleTipOffset.y - height / 2,
                triangleTipOffset.x + width, triangleTipOffset.y + height / 2,
                triangleTipOffset.x, triangleTipOffset.y
            );
            triangleBackground.lineStyle(borderThickness * 2, 0x000000, 1);
            triangleBackground.drawShape(trianglePolygon);

            this.triangleForeground = triangleForeground;
            this.trianglePolygon = trianglePolygon;

            this.updateMarkerColor('#fff');
        },

        updateMarkerColor: function(color) {
            this.triangleForeground.beginFill(Colors.parseHex(color), 1);
            this.triangleForeground.drawShape(this.trianglePolygon);
            this.triangleForeground.endFill();
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            viewPoint.sub(this.triangleTipOffset);
            this.displayObject.x = viewPoint.x;
            this.displayObject.y = viewPoint.y;
        },

        setPosition: function(x, y) {
            var position = this.mvt.viewToModel(this._position.set(x, y));
            this.model.setPosition(position);
        }

    });

    return ThermometerView;
});