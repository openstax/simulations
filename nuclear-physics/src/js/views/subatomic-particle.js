define(function(require) {

    'use strict';

    var PixiView = require('common/v3/pixi/view');

    /**
     * 
     */
    var SubatomicParticleView = PixiView.extend({

        /**
         * Initializes the new SubatomicParticleView.
         */
        initialize: function(options) {
            this.updateMVT(options.mvt);
        },

        update: function(time, deltaTime, paused) {
            this.updatePosition();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateSprite();
            this.updatePosition();
        },

        updateSprite: function() {
            if (this.sprite)
                this.displayObject.removeChild(this.sprite);

            this.sprite = this.createSprite();

            this.displayObject.addChild(this.sprite);
        },

        createSprite: function() {},

        updatePosition: function() {
            var viewPosition = this.mvt.modelToView(this.model.get('position'));
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        }

    });


    return SubatomicParticleView;
});