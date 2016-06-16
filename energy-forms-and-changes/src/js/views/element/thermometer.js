define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2   = require('common/math/vector2');
    var Functions = require('common/math/functions');
    var Colors    = require('common/colors/colors');

    var IntroElementView = require('views/intro-element');
    
    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the air model
     */
    var ThermometerView = IntroElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                movable: true
            }, options);

            this.measurableElementViews = options.measurableElementViews;
            
            IntroElementView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:sensedElement', this.updateSensedElement);
            this.listenTo(this.model, 'change:sensedTemperature', this.updateTemperature);

            this._position = new Vector2();
        },

        initGraphics: function() {
            var back  = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_BACK);
            var front = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_FRONT);

            this.back = back;
            this.front = front;
            
            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(ThermometerView.HEIGHT_IN_METERS)); // in pixels
            var scale = targetSpriteHeight / back.texture.height;

            back.scale.x = back.scale.y = scale;
            front.scale.x = front.scale.y = scale;

            this.backLayer  = new PIXI.Container;
            this.frontLayer = new PIXI.Container;

            this.backLayer.addChild(back);
            this.frontLayer.addChild(front);

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

            this.displayObject.addChild(this.backLayer);

            this.initLiquid(back.width, back.height, freezingY, boilingY, centerOfBulb);
            this.initMarker(halfWidth);
            this.initTickMarks(back.width, bottomTickY, topTickY, tickSpacing);

            this.displayObject.addChild(this.frontLayer);

            // var origin = new PIXI.Graphics();
            // origin.beginFill(0x0000FF, 1);
            // origin.drawCircle(centerOfBulb.x, centerOfBulb.y, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            this.updateTemperature(null, Constants.ROOM_TEMPERATURE);
        },

        initTickMarks: function(backWidth, bottomTickY, topTickY, tickSpacing) {
            var xOffset = Math.floor(backWidth * 0.26);

            var shortTickWidth = backWidth * 0.12;
            var longTickWidth  = shortTickWidth * 2;

            var ticks = new PIXI.Graphics();
            var thickness = Math.max(1, Math.round(ThermometerView.TICK_MARK_THICKNESS * this.back.scale.x));
            ticks.lineStyle(thickness, 0x000000, 1);
            var y = 0;
            for (var i = 0; i < ThermometerView.NUM_TICK_MARKS; i++) {
                y = Math.floor(topTickY - i * tickSpacing);
                ticks.moveTo(xOffset, y);
                ticks.lineTo(xOffset + (( i - 1 ) % 5 === 0 ? longTickWidth : shortTickWidth), y);
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

            var liquidFill = new PIXI.Graphics();
            liquidFill.beginFill(Colors.parseHex(ThermometerView.LIQUID_COLOR), 1);
            liquidFill.drawRect(0, 0, width, 1);

            this.liquid = new PIXI.Sprite(liquidFill.generateTexture());
            this.liquid.anchor.y = 1;
            this.liquid.y = centerOfBulb.y;
            this.liquid.x = centerOfBulb.x - width / 2 + this.width * 0.02;
            this.backLayer.addChild(this.liquid);

            // Mask so it's contained at the top
            var left   = (backWidth - width) / 2;
            var right  = left + width;
            var top    = -backHeight + (width / 2);
            var bottom = centerOfBulb.y;

            var mask = new PIXI.Graphics();
            mask.beginFill(0x000000, 1);
            mask.moveTo(left, top);
            mask.bezierCurveTo(left, top - width / 2, right, top - width / 2, right, top);
            mask.lineTo(right, bottom);
            mask.lineTo(left, bottom);
            mask.lineTo(left, top);
            mask.endFill();
            this.backLayer.addChild(mask);
            this.liquid.mask = mask;
        },

        initMarker: function(halfBackWidth) {
            var borderThickness = 2;
            var width  = halfBackWidth * 0.5;
            var height = halfBackWidth * 0.7;

            var triangleTipOffset = new Vector2(-width, -halfBackWidth);
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
            var color = '#333';

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