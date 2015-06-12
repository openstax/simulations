define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PiecewiseCurve   = require('../../math/piecewise-curve');
    var Colors           = require('../../colors/colors');
    var PixiView         = require('../view');
    var SliderView       = require('./slider');

    var Assets = require('assets');

    var HOT_COLOR     = Colors.parseHex('#ff4500');
    var COLD_COLOR    = Colors.parseHex('#0000f0');
    var NEUTRAL_COLOR = Colors.parseHex('#333');

    var HeaterCoolerViewModel = Backbone.Model.extend({
        defaults: {
            heatCoolLevel: 0
        }
    });

    /**
     * A view that creates a bucket with ice and fire that the user 
     *   can control to add or remove heat from something. The view
     *   uses a HeaterCoolerViewModel to record the current heating
     *   and cooling amount or any model that has a 'heatCoolLevel'
     *   attribute.
     */
    var FlatHeaterCoolerView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                width:  100,
                height: 100,
                elementThickness: 4,

                textFont: 'bold 17px Arial',
                textColor: '#000',

                fillColor: '#555',
                lineWidth: 2,
                lineColor: '#444',

                heatingEnabled: true,
                coolingEnabled: true,
                sliderReturnsToCenter: true,
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.elementThickness = options.elementThickness;

            this.textFont  = options.textFont;
            this.textColor = options.textColor;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.lineWidth = options.lineWidth;
            this.lineColor = Colors.parseHex(options.lineColor);

            this.heatingEnabled = options.heatingEnabled;
            this.coolingEnabled = options.coolingEnabled;
            this.sliderReturnsToCenter = options.sliderReturnsToCenter;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initUnit();
            this.initSlider();
        },

        initUnit: function() {
            var width = this.width;
            var height = this.height;
            var elementThickness = this.elementThickness;
            var baseHeight = height - elementThickness;

            var base = new PIXI.Graphics();
            base.lineStyle(this.lineWidth, this.lineColor, 1);
            base.beginFill(this.fillColor, 1);
            base.drawRect(-width / 2, -baseHeight, width, baseHeight);
            base.endFill();
            this.displayObject.addChild(base);

            this.hotElement = new PIXI.Graphics();
            this.coldElement = new PIXI.Graphics();
            this.neutralElement = new PIXI.Graphics();

            this.hotElement.beginFill(HOT_COLOR, 1);
            this.hotElement.drawRect(-width / 2, -height, width, elementThickness);
            this.hotElement.endFill();

            this.coldElement.beginFill(COLD_COLOR, 1);
            this.coldElement.drawRect(-width / 2, -height, width, elementThickness);
            this.coldElement.endFill();

            this.neutralElement.beginFill(NEUTRAL_COLOR, 1);
            this.neutralElement.drawRect(-width / 2, -height, width, elementThickness);
            this.neutralElement.endFill();

            this.displayObject.addChild(this.neutralElement);
            this.displayObject.addChild(this.hotElement);
            this.displayObject.addChild(this.coldElement);
        },

        initSlider: function() {
            // Slider background (hot to cold)
            var bgHeight = 6;
            var bgWidth = this.width - 60 - 60;
            if (bgWidth < 30)
                bgWidth = this.width * 0.66;

            var canvas = document.createElement('canvas');
            canvas.width  = bgWidth;
            canvas.height = bgHeight;
            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, bgWidth, 0);
            gradient.addColorStop(0, HOT_COLOR);
            gradient.addColorStop(1, COLD_COLOR);
            
            ctx.fillStyle = gradient;
            ctx.lineWidth   = 1;
            ctx.strokeStyle = '#000';
            ctx.rect(0, 0, bgWidth, bgHeight);
            ctx.fill();
            ctx.stroke();

            var sliderBackground = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            sliderBackground.anchor.y = 0.5;

            // Create the slider view
            this.sliderView = new SliderView({
                start: 0,
                range: {
                    min: this.coolingEnabled ? -1 : 0,
                    max: this.heatingEnabled ?  1 : 0
                },
                orientation: 'horizontal',
                direction: 'rtl',

                background: sliderBackground,
                handleColor: '#ced9e5',
                handleLineColor: '#444',
                handleLineWidth: 2
            });
            this.sliderView.displayObject.x = 0;
            this.sliderView.displayObject.y = -(this.height - this.elementThickness) / 2;
            this.frontLayer.addChild(this.sliderView.displayObject);

            // Bind events
            this.listenTo(this.sliderView, 'slide', function(value, prev) {
                var percent = Math.abs(value);
                if (value > 0) {
                    this.coldElement.alpha = 0;
                    this.hotElement.alpha = percent;
                }
                else {
                    this.hotElement.alpha = 0;
                    this.coldElement.alpha = percent;
                }
                this.model.set('heatCoolLevel', value);
            });

            if (this.sliderReturnsToCenter) {
                this.listenTo(this.sliderView, 'drag-end', function() {
                    this.sliderView.val(0);
                    this.fire.alpha = 0;
                    this.ice.alpha = 0;
                    this.model.set('heatCoolLevel', 0);
                });    
            }

            // Labels
            var textStyle = {
                font: this.textFont,
                fill: this.textColor,
                dropShadowColor: '#ced9e5',
                dropShadow: true,
                dropShadowAngle: 2 * Math.PI,
                dropShadowDistance: 1
            };

            if (this.heatingEnabled) {
                var heat = new PIXI.Text('Heat', textStyle);
                heat.anchor.y = 0.1;
                heat.x = textOffset;
                heat.y = this.sliderView.displayObject.y;
                this.frontLayer.addChild(heat);    
            }
            
            if (this.coolingEnabled) {
                var cool = new PIXI.Text('Cool', textStyle);
                cool.anchor.y = 0.64;
                cool.x = textOffset;
                cool.y = this.sliderView.displayObject.y + this.sliderView.displayObject.height;
                this.frontLayer.addChild(cool);
            }
        },

    }, {

        HeaterCoolerViewModel: HeaterCoolerViewModel

    });

    return FlatHeaterCoolerView;
});