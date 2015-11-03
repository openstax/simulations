define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var ElectronPathDescriptor = require('models/electron-path-descriptor');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var ElectronView = PixiView.extend({

        /**
         * Initializes the new ElectronView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:enabled',  this.updateVisibility);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.bgSprite = Assets.createSprite(Assets.Images.ELECTRON_BG);
            this.fgSprite = Assets.createSprite(Assets.Images.ELECTRON_FG);

            this.bgSprite.anchor.x = this.fgSprite.anchor.x = 0.5;
            this.bgSprite.anchor.y = this.fgSprite.anchor.y = 0.5;
            this.bgSprite.visible = false;

            this.displayObject.addChild(this.bgSprite);
            this.displayObject.addChild(this.fgSprite);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(ElectronView.MODEL_WIDTH);
            var scale = targetWidth / this.bgSprite.texture.width;
            this.bgSprite.scale.x = this.fgSprite.scale.x = scale;
            this.bgSprite.scale.y = this.fgSprite.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;

            this.update();
        },

        updateVisibility: function(model, enabled) {
            this.displayObject.visible = enabled;
        },

        /**
         * Updates the view to match the model.
         * Handles moving the electron from one segment of the coil to the next.
         * Changes the "look" of the electron as it moves between the foreground 
         * and background of the coil.
         */
        update: function() {
            this.displayObject.visible = this.model.get('enabled');
            if (this.displayObject.visible) {
                
                var descriptor = this.model.getPathDescriptor();
                    
                // Jump between foreground and background.
                var parent = descriptor.getParent();
                if (parent !== this.parent) {
                    // Change the parent.
                    if (this.parent)
                        this.parent.removeChild(this.displayObject);
                    
                    parent.addChild(this.displayObject);
                    this.parent = parent;
                    
                    // Change the image.
                    if (descriptor.getLayer() == ElectronPathDescriptor.BACKGROUND) {
                        this.bgSprite.visible = true;
                        this.fgSprite.visible = false;
                    }
                    else { 
                        this.fgSprite.visible = true;
                        this.bgSprite.visible = false;
                    }
                }
            }
        }

    }, Constants.ElectronView);


    return ElectronView;
});