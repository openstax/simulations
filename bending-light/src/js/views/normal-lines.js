define(function(require) {

    'use strict';

    var PIXI = require('pixi');
               require('common/pixi/dash-to');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var Constants = require('constants');

    var NormalLinesView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.simulation = options.simulation;

            this._dashStyle = [ 10, 10 ];

            this.updateMVT(options.mvt);
        },

        draw: function() {
            var graphics = this.displayObject;
            graphics.clear();
            graphics.moveTo(0, 0);
            graphics.dashTo(200, 200, this._dashStyle);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        }

    });

    return NormalLinesView;
});