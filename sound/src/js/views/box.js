
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

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBox();
            this.initPressureGauge();
        },

        initBox: function() {
            this.boxFill    = new PIXI.Graphics();
            this.boxOutline = new PIXI.Graphics();

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
            this.pressureGaugeView.displayObject.y = -100;
            this.displayObject.addChild(this.pressureGaugeView.displayObject);
        },

        drawBox: function() {
            var fill    = this.boxFill;
            var outline = this.boxOutline;

            
        },

        /**
         * 
         */
        update: function(time, deltaTime, paused) {
            if (!paused) {
                
            }
        },

    });

    return BoxView;
});
