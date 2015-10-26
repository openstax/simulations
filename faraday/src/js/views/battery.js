define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var BatteryView = PixiView.extend({

        /**
         * Initializes the new BatteryView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // var targetWidth = this.mvt.modelToViewDeltaX(BatteryView.BULB_RADIUS * 2);
            // var scale = targetWidth / this.bulb.texture.width;
            // this.displayObject.scale.x = scale;
            // this.displayObject.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
            this.update();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        /**
         * 
         */
        update: function() {
            
        }

    }, Constants.BatteryView);


    return BatteryView;
});