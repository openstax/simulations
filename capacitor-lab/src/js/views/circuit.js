define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView   = require('common/pixi/view');
    var SliderView = require('common/pixi/view/slider');
    var AppView    = require('common/app/app');
    var Colors     = require('common/colors/colors');
    var Vector2    = require('common/math/vector2');

    var CapacitorView           = require('views/capacitor');
    var DielectricCapacitorView = require('views/capacitor/dielectric');
    var WireView                = require('views/wire');
    var BatteryView             = require('views/battery');

    var Constants = require('constants');

    /**
     * 
     */
    var CircuitView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.dielectric = options.dielectric;
            this.maxDielectricEField = options.maxDielectricEField;
            this.maxPlateCharge = options.maxPlateCharge;
            this.maxExcessDielectricPlateCharge = options.maxExcessDielectricPlateCharge;
            this.maxEffectiveEField = options.maxEffectiveEField;

            // Arrays for views
            this.batteryViews = [];
            this.capacitorViews = [];
            this.wireViews = [];

            // Cached objects

            // Initialize graphics
            this.initGraphics();

            this.listenTo(this.model, 'change:batteryConnected', this.batteryConnectedStateChanged);
        },

        initGraphics: function() {
            this.components = new PIXI.DisplayObjectContainer();

            this.addBattery();
            this.addCapacitors();
            this.addWires();

            this.initPlateChargePanel();

            this.displayObject.addChild(this.components);
            
            this.updateMVT(this.mvt);
        },

        addBattery: function() {
            var batteryView = new BatteryView({
                model: this.model.battery,
                mvt: this.mvt
            });
            this.batteryViews.push(batteryView);
        },

        addCapacitors: function() {
            var capacitors = this.model.capacitors;
            var capacitorView;
            for (var i = 0; i < capacitors.length; i++) {
                var options = {
                    model: capacitors.at(i),
                    mvt: this.mvt,
                    maxDielectricEField: this.maxDielectricEField,
                    maxPlateCharge: this.maxPlateCharge,
                    maxExcessDielectricPlateCharge: this.maxExcessDielectricPlateCharge,
                    maxEffectiveEField: this.maxEffectiveEField
                };

                if (this.dielectric)
                    capacitorView = new DielectricCapacitorView(options);
                else
                    capacitorView = new CapacitorView(options);

                this.capacitorViews.push(capacitorView);
            }
        },

        /**
         * Creates and adds the wire views
         */
        addWires: function() {
            var wires = this.model.wires;
            for (var i = 0; i < wires.length; i++) {
                var wireView = new WireView({
                    model: wires.at(i),
                    mvt: this.mvt
                });
                this.wireViews.push(wireView);
            }
        },

        initPlateChargePanel: function() {
            var width  = Math.round(this.mvt.modelToViewDeltaX(AppView.windowIsShort() ? 0.0100 : 0.0075));
            var height = Math.round(this.mvt.modelToViewDeltaX(0.014));
            var capacitorCenter = this.mvt.modelToView(this.model.capacitors.first().get('position'));
            var x = Math.round(capacitorCenter.x - width / 2);
            var y = AppView.windowIsShort() ? 12 : 20;

            var panel = new PIXI.Graphics();
            panel.x = x;
            panel.y = y;
            panel.beginFill(0xE2F3FA, 1);
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
                backgroundColor: '#fff',
                backgroundAlpha: 1,
                handleSize: 11
            });

            // Position it
            sliderView.displayObject.x = Math.round(width * 0.20);
            sliderView.displayObject.y = -sliderView.displayObject.height / 2 + height / 2;
            

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
            var noneY  = Math.round(sliderView.displayObject.y + sliderView.displayObject.height / 2)
            var minusY = Math.round(sliderView.displayObject.y + sliderView.displayObject.height) - 1;

            plus.x = none.x = minus.x = markerX;

            plus.y  = plusY;
            none.y  = noneY;
            minus.y = minusY;

            plus.anchor.y = none.anchor.y = minus.anchor.y = 0.4;

            var lineStartX = sliderView.displayObject.x;
            var lineEndX = markerX - 3;
            var lines = new PIXI.Graphics();
            lines.lineStyle(1, 0xFFFFFF, 1);
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
            caption.x = width / 2;
            caption.y = Math.round(height + 4);
            caption.anchor.x = 0.5;

            panel.addChild(lines);
            panel.addChild(plus);
            panel.addChild(none);
            panel.addChild(minus);
            panel.addChild(sliderView.displayObject);
            panel.addChild(caption);

            panel.visible = false;
            this.plateChargePanel = panel;
        },

        getAllComponentViews: function() {
            return _.flatten([
                this.batteryViews,
                this.capacitorViews,
                this.wireViews
            ]);
        },

        /**
         * Sorts all the component views by their y-position, removing them from
         *   the components display object container and adding them back in the
         *   right order.  That way the rendering order looks right visually.
         */
        sortComponents: function() {
            var views = this.getAllComponentViews();

            // Sort so components with lower y values are at the end
            views.sort(function(a, b) {
                return b.getYSortValue() - a.getYSortValue();
            });

            this.components.removeChildren();
            for (var i = 0; i < views.length; i++)
                this.components.addChild(views[i].displayObject);
        },

        removeComponentViews: function() {
            var views = this.getAllComponentViews();

            for (var i = views.length - 1; i >= 0; i--) {
                views[i].removeFrom(this.components);
                views.splice(i, 1);
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.sortComponents();
        },

        batteryConnectedStateChanged: function(circuit, batteryConnected) {
            if (batteryConnected) {
                this.showWires();
                this.plateChargePanel.visible = false;
            }
            else {
                this.hideWires();
                this.plateChargeSlider.val(circuit.capacitors.first().get('disconnectedPlateCharge'));
                this.plateChargePanel.visible = true;
            }
        },

        showWires: function() {
            for (var i = 0; i < this.wireViews.length; i++)
                this.wireViews[i].show();
        },

        hideWires: function() {
            for (var i = 0; i < this.wireViews.length; i++)
                this.wireViews[i].hide();
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

        showPlateCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].showPlateCharges();
        },

        hidePlateCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].hidePlateCharges();
        }

    });

    return CircuitView;
});