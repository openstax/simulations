define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var MediumView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.updateMVT(options.mvt);

            this.listenTo(this.model, 'change:color', this.draw)
        },

        draw: function() {
            var rect = this.mvt.modelToView(this.model.get('shape'));
            rect.h = Math.abs(rect.h);
            rect.y -= rect.h;

            var color = this.model.get('color');

            var graphics = this.displayObject;
            graphics.clear();
            graphics.beginFill(Colors.rgbToHexInteger(color.r, color.g, color.b), 1);
            graphics.drawRect(rect.x, rect.y, rect.w, rect.h);
            graphics.endFill();
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

    return MediumView;
});