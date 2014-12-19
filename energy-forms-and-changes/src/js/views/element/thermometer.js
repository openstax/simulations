define(function(require) {

    'use strict';

    // var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2   = require('common/math/vector2');
    var Functions = require('common/math/functions');
    var Colors    = require('common/colors/colors');

    var ElementView = require('views/element');
    var Assets   = require('assets');

    var Constants = require('constants');

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

            this.measurableElementViews = options.measurableElementViews;
            
            ElementView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:sensedElement', this.updateSensedElement);
            this.listenTo(this.model, 'change:sensedTemperature', this.updateTemperature);

            this._position = new Vector2();
        },

        initGraphics: function() {
            var back  = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_BACK);
            var front = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_FRONT);

            this.backLayer  = back;
            this.frontLayer = front;

            // back.anchor.x = front.anchor.x = 0.5;
            back.anchor.y = front.anchor.y = 1;
            var halfWidth = back.width / 2;
            this.width  = back.width;
            this.height = back.height;

            var centerOfBulb = new Vector2(halfWidth, -halfWidth);

            var bottomTickY = centerOfBulb.y - back.height * 0.1;
            var topTickY    = -back.height * 0.9;
            var tickSpacing = (topTickY - bottomTickY) / ThermometerView.NUM_TICK_MARKS;

            var freezingY = bottomTickY + tickSpacing; // second tick mark from bottom
            var boilingY  = topTickY    - tickSpacing; // second tick mark from top

            this.displayObject.addChild(back);
            this.initLiquid(back.width, back.height, freezingY, boilingY, centerOfBulb);
            this.initMarker(back.width, halfWidth);
            this.initTickMarks(back.width, bottomTickY, topTickY, tickSpacing);
            this.displayObject.addChild(front);

            // var origin = new PIXI.Graphics();
            // origin.beginFill(0x0000FF, 1);
            // origin.drawCircle(centerOfBulb.x, centerOfBulb.y, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            // TODO: add tick marks and the column of red liquid
        },

        initTickMarks: function(backWidth, bottomTickY, topTickY, tickSpacing) {
            var xOffset = Math.floor(backWidth * 0.26);

            var shortTickWidth = backWidth * 0.12;
            var longTickWidth  = shortTickWidth * 2;

            var ticks = new PIXI.Graphics();
            ticks.lineStyle(ThermometerView.TICK_MARK_THICKNESS, 0x000000, 1);
            var y = 0;
            for (var i = 0; i < ThermometerView.NUM_TICK_MARKS; i++) {
                y = Math.floor(topTickY - i * tickSpacing);
                ticks.moveTo(xOffset, y);
                ticks.lineTo(xOffset + (( i - 1 ) % 5 == 0 ? longTickWidth : shortTickWidth), y);
            }
            this.displayObject.addChild(ticks);
        },

        initLiquid: function(backWidth, backHeight, freezingY, boilingY, centerOfBulb) {
            // Function for determining liquid column height
            var freezingHeight = centerOfBulb.y - freezingY;
            var boilingHeight  = centerOfBulb.y - boilingY;

            this.liquidHeightFunction = new Functions.createLinearFunction(
                Constants.FREEZING_POINT_TEMPERATURE,
                Constants.BOILING_POINT_TEMPERATURE,
                freezingHeight,
                boilingHeight
            );

            // Create liquid column
            var width = backWidth * 0.45;

            var canvas = document.createElement('canvas');
            canvas.width  = width;
            canvas.height = 1;

            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0,   ThermometerView.LIQUID_COLOR);
            gradient.addColorStop(0.4, ThermometerView.LIQUID_COLOR);
            gradient.addColorStop(0.7, ThermometerView.LIQUID_HIGHLIGHT_COLOR);
            gradient.addColorStop(1,   ThermometerView.LIQUID_COLOR);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            this.liquid = new PIXI.Sprite(new PIXI.Texture.fromCanvas(canvas));
            this.liquid.anchor.y = 1;
            this.liquid.y = centerOfBulb.y;
            this.liquid.x = centerOfBulb.x - width / 2 + this.width * 0.02;
            this.backLayer.addChild(this.liquid);

            // Mask so it's contained at the top

        },

        initMarker: function(width, halfWidth) {
            var borderThickness = 2;
            var width  = halfWidth * 0.5;
            var height = halfWidth * 0.7;

            var triangleTipOffset = new Vector2(-width, -halfWidth);
            this.triangleTipOffset = triangleTipOffset;
            this.triangleBorderThickness = borderThickness;

            var triangleBackground = new PIXI.Graphics();
            var triangleForeground = new PIXI.Graphics();

            this.displayObject.addChild(triangleBackground);
            this.displayObject.addChild(triangleForeground);

            var offsetX = triangleTipOffset.x - borderThickness * 2;

            var trianglePolygon = new PIXI.Polygon(
                offsetX, triangleTipOffset.y,
                offsetX + width, triangleTipOffset.y - height / 2,
                offsetX + width, triangleTipOffset.y + height / 2,
                offsetX, triangleTipOffset.y
            );
            triangleBackground.lineStyle(borderThickness * 2, 0x000000, 1);
            triangleBackground.drawShape(trianglePolygon);

            this.triangleForeground = triangleForeground;
            this.trianglePolygon = trianglePolygon;

            this.updateSensedElement();
        },

        updateSensedElement: function(model, element) {
            var color = '#777';

            for (var i = 0; i < this.measurableElementViews.length; i++) {
                if (this.measurableElementViews[i].model === element) {
                    color = this.measurableElementViews[i].getColor();
                    break;
                }
            }

            this.triangleForeground.beginFill(Colors.parseHex(color), 1);
            this.triangleForeground.drawShape(this.trianglePolygon);
            this.triangleForeground.endFill();
        },

        updateTemperature: function(model, temperature) {
            this.liquid.scale.y = this.liquidHeightFunction(temperature);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            viewPoint.sub(this.triangleTipOffset);
            // viewPoint.add(this.triangleBorderThickness, -this.triangleBorderThickness / 2);
            this.displayObject.x = viewPoint.x;
            this.displayObject.y = viewPoint.y;
        },

        setCenterPosition: function(x, y) {
            var position = this._position.set(x, y);
            position.sub(this.width / 2, -this.height / 2);
            position.add(this.triangleTipOffset);
            var modelPosition = this.mvt.viewToModel(position);
            this.model.setPosition(modelPosition);
        }

    }, Constants.ThermometerView);

    return ThermometerView;
});