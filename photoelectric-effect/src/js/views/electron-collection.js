define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var SpriteCollectionView = require('common/v3/pixi/view/sprite-collection');

    var Assets = require('assets');

    /**
     * A view that renders electron sprites for every electron in the sim
     */
    var ElectronCollectionView = SpriteCollectionView.extend({

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            return Assets.Texture(Assets.Images.ELECTRON);
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            return 1;
        }

    });

    return ElectronCollectionView;
});