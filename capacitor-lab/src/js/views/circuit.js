define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var CapacitorView = require('views/capacitor');

    var Constants = require('constants');

    /**
     * 
     */
    var CircuitView = PixiView.extend({

        initialize: function(options) {
            // Arrays for views
            this.batteryViews = [];
            this.capacitorViews = [];
            this.wireSegmentViews = [];

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

        },

        addCapacitors: function() {
            var capacitors = this.model.capacitors;
            for (var i = 0; i < capacitors.length; i++) {
                var capacitorView = new CapacitorView({
                    model: capacitors.at(i),
                    mvt: this.mvt
                });
            }
        },

        /**
         * Creates the wire segments, sorting them by their y-value and inserting
         *   them in and around the capacitors and battery so they render in the
         *   right order.
         */
        addWires: function() {

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

            this.detachComponentViews();
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

        detachComponentViews: function() {
            this.components.removeChildren();
            // var views = this.getAllComponentViews();

            // for (var i = views.length - 1; i >= 0; i--)
            //     this.components.removeChild(views[i].displayObject);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
        }

    });

    return CircuitView;
});