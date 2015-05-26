define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');

    var Constants = require('constants');

    /**
     * A view that represents a cloud
     */
    var CloudView = PixiView.extend({

        /**
         * Initializes the new CloudView.
         */
        initialize: function(options) {
            this.initGraphics();
            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.cloud = new PIXI.Graphics();
            this.displayObject.addChild(this.cloud);
        },

        drawCloud: function() {
            var bounds = this.mvt.modelToView(this.model.get('bounds'));
            bounds.h = Math.abs(bounds.h);
            bounds.y = bounds.y - bounds.h;

            this.cloud.beginFill(0xFFFFFF, 1);

            for (var i = 0; i < 8; i++) {
                var height = Math.max( Math.random() * bounds.h, bounds.h / 4 );
                var width = Math.max( Math.random() * ( bounds.w / 3 ), height * 8 );
                var dx = Math.random() * ( bounds.w / 3 ) * ( Math.random() < 0.5 ? 1 : -1 );
                var x = bounds.x + bounds.w / 2 + dx;
                var y = bounds.y + ( Math.random() < 0.5 ? 1 : 0 ) * bounds.h - height / 2;
                this.cloud.drawEllipse(x, y, width, height);
            }
            this.cloud.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawCloud();
        }

    });

    return CloudView;
});