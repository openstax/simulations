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
    var DielectricCapacitorView            = require('views/capacitor/dielectric');
    var WireView                           = require('views/wire');
    var BatteryView                        = require('views/battery');

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

            this.addBattery();
            this.addCapacitors();
            this.addWires();

            this.displayObject.addChild(this.components);
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