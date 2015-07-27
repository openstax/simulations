define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView   = require('common/pixi/view');
    var SliderView = require('common/pixi/view/slider');
    var AppView    = require('common/app/app');
    var Colors     = require('common/colors/colors');
    var Vector2    = require('common/math/vector2');

    var CapacitanceControlledCapacitorView = require('views/capacitor/capacitance-controlled');
    var CapacitorView                      = require('views/capacitor');
    var DielectricCapacitorView            = require('views/capacitor/dielectric');
    var WireView                           = require('views/wire');
    var BatteryView                        = require('views/battery');
    var CurrentIndicatorView               = require('views/current-indicator');

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
            this.updateMVT(options.mvt);

            this.listenTo(this.model, 'change:batteryConnected', this.batteryConnectedStateChanged);
        },

        initGraphics: function() {
            this.components = new PIXI.DisplayObjectContainer();
            this.displayObject.addChild(this.components);

            this.addBattery();
            this.addCapacitors();
            this.addWires();

            this.initCurrentIndicators();
        },

        initCurrentIndicators: function() {
            this.topCurrentIndicatorView = new CurrentIndicatorView({ 
                model: this.model, 
                mvt: this.mvt 
            });

            this.bottomCurrentIndicatorView = new CurrentIndicatorView({ 
                model: this.model, 
                mvt: this.mvt,
                positivePointsRight: true
            });

            this.topWire = this.model.wires.first();
            this.bottomWire = this.model.wires.last();

            this.displayObject.addChild(this.topCurrentIndicatorView.displayObject);
            this.displayObject.addChild(this.bottomCurrentIndicatorView.displayObject);
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

                capacitorView = this.createCapacitorView(options);

                this.capacitorViews.push(capacitorView);
            }
        },

        createCapacitorView: function(options) {
            return new CapacitanceControlledCapacitorView(options);
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

            this.sortedViews = views;
        },

        removeComponentViews: function() {
            var views = this.getAllComponentViews();

            for (var i = views.length - 1; i >= 0; i--) {
                views[i].removeFrom(this.components);
                views.splice(i, 1);
            }
        },

        updateCurrentIndicatorPositions: function() {
            var battery = this.model.battery;
            var capacitors = this.model.capacitors;
            var x, y;

            x = this.mvt.modelToViewX(battery.getX() + (capacitors.first().getX() - battery.getX()) / 2);
            y = this.mvt.modelToViewY(this.topWire.getMinY());
            this.topCurrentIndicatorView.setPosition(x, y);

            y = this.mvt.modelToViewY(this.bottomWire.getMaxY());
            this.bottomCurrentIndicatorView.setPosition(x, y);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.sortComponents();
            this.updateCurrentIndicatorPositions();
        },

        update: function(time, deltaTime) {
            this.topCurrentIndicatorView.update(time, deltaTime);
            this.bottomCurrentIndicatorView.update(time, deltaTime);
        },

        batteryConnectedStateChanged: function(circuit, batteryConnected) {
            if (batteryConnected) {
                this.showWires();
                this.plateChargePanel.visible = false;
                this.topCurrentIndicatorView.show();
                this.bottomCurrentIndicatorView.show();
            }
            else {
                this.hideWires();
                this.plateChargeSlider.val(circuit.capacitors.first().get('disconnectedPlateCharge'));
                this.plateChargePanel.visible = true;
                this.topCurrentIndicatorView.hide();
                this.bottomCurrentIndicatorView.hide();
            }
        },

        /**
         * Returns the view of the circuit component that intersects with the
         *   given polygon or point in view space.
         */
        getIntersectingComponentView: function(polygon) {
            var views = this.sortedViews;

            for (var i = views.length - 1; i >= 0; i--) {
                if (views[i].intersects(polygon))
                    return views[i];
            }
            
            return null;
        },

        /**
         * 
         */
        getIntersectingCapacitorView: function(point) {
            var views = this.sortedViews;

            for (var i = views.length - 1; i >= 0; i--) {
                if (views[i] instanceof CapacitorView && views[i].pointIntersects(point))
                    return views[i];
            }
            
            return null;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        showWires: function() {
            for (var i = 0; i < this.wireViews.length; i++)
                this.wireViews[i].show();
        },

        hideWires: function() {
            for (var i = 0; i < this.wireViews.length; i++)
                this.wireViews[i].hide();
        },

        showPlateCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].showPlateCharges();
        },

        hidePlateCharges: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].hidePlateCharges();
        },

        showEFieldLines: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].showEFieldLines();
        },

        hideEFieldLines: function() {
            for (var i = 0; i < this.capacitorViews.length; i++)
                this.capacitorViews[i].hideEFieldLines();
        }

    });

    return CircuitView;
});