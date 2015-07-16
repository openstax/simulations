define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView   = require('common/pixi/view');
    var SliderView = require('common/pixi/view/slider');
    var Vector2    = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var BatteryView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                
            }, options);

            this.mvt = options.mvt;

            // Initialize graphics
            this.initGraphics();

            // Listen for model events
            this.listenTo(this.model, 'change:position',  this.updatePosition);
        },

        initGraphics: function() {
            this.batteryUp   = Assets.createSprite(Assets.Images.BATTERY_UP);
            this.batteryDown = Assets.createSprite(Assets.Images.BATTERY_DOWN);

            this.batteryUp.anchor.x = this.batteryUp.anchor.y = 0.5;
            this.batteryDown.anchor.x = this.batteryDown.anchor.y = 0.5;
            this.batteryDown.visible = false;

            this.displayObject.addChild(this.batteryUp);
            this.displayObject.addChild(this.batteryDown);

            this.initSlider();
            
            this.updateMVT(this.mvt);
        },

        initSlider: function() {
            var topHeight = this.mvt.modelToViewDeltaY(Constants.Battery.TOP_IMAGE_HEIGHT);
            var cylindarHeight = this.mvt.modelToViewDeltaY(Constants.Battery.BODY_HEIGHT) - topHeight;
            var sliderHeight = Math.floor(cylindarHeight * 0.8);

            var sliderView = new SliderView({
                start: Constants.BATTERY_VOLTAGE_RANGE.defaultValue,
                range: {
                    min: Constants.BATTERY_VOLTAGE_RANGE.min,
                    max: Constants.BATTERY_VOLTAGE_RANGE.max
                },
                orientation: 'vertical',
                direction: 'rtl',

                width: sliderHeight,
                backgroundHeight: 4,
                backgroundColor: '#ededed',
                backgroundAlpha: 1,
                backgroundLineColor: '#000',
                backgroundLineWidth: 2,
                backgroundLineAlpha: 0.2,
                handleSize: 12,
                handleColor: '#ededed',
                handleAlpha: 1,
                handleLineColor: '#777',
                handleLineWidth: 1,
            });

            // Position it
            
            sliderView.displayObject.y = -sliderView.displayObject.height / 2 + topHeight / 2;

            // Bind events for it
            this.listenTo(sliderView, 'slide', function(value, prev) {
                this.model.set('voltage', value);
            });

            // Add it
            this.displayObject.addChild(sliderView.displayObject);
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteWidth = this.mvt.modelToViewDeltaX(this.model.getBodyWidth()); // in pixels
            var scale = targetSpriteWidth / this.batteryUp.texture.width;
            this.batteryUp.scale.x = scale;
            this.batteryUp.scale.y = scale;
            this.batteryDown.scale.x = scale;
            this.batteryDown.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        /**
         * Returns the y-value that should be used for sorting.
         */
        getYSortValue: function() {
            return this.displayObject.y;
        }

    });

    return BatteryView;
});