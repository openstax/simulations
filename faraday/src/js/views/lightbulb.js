define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var LightbulbView = PixiView.extend({

        /**
         * Initializes the new LightbulbView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.bulb = Assets.createSprite(Assets.Images.LIGHTBULB_BULB);
            this.cap  = Assets.createSprite(Assets.Images.LIGHTBULB_CAP);
            this.base = Assets.createSprite(Assets.Images.LIGHTBULB_BASE);

            this.base.anchor.x = 0.5;
            this.base.anchor.y = 1;
            this.cap.anchor.x = 0.5;
            this.cap.anchor.y = 1;
            this.cap.y = -(this.base.texture.height - LightbulbView.DISTANCE_BULB_IS_SCREWED_INTO_BASE);
            this.bulb.anchor.x = 0.5;
            this.bulb.anchor.y = 1;
            this.bulb.y = -(this.base.texture.height + this.cap.texture.height - LightbulbView.DISTANCE_BULB_IS_SCREWED_INTO_BASE);

            this.displayObject.addChild(this.bulb);
            this.displayObject.addChild(this.cap);
            this.displayObject.addChild(this.base);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(LightbulbView.BULB_RADIUS * 2);
            var scale = targetWidth / this.bulb.texture.width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        }

    }, Constants.LightbulbView);


    return LightbulbView;
});