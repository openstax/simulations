define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var SliderView = require('common/pixi/view/slider');
    var AppView    = require('common/app/app');

    var CircuitView             = require('views/circuit');
    var DielectricCapacitorView = require('views/capacitor/dielectric');

    /**
     * 
     */
    var DielectricCircuitView = CircuitView.extend({

        initialize: function(options) {
            CircuitView.prototype.initialize.apply(this, [ options ]);
        },

        initGraphics: function() {
            CircuitView.prototype.initGraphics.apply(this, arguments);

            this.initPlateChargePanel();
        },

        initPlateChargePanel: function() {
            var width  = Math.round(this.mvt.modelToViewDeltaX(AppView.windowIsShort() ? 0.0100 : 0.0075));
            var height = Math.round(this.mvt.modelToViewDeltaX(0.015));
            var capacitorCenter = this.mvt.modelToView(this.model.capacitors.first().get('position'));
            var x = Math.round(capacitorCenter.x - width / 2) - Math.round(this.mvt.modelToViewDeltaX(0.0031));
            var y = AppView.windowIsShort() ? 12 : 20;

            var panel = new PIXI.Graphics();
            panel.x = x;
            panel.y = y;
            panel.beginFill(0xFFFFFF, 0.7);
            panel.drawRect(0, 0, width, height);
            panel.endFill();
            this.displayObject.addChild(panel);

            var sliderHeight = Math.floor(height * (AppView.windowIsShort() ? 0.68 : 0.75));

            var sliderView = new SliderView({
                start: 0,
                range: {
                    min: -this.maxPlateCharge,
                    max:  this.maxPlateCharge
                },
                orientation: 'vertical',
                direction: 'rtl',

                width: sliderHeight,
                backgroundHeight: AppView.windowIsShort() ? 3 : 4,
                backgroundColor: '#A2B8C8',
                backgroundAlpha: 1,
                handleSize: 11
            });

            // Position it
            sliderView.displayObject.x = Math.round(width * 0.20);
            sliderView.displayObject.y = Math.round(height / 2 - sliderView.displayObject.height / 2);
            

            // Bind events for it
            this.listenTo(sliderView, 'slide', function(value, prev) {
                this.model.set('disconnectedPlateCharge', value);
            });

            this.listenTo(sliderView, 'drag-end', function() {
                // Snap to zero if we get close
                if (Math.abs(sliderView.val()) < this.maxPlateCharge * 0.05) {
                    sliderView.val(0);
                    this.model.set('disconnectedPlateCharge', 0);
                }
            }); 

            // Save a reference
            this.plateChargeSlider = sliderView;

            // Create labels
            var fontFamily = 'Helvetica Neue';
            var markerStyle = {
                font: 'bold 11px ' + fontFamily,
                fill: '#000'
            };

            var plus  = new PIXI.Text('Lots (+)', markerStyle);
            var none  = new PIXI.Text('None',     markerStyle);
            var minus = new PIXI.Text('Lots (-)', markerStyle);

            var markerX = Math.round(width * 0.36);
            var plusY  = Math.round(sliderView.displayObject.y);
            var noneY  = Math.round(sliderView.displayObject.y + sliderView.displayObject.height / 2) - 1;
            var minusY = Math.round(sliderView.displayObject.y + sliderView.displayObject.height) - 1;

            plus.x = none.x = minus.x = markerX;

            plus.y  = plusY;
            none.y  = noneY;
            minus.y = minusY;

            plus.anchor.y = none.anchor.y = minus.anchor.y = 0.4;

            var lineStartX = sliderView.displayObject.x;
            var lineEndX = markerX - 5;
            var lines = new PIXI.Graphics();
            lines.lineStyle(1, 0xA2B8C8, 1);
            lines.moveTo(lineStartX, plusY);
            lines.lineTo(lineEndX,   plusY);
            lines.moveTo(lineStartX, noneY);
            lines.lineTo(lineEndX,   noneY);
            lines.moveTo(lineStartX, minusY);
            lines.lineTo(lineEndX,   minusY);

            var caption = new PIXI.Text('Plate Charge (Top)', {
                font: 'bold 14px Helvetica Neue',
                fill: '#000'
            });
            caption.x = Math.round(width / 2 - caption.width / 2);
            caption.y = Math.round(height + 4);

            panel.addChild(lines);
            panel.addChild(plus);
            panel.addChild(none);
            panel.addChild(minus);
            panel.addChild(sliderView.displayObject);
            panel.addChild(caption);

            panel.visible = false;
            this.plateChargePanel = panel;
        },

        createCapacitorView: function(options) {
            return new DielectricCapacitorView(options);
        },

        showExcessDielectricCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].showExcessDielectricCharges();
        },

        hideExcessDielectricCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].hideExcessDielectricCharges();
        },

        showTotalDielectricCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].showTotalDielectricCharges();
        },

        hideTotalDielectricCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].hideTotalDielectricCharges();
        },

    });

    return DielectricCircuitView;
});