define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PiecewiseCurve   = require('../../math/piecewise-curve');
    var Colors           = require('../../colors/colors');
    var PixiView         = require('../view');
    var SliderView       = require('./slider');

    var Assets = require('assets');

    var HOT_SLIDER_COLOR  = '#ff4500';
    var COLD_SLIDER_COLOR = '#0000f0';

    var HOT_COLOR     = '#FF6B00';
    var COLD_COLOR    = '#3F87C3';
    var NEUTRAL_COLOR = '#555';

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
                filletRadius: 3,
                elementThickness: 10,
                elementWidthPercent: 0.9, 
                elementFilletRadius: 3,

                textFont: 'bold 17px Arial',
                textColor: '#000',

                fillColor: '#bbb',
                lineWidth: 1,
                lineColor: '#888',

                heatingEnabled: true,
                coolingEnabled: true,
                sliderReturnsToCenter: true,
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.filletRadius = options.filletRadius;
            this.elementThickness = options.elementThickness;
            this.elementWidthPercent = options.elementWidthPercent;
            this.elementWidth = this.width * this.elementWidthPercent;
            this.elementFilletRadius = options.elementFilletRadius;

            this.textFont  = options.textFont;
            this.textColor = options.textColor;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.handleColor = Colors.lightenHex(options.fillColor, 0.15);
            this.lineWidth = options.lineWidth;
            this.lineColor = Colors.parseHex(options.lineColor);

            this.hotColor     = Colors.parseHex(HOT_COLOR);
            this.coldColor    = Colors.parseHex(COLD_COLOR);
            this.neutralColor = Colors.parseHex(NEUTRAL_COLOR);

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
            var elementWidth = this.elementWidth;
            var elementFilletRadius = this.elementFilletRadius;
            var baseHeight = height - elementThickness;

            var base = new PIXI.Graphics();
            base.lineStyle(this.lineWidth, this.lineColor, 1);
            base.beginFill(this.fillColor, 1);
            base.drawRoundedRect(-width / 2, -baseHeight, width, baseHeight, this.filletRadius);
            base.endFill();
            

            
            var elementHeight = elementThickness * 2;
            var x = -elementWidth / 2;
            var y = -height;

            this.hotElement = new PIXI.Graphics();
            this.coldElement = new PIXI.Graphics();
            this.neutralElement = new PIXI.Graphics();

            this.hotElement.beginFill(this.hotColor, 1);
            this.hotElement.drawRoundedRect(x, y, elementWidth, elementHeight, elementFilletRadius);
            this.hotElement.endFill();

            this.coldElement.beginFill(this.coldColor, 1);
            this.coldElement.drawRoundedRect(x, y, elementWidth, elementHeight, elementFilletRadius);
            this.coldElement.endFill();

            this.neutralElement.beginFill(this.neutralColor, 1);
            this.neutralElement.drawRoundedRect(x, y, elementWidth, elementHeight, elementFilletRadius);
            this.neutralElement.endFill();

            this.displayObject.addChild(this.neutralElement);
            this.displayObject.addChild(this.hotElement);
            this.displayObject.addChild(this.coldElement);
            this.displayObject.addChild(base);

            // Default is neutral
            this.hotElement.alpha = 0;
            this.coldElement.alpha = 0;
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
            gradient.addColorStop(0, COLD_SLIDER_COLOR);
            gradient.addColorStop(1, HOT_SLIDER_COLOR);
            
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
                direction: 'ltr',

                background: sliderBackground,
                handleColor: this.handleColor,
                handleLineColor: Colors.darkenHex(this.handleColor, 0.6),
                handleLineWidth: 2
            });
            this.sliderView.displayObject.x = -bgWidth / 2;
            this.sliderView.displayObject.y = -(this.height - this.elementThickness) / 2;
            this.displayObject.addChild(this.sliderView.displayObject);

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
                    this.hotElement.alpha = 0;
                    this.coldElement.alpha = 0;
                    this.model.set('heatCoolLevel', 0);
                });    
            }

            // Labels
            // var textStyle = {
            //     font: this.textFont,
            //     fill: this.textColor,
            //     dropShadowColor: '#ced9e5',
            //     dropShadow: true,
            //     dropShadowAngle: 2 * Math.PI,
            //     dropShadowDistance: 1
            // };

            // if (this.heatingEnabled) {
            //     var heat = new PIXI.Text('Heat', textStyle);
            //     heat.anchor.y = 0.1;
            //     heat.x = textOffset;
            //     heat.y = this.sliderView.displayObject.y;
            //     this.displayObject.addChild(heat);    
            // }
            
            // if (this.coolingEnabled) {
            //     var cool = new PIXI.Text('Cool', textStyle);
            //     cool.anchor.y = 0.64;
            //     cool.x = textOffset;
            //     cool.y = this.sliderView.displayObject.y + this.sliderView.displayObject.height;
            //     this.displayObject.addChild(cool);
            // }
        },

    }, {

        HeaterCoolerViewModel: HeaterCoolerViewModel

    });

    return FlatHeaterCoolerView;
});