define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    var SAT  = require('sat');

    var defineInputUpdateLocks = require('common/locks/define-locks');
    
    var AppView    = require('common/app/app');
    var PixiView   = require('common/pixi/view');
    var SliderView = require('common/pixi/view/slider');
    var Vector2    = require('common/math/vector2');
    var Colors     = require('common/colors/colors');

    var BatteryShapeCreator = require('shape-creators/battery');

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
            this.listenTo(this.model, 'change:voltage',   this.updateVoltage);
        },

        initGraphics: function() {
            this.shapeCreator = new BatteryShapeCreator(this.model, this.mvt);

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
            var sliderHeight = Math.floor(cylindarHeight * 0.73);

            var sliderView = new SliderView({
                start: Constants.BATTERY_VOLTAGE_RANGE.defaultValue,
                range: {
                    min: Constants.BATTERY_VOLTAGE_RANGE.min,
                    max: Constants.BATTERY_VOLTAGE_RANGE.max
                },
                orientation: 'vertical',
                direction: 'rtl',

                width: sliderHeight,
                backgroundHeight: AppView.windowIsShort() ? 3 : 4,
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
                this.inputLock(function() {
                    this.model.set('voltage', value);
                });

                if (value >= 0)
                    this.pointUp();
                else
                    this.pointDown();
            });

            this.listenTo(sliderView, 'drag-end', function() {
                // Snap to zero if we get close
                if (Math.abs(sliderView.val()) < 0.1) {
                    sliderView.val(0);

                    this.inputLock(function() {
                        this.model.set('voltage', 0);
                    });

                    this.pointUp();
                }
            }); 

            // Draw guide marks
            var lineWidth = AppView.windowIsShort() ? 12 : 14;
            var halfWidth = lineWidth / 2;
            var lineThickness = 1;
            var top = Math.floor(sliderView.displayObject.y);
            var middle = Math.floor(sliderView.displayObject.y + sliderView.displayObject.height / 2);
            var bottom = Math.floor(sliderView.displayObject.y + sliderView.displayObject.height - lineThickness);
            var textMargin = AppView.windowIsShort() ? 2 : 4;

            var lines = new PIXI.Graphics();
            lines.lineStyle(lineThickness, Colors.parseHex('#777'), 0.8);
            lines.moveTo(-halfWidth, top);
            lines.lineTo( halfWidth, top);
            lines.moveTo(-halfWidth, middle);
            lines.lineTo( halfWidth, middle);
            lines.moveTo(-halfWidth, bottom);
            lines.lineTo( halfWidth, bottom);

            // Draw guide labels
            var fontSize = AppView.windowIsShort() ? 9 : 11;
            var textStyle = {
                font: fontSize + 'px Helvetica Neue',
                fill: '#777'
            };
            var topNumber    = new PIXI.Text( '1.5', textStyle);
            var middleNumber = new PIXI.Text( '0',   textStyle);
            var bottomNumber = new PIXI.Text('-1.5', textStyle);
            var topUnit      = new PIXI.Text('V',    textStyle);
            var middleUnit   = new PIXI.Text('V',    textStyle);
            var bottomUnit   = new PIXI.Text('V',    textStyle);

            topNumber.anchor.y = middleNumber.anchor.y = bottomNumber.anchor.y = 0.35;
            topUnit.anchor.y = middleUnit.anchor.y = bottomUnit.anchor.y = 0.35;

            topNumber.anchor.x = middleNumber.anchor.x = bottomNumber.anchor.x = 1;
            topNumber.x = middleNumber.x = bottomNumber.x = -halfWidth - textMargin;
            topUnit.x = middleUnit.x = bottomUnit.x = halfWidth + textMargin;
            topNumber.y = topUnit.y = top;
            middleNumber.y = middleUnit.y = middle;
            bottomNumber.y = bottomUnit.y = bottom;

            // Add everything
            this.displayObject.addChild(lines);
            this.displayObject.addChild(topNumber);
            this.displayObject.addChild(middleNumber);
            this.displayObject.addChild(bottomNumber);
            this.displayObject.addChild(topUnit);
            this.displayObject.addChild(middleUnit);
            this.displayObject.addChild(bottomUnit);
            this.displayObject.addChild(sliderView.displayObject);

            this.sliderView = sliderView;
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = Math.round(viewPos.x);
            this.displayObject.y = Math.round(viewPos.y);
        },

        updateVoltage: function(model, voltage) {
            this.updateLock(function() {
                this.sliderView.val(voltage);

                if (voltage >= 0)
                    this.pointUp();
                else
                    this.pointDown();
            });
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

            this.batteryPolygon = this.shapeCreator.createTopTerminalSilhouette();
        },

        pointUp: function() {
            this.batteryUp.visible = true;
            this.batteryDown.visible = false;
        },

        pointDown: function() {
            this.batteryUp.visible = false;
            this.batteryDown.visible = true;
        },

        /**
         * Returns whether or not the given polygon intersects this view.
         */
        intersects: function(polygon) {
            return SAT.testPolygonPolygon(polygon, this.batteryPolygon);
        },

        /**
         * Returns the y-value that should be used for sorting.
         */
        getYSortValue: function() {
            return this.displayObject.y;
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BatteryView);


    return BatteryView;
});