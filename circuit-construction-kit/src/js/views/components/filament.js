define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that represents a light-bulb filament
     */
    var FilamentView = PixiView.extend({

        /**
         * Overrides Draggable's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new FilamentView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.updateMVT(this.mvt);

            this.listenTo(this.model, 'recomputed', this.draw);
        },

        draw: function() {
            var graphics = this.displayObject;
            graphics.clear();
            graphics.lineStyle(4, this.getColor(), 1);

            var segments = this.model.segments;
            if (segments.length) {
                var start = this.mvt.modelToView(segments[0].start);
                graphics.moveTo(start.x, start.y);

                for (var i = 0; i < segments.length; i++) {
                    var end = this.mvt.modelToView(segments[i].end);
                    graphics.lineTo(end.x, end.y);
                }

                if (graphics.currentPath && graphics.currentPath.shape)
                    graphics.currentPath.shape.closed = false;
            }
        },

        getColor: function() {
            return 0x555555;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
            this.draw();
        }

    });

    return FilamentView;
});