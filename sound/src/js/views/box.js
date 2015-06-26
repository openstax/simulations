
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView          = require('common/pixi/view');
    var PressureGaugeView = require('common/pixi/view/pressure-gauge');
    var Colors            = require('common/colors/colors');
    var Vector2           = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * A box that surrounds the speaker that we can drain air
     *   from and that has a pressure gauge. 
     */
    var BoxView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                thickness: 8,
                color: '#21366b'
            }, options);

            this.thickness = options.thickness;
            this.colorString = options.color;
            this.color = Colors.parseHex(options.color);

            this.mvt = options.mvt;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBox();
            this.initPressureGauge();

            this.updateMVT(this.mvt);
        },

        initBox: function() {
            this.boxFill    = new PIXI.Graphics();
            this.boxOutline = new PIXI.Graphics();

            this.boxFill.alpha = 0.2;

            this.displayObject.addChild(this.boxFill);
            this.displayObject.addChild(this.boxOutline);
        },

        initPressureGauge: function() {
            this.pressureGaugeView = new PressureGaugeView({
                value: 1,
                readoutFont: '11px Arial',
                unitsFont:   'bold 8px Arial',

                allowOverload: false,

                radius: 48,
                outlineColor: this.colorString,
                outlineThickness: 5,

                tickMargin: 9,

                connectorLength: 12,
                connectorWidth:  24,
                connectorColor1: '#000',
                connectorColor2: this.colorString
            });
            
            this.displayObject.addChild(this.pressureGaugeView.displayObject);
        },

        drawBox: function() {
            this.boxFill.clear();
            this.boxFill.beginFill(0x000000);
            this.drawBoxShape(this.boxFill);
            this.boxFill.endFill();

            this.boxOutline.clear();
            this.boxOutline.lineStyle(this.thickness, this.color, 1);
            this.drawBoxShape(this.boxOutline);
        },

        drawBoxShape: function(graphics) {
            var height     = Math.abs(this.mvt.modelToViewDeltaY(BoxView.HEIGHT_IN_METERS));
            var width      = this.mvt.modelToViewDeltaX(BoxView.WIDTH_IN_METERS);
            var leftOffset = this.mvt.modelToViewDeltaX(BoxView.LEFT_OFFSET_IN_METERS);
            var arcRadius  = this.mvt.modelToViewDeltaX(BoxView.ARC_RADIUS_IN_METERS);
            var rightOffset = width + leftOffset;

            graphics.moveTo(rightOffset,  height / 2);
            graphics.lineTo(leftOffset,   height / 2);
            graphics.lineTo(leftOffset,  -height / 2);
            graphics.lineTo(rightOffset, -height / 2);
            graphics.lineTo(rightOffset,  height / 2);
            // graphics.arcTo(
            //     rightOffset, -height / 2,
            //     rightOffset,  height / 2,
            //     arcRadius
            // );
        },

        /**
         * 
         */
        update: function(time, deltaTime, paused) {
            if (!paused) {
                
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawBox();
            this.positionPressureGauge();
        },

        positionPressureGauge: function() {
            var height     = Math.abs(this.mvt.modelToViewDeltaY(BoxView.HEIGHT_IN_METERS));
            var width      = this.mvt.modelToViewDeltaX(BoxView.WIDTH_IN_METERS);
            var leftOffset = this.mvt.modelToViewDeltaX(BoxView.LEFT_OFFSET_IN_METERS);

            this.pressureGaugeView.displayObject.x = leftOffset + width / 2;
            this.pressureGaugeView.displayObject.y = Math.round(-height / 2);
        }

    }, Constants.BoxView);

    return BoxView;
});
