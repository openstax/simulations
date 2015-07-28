define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    var SAT  = require('sat');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');
    var Vector3  = require('common/math/vector3');

    var BatteryToCapacitorsTopWire    = require('models/wire/battery-to-capacitors-top');
    var BatteryToCapacitorsBottomWire = require('models/wire/battery-to-capacitors-bottom');

    var Constants = require('constants');

    /**
     * A view that represents a wire, which consists of one or more wire segments.
     */
    var WireView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new WireView.
         */
        initialize: function(options) {
            this.color = Colors.parseHex('#444');

            // Cached objects
            this._modelStartVec = new Vector3();
            this._modelEndVec   = new Vector3();
            this._viewStartVec  = new Vector2();
            this._viewEndVec    = new Vector2();
            this._directionVec  = new Vector2();
            this._testBox       = new SAT.Box();

            this.listenTo(this.model, 'change:position', this.drawWire);
            this.listenTo(this.model.segments, 'change', this.drawWire);

            this.updateMVT(options.mvt);
        },

        /**
         * Draws the wire
         */
        drawWire: function() {
            var thickness = this.getWireThickness();

            var graphics = this.displayObject;
            graphics.clear();

            var viewStart;
            var viewEnd;
            
            var segment;
            for (var i = 0; i < this.model.segments.length; i++) {
                segment = this.model.segments.at(i);

                viewStart = this.getSegmentStart(segment);
                viewEnd   = this.getSegmentEnd(segment);

                graphics.lineStyle(thickness, this.color, 1);
                graphics.moveTo(viewStart.x, viewStart.y);
                graphics.lineTo(viewEnd.x, viewEnd.y);

                graphics.lineStyle(0, 0, 0);
                graphics.beginFill(this.color, 1);
                graphics.drawCircle(viewStart.x, viewStart.y, thickness / 2);
                graphics.drawCircle(viewEnd.x, viewEnd.y, thickness / 2);
                graphics.endFill();
            }
        },

        getWireThickness: function() {
            return Math.round(this.mvt.modelToViewDeltaX(this.model.get('thickness')) / 2) * 2;
        },

        getSegmentStart: function(segment) {
            this._modelStartVec.set(segment.get('startX'), segment.get('startY'), 0);
            this._viewStartVec.set(this.mvt.modelToView(this._modelStartVec));
            this._viewStartVec.x = Math.round(this._viewStartVec.x);
            this._viewStartVec.y = Math.round(this._viewStartVec.y);
            return this._viewStartVec;
        },

        getSegmentEnd: function(segment) {
            this._modelEndVec.set(segment.get('endX'), segment.get('endY'), 0);
            this._viewEndVec.set(this.mvt.modelToView(this._modelEndVec));
            this._viewEndVec.x = Math.round(this._viewEndVec.x);
            this._viewEndVec.y = Math.round(this._viewEndVec.y);
            return this._viewEndVec;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawWire();
        },

        /**
         * Returns whether or not the given polygon intersects this view.
         */
        intersectsPolygon: function(polygon) {
            var thickness = this.getWireThickness();
            var halfThickness = thickness / 2;
            var box = this._testBox;
            var segment;
            var viewStart;
            var viewEnd;
            var swap;
            var direction = this._directionVec;

            // Loop through the segments and see if it intersects any of them
            for (var i = 0; i < this.model.segments.length; i++) {
                segment = this.model.segments.at(i);

                viewStart = this.getSegmentStart(segment);
                viewEnd   = this.getSegmentEnd(segment);

                if (viewStart.x > viewEnd.x || viewStart.y > viewEnd.y) {
                    swap = viewStart;
                    viewStart = viewEnd;
                    viewEnd = swap;
                }

                // Get vector from start to end
                direction.set(viewEnd).sub(viewStart);

                // We're assuming a wire is always at right angles to simplify
                box.pos.x = viewStart.x - halfThickness;
                box.pos.y = viewStart.y - halfThickness;
                box.w = direction.x + thickness;
                box.h = direction.y + thickness;

                if (SAT.testPolygonPolygon(polygon, box.toPolygon()))
                    return true;
            }

            return false;
        },

        /**
         * Returns the y-value that should be used for sorting. Calculates the
         *   average y for all segment endpoints.
         */
        getYSortValue: function() {
            var y;
            
            if (this.model instanceof BatteryToCapacitorsTopWire)
                y = this.model.getMinY();
            else if (this.model instanceof BatteryToCapacitorsBottomWire)
                y = this.model.getMaxY();
            else
                y = this.model.getAverageY();

            return this.mvt.modelToViewY(y);
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });

    return WireView;
});