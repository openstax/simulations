define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * Represents any generic datable item
     */
    var DatableItemView = PixiView.extend({

        /**
         * Initializes the new DatableItemView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:width',    this.updateScale);
            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:rotation', this.updateRotation);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.sprite = Assets.createSprite(this.model.get('image'));
            this.sprite.anchor.x = this.sprite.anchor.y = 0.5;

            this.displayObject.addChild(this.sprite);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateScale();
            this.updatePosition(this.model, this.model.get('position'));
            this.updateRotation(this.model, this.model.get('rotation'));
        },

        updateScale: function() {
            var targetWidth = this.mvt.modelToViewDeltaX(this.model.get('width'));
            var scale = targetWidth / this.sprite.texture.width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            var heightWidthRatio = this.sprite.texture.height / this.sprite.texture.width;
            this.model.set('height', this.model.get('width') * heightWidthRatio);
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateRotation: function(model, rotation) {
            this.displayObject.rotation = rotation
        },

        getBounds: function() {
            return this.sprite.getBounds();
        },

        getPosition: function() {
            return this.displayObject.position;
        }

    });

    return DatableItemView;
});