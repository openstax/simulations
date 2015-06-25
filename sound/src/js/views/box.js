
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
            this.pressureGaugeView = new PressureGaugeView();
            this.displayObject.addChild(this.pressureGaugeView);
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
