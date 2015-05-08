define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');

    var Assets = require('assets');

    /*
     * Storing shared (static) textures in an object called
     *   Textures. We have to wait to call them, though,
     *   until after the assets have been loaded, so we wait
     *   until a new PhotonView is being initialized to see
     *   if we need to create the textures.
     */
    var Textures;
    var initTextures = function() {
        if (!Textures) {
            Textures = {
                SUNLIGHT: Assets.Texture(Assets.Images.PHOTON_SUNLIGHT),
                INFRARED: Assets.Texture(Assets.Images.PHOTON_INFRARED)
            };
        }
    };

    /**
     * A view that represents a photon
     */
    var PhotonView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function 
         *   make the displayObject a sprite right off the bat so
         *   we don't waste memory and processor time creating a
         *   container that we don't want.
         */
        initializeDisplayObject: function() {
            initTextures();

            if (this.model.get('wavelength') > 6E-7)
                this.displayObject = new PIXI.Sprite(Textures.INFRARED);
            else
                this.displayObject = new PIXI.Sprite(Textures.SUNLIGHT);

            this.displayObject.anchor.x = this.displayObject.anchor.y = 0.5;
        },

        /**
         * Initializes the new PhotonView.
         */
        initialize: function(options) {
            this.updateMVT(options.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition(this.model, this.model.get('position'));
        },

        /**
         * Updates the position of the sprite from the model.
         */
        updatePosition: function(photon, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        }

    });

    return PhotonView;
});