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

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateSprite();
            this.updatePosition(this.model, this.model.get('position'));
        },

        updateSprite: function() {
            if (this.sprite)
                this.displayObject.removeChild(this.sprite);

            this.sprite = this.createSprite();

            this.displayObject.addChild(this.sprite);
        },

        createSprite: function() {},

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        }

    });


    return SubatomicParticleView;
});