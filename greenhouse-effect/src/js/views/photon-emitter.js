define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents an atom
     */
    var PhotonEmitterView = PixiView.extend({

        /**
         * Initializes the new PhotonEmitterView.
         */
        initialize: function(options) {
            this.initGraphics();

            this.updateMVT(options.mvt);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.sunlightEmitter = Assets.createSprite(Assets.Images.PHOTON_EMITTER_SUNLIGHT);
            this.infraredEmitter = Assets.createSprite(Assets.Images.PHOTON_EMITTER_INFRARED);

            this.sunlightEmitter.anchor.x = this.infraredEmitter.anchor.x = 1;
            this.sunlightEmitter.anchor.y = this.infraredEmitter.anchor.y = 0.5;

            this.displayObject.addChild(this.infraredEmitter);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var bounds = Constants.PhotonAbsorptionSimulation.CONTAINMENT_AREA_RECT;
            this.displayObject.x = this.mvt.modelToViewX(bounds.x + bounds.w * 0.05);
            this.displayObject.y = this.mvt.modelToViewY(0);

            var targetSpriteHeight = this.mvt.modelToViewDeltaX(bounds.h * 0.25); // In pixels
            var scale = targetSpriteHeight / this.displayObject.height;
            this.displayObject.scale.x = this.displayObject.scale.y = scale;

        }

    });

    return PhotonEmitterView;
});