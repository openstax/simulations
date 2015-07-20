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
            var width  = Math.round(this.mvt.modelToViewDeltaX(0.006));
            var height = Math.round(this.mvt.modelToViewDeltaX(0.014));
            var capacitorCenter = this.mvt.modelToView(this.model.capacitors.first().get('position'));
            var x = capacitorCenter.x - width / 2;
            var y = AppView.windowIsShort() ? 12 : 20;

            var panel = new PIXI.Graphics();
            panel.x = x;
            panel.y = y;
            panel.beginFill(0xE2F3FA, 1);
            panel.drawRect(0, 0, width, height);
            panel.endFill();
            this.displayObject.addChild(panel);

            var sliderHeight = Math.floor(height * 0.75);

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

            // Position and add it
            sliderView.displayObject.x = Math.round(width * 0.25);
            sliderView.displayObject.y = -sliderView.displayObject.height / 2 + height / 2;
            panel.addChild(sliderView.displayObject);

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

            this.plateChargeSlider = sliderView;
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
            if (batteryConnected)
                this.showWires();
            else {
                this.hideWires();
                this.plateChargeSlider.val(circuit.capacitors.first().get('disconnectedPlateCharge'));
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