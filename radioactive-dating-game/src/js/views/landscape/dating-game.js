define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var LandscapeView = require('radioactive-dating-game/views/landscape');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var DatingGameView = LandscapeView.extend({

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            LandscapeView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            LandscapeView.prototype.initGraphics.apply(this, arguments);

            // Left align this one so we always see the left edge
            this.background.anchor.x = 0;
            this.background.x = 0;
        },

        getBackgroundTexture: function() {
            return Assets.Texture(Assets.Images.DATING_GAME_BACKGROUND);
        },

        reset: function() {
            
        }

    });


    return DatingGameView;
});