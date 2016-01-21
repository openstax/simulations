define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');
    var COLOR = Colors.parseHex(Constants.ElectronsView.COLOR);

    var Assets = require('assets');

    /**
     * A view that represents a circuit
     */
    var ElectronsView = PixiView.extend({

        /**
         * Initializes the new ElectronsView.
         */
        initialize: function(options) {
            this.electronSet = options.electronSet;

            this.texture = Assets.Texture(Assets.Images.ELECTRON);
            this.sprites = [];

            this.updateMVT(options.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(ElectronsView.RADIUS * 2);
            this.spriteScale = targetWidth / this.texture.width;

            this.update();
        },

        update: function() {
            if (!this.displayObject.visible)
                return;

            var mvt = this.mvt;
            var sprites = this.sprites;
            var electrons = this.electronSet.particles.models;
            for (var i = 0; i < electrons.length; i++) {
                var pos = electrons[i].get('position');
                var x = mvt.modelToViewX(pos.x);
                var y = mvt.modelToViewY(pos.y);

                if (i === sprites.length)
                    this.createSprite();

                sprites[i].visible = true;
                sprites[i].x = x;
                sprites[i].y = y;
                sprites[i].scale.x = this.spriteScale;
                sprites[i].scale.y = this.spriteScale;
            }

            if (sprites.length > electrons.length) {
                for (var i = electrons.length; i < sprites.length; i++)
                    sprites[i].visible = false;
            }
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

    }, Constants.ElectronsView);

    return ElectronsView;
});