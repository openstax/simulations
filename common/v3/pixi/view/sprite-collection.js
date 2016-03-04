define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var PixiView = require('../view');

    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    /**
     * A view that renders sprites from a Backbone collection or array of models.
     *   The models must have a "position" attribute that is an object with x and
     *   y values.  To keep the sprites up to date, call update().
     */
    var SpriteCollectionView = PixiView.extend({

        /**
         * Initializes the new SpriteCollectionView.
         */
        initialize: function(options) {
            this.models = (options.collection instanceof Backbone.Collection) ? 
                options.collection.models : 
                options.collection;

            this.texture = this.getTexture();
            this.sprites = [];

            this.updateMVT(options.mvt);
        },

        /**
         * Returns texture used for sprites.  Override in child classes.
         */
        getTexture: function() {
            return PIXI.Texture.EMPTY;
        },

        /**
         * Calculates current scale for sprites.  Override in child classes.
         */
        getSpriteScale: function() {
            return 1;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.spriteScale = this.getSpriteScale();

            this.update();
        },

        update: function() {
            if (!this.displayObject.visible)
                return;

            var mvt = this.mvt;
            var sprites = this.sprites;
            var models = this.models;

            for (var i = 0; i < models.length; i++) {
                if (i === sprites.length)
                    this.createSprite();

                this.updateSprite(sprites[i], models[i]);
            }

            if (sprites.length > models.length) {
                for (var i = models.length; i < sprites.length; i++)
                    sprites[i].visible = false;
            }
        },

        updateSprite: function(sprite, model) {
            var pos = model.get('position');
            var x = mvt.modelToViewX(pos.x);
            var y = mvt.modelToViewY(pos.y);
            sprite.visible = true;
            sprite.x = x;
            sprite.y = y;
            sprite.scale.x = this.spriteScale;
            sprite.scale.y = this.spriteScale;
        },

        createSprite: function() {
            var sprite = new PIXI.Sprite(this.texture);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            this.sprites.push(sprite);
            this.displayObject.addChild(sprite);
            return sprite;
        },

        show: function() {
            this.update();
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        visible: function() {
            return this.displayObject.visible;
        }

    });

    return SpriteCollectionView;
});