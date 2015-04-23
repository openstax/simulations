define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Assets    = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents a heavenly body.
     */
    var BodyView = PixiView.extend({

        /**
         * Percentage of the texture width that actually contains
         *   the body (where the leftover is transparency and glow).
         */
        textureBodyWidthRatio: 1,

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
            
            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:mass',     this.updateMass);
            this.listenTo(this.model, 'change:radius',   this.updateRadius);
        },

        initGraphics: function() {
            this.bodyContainer = new PIXI.DisplayObjectContainer();

            this.body = Assets.createSprite(Assets.ImageFromModel(this.model));
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 0.5;
            this.bodyContainer.addChild(this.body);

            this.displayObject.addChild(this.bodyContainer);

            this.displayObject.position.x = 480;
            this.displayObject.position.y = 300;

            this.updateMVT(this.mvt);
        },

        updatePosition: function(body, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateMass: function(body, mass) {},

        updateRadius: function(body, radius) {
            this.bodyContainer.scale.x = this.bodyContainer.scale.y = this.getBodyScale(radius);
        },

        update: function(time, delta) {
            
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateRadius(this.model, this.model.get('radius'));
            this.updatePosition(this.model, this.model.get('position'));
        },

        getBodyScale: function(radius) {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(radius * 2); // In pixels
            return (targetSpriteWidth / this.body.width) / this.textureBodyWidthRatio;
        }

    }, Constants.BodyView);

    return BodyView;
});