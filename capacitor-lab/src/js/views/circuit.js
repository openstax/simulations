define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

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

            // Arrays for views
            this.batteryViews = [];
            this.capacitorViews = [];
            this.wireViews = [];

            // Cached objects

            // Initialize graphics
            this.initGraphics();
        },

        initGraphics: function() {
            this.components = new PIXI.DisplayObjectContainer();

            this.addBattery();
            this.addCapacitors();
            this.addWires();

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
                if (this.dielectric) {
                    capacitorView = new DielectricCapacitorView({
                        model: capacitors.at(i),
                        mvt: this.mvt
                    });
                }
                else {
                    capacitorView = new CapacitorView({
                        model: capacitors.at(i),
                        mvt: this.mvt
                    });
                }
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
        }

    });

    return CircuitView;
});