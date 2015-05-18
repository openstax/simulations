define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');
    var FILL_COLOR = Colors.parseHex(Constants.GlassPaneView.FILL_COLOR);
    var FILL_ALPHA = Constants.GlassPaneView.FILL_ALPHA;

    /**
     * A view that represents a photon
     */
    var GlassPaneView = PixiView.extend({

        /**
         * Initializes the new GlassPaneView.
         */
        initialize: function(options) {
            this.initGraphics();
            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.glassPane = new PIXI.Graphics();
            this.displayObject.addChild(this.glassPane);
        },

        drawGlassPane: function() {
            var bounds = this.model.get('bounds');
            var viewRect = this.mvt.modelToView(bounds);

            this.glassPane.beginFill(FILL_COLOR, FILL_ALPHA);
            this.glassPane.drawRect(
                viewRect.x,
                viewRect.y,
                viewRect.w,
                viewRect.h
            );
            this.glassPane.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawGlassPane();
        }

    });

    return GlassPaneView;
});