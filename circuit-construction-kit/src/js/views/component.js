define(function(require) {

    'use strict';

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    /**
     * A view that represents a circuit component
     */
    var ComponentView = PixiView.extend({

        /**
         * Initializes the new ComponentView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this._position = new Vector2();

            this.initGraphics();
        },

        initGraphics: function() {
            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        setPosition: function(x, y) {
            var modelPosition = this.mvt.viewToModel(this._position.set(x, y));
            this.model.setPosition(modelPosition);
        }

    });

    return ComponentView;
});