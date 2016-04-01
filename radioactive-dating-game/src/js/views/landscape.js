define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView  = require('common/v3/app/app');
    var PixiView = require('common/v3/pixi/view');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var LandscapeView = PixiView.extend({

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.width = options.width;
            this.height = options.height;

            // This is a hybrid PIXI/HTML view
            this.el = document.createElement('div');
            this.$el = $(this.el);

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.background = new PIXI.Sprite(this.getBackgroundTexture());
            this.background.anchor.y = 1;
            this.background.anchor.x = 0.5;
            this.background.y = this.height;
            this.background.x = this.width / 2;
            
            this.displayObject.addChild(this.background);

            this.updateMVT(this.mvt);
        },

        getBackgroundTexture: function() {
            return PIXI.Texture.EMPTY;
        },

        renderElement: function() {
            return this;
        },

        update: function(time, deltaTime, paused) {},

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBackgroundScale();
        },

        updateBackgroundScale: function() {
            var targetSceneWidth = AppView.windowIsShort() ? this.width : 1500; // In pixels
            var scale = targetSceneWidth / this.background.width;
            this.background.scale.x = scale;
            this.background.scale.y = scale;
        },

        show: function() {
            PixiView.prototype.show.apply(this, arguments);
            this.$el.show();
        },

        hide: function() {
            PixiView.prototype.hide.apply(this, arguments);
            this.$el.hide();
        }

    });


    return LandscapeView;
});