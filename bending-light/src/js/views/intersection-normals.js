define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
                    require('common/v3/pixi/dash-to');
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var Constants = require('constants');

    var IntersectionNormalsView = PixiView.extend({

        initialize: function(options) {
            this.simulation = options.simulation;

            this.lineLength = 80;

            this.initGraphics();

            // Cached objects
            this._point = new Vector2();
            this._offset   = new Vector2();
            this._dashStyle = [10, 6];

            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();

            this.displayObject.addChild(this.graphics);
        },

        draw: function() {
            var intersections = this.simulation.intersections;

            var graphics = this.graphics;
            graphics.clear();
            graphics.lineStyle(2, 0x333333, 1);

            var point = this._point;
            var offset = this._offset;
            var halfLength = this.lineLength / 2;
            var dashStyle = this._dashStyle;

            for (var i = 0; i < intersections.length; i++) {
                point.set(this.mvt.modelToView(intersections[i].point));
                offset.set(intersections[i].unitNormal).scale(halfLength);
                graphics.moveTo(point.x - offset.x, point.y - offset.y);
                graphics.dashTo(point.x + offset.x, point.y + offset.y, dashStyle);
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        },

        update: function() {
            this.draw();
        }

    });

    return IntersectionNormalsView;
});