define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Assets = require('assets');
    var Constants = require('constants');
    // var STICK_COLOR = Colors.parseHex(Constants.RayGunView.STICK_COLOR);

    /**
     * A view that represents an electron
     */
    var RayGunView = PixiView.extend({

        events: {
            'touchstart      .triggerButton': 'toggle',
            'mousedown       .triggerButton': 'toggle'
        },

        /**
         * Initializes the new RayGunView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initTriggers();
            this.initGraphics();

            this.listenTo(this.model, 'change:on', this.updateTrigger);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            // this.ray = new PIXI.Graphics();

            this.rayGun = Assets.createSprite(Assets.Images.RAY_GUN);
            this.rayGun.anchor.x = 0.5;
            this.rayGun.anchor.y = 0.5;

            this.triggerButton = Assets.createSprite(this.getTrigger());
            this.triggerButton.buttonMode = true;
            this.triggerButton.defaultCursor = 'pointer';
            this.triggerButton.anchor.x = 0.5;
            this.triggerButton.anchor.y = 0.5;

            // this.displayObject.addChild(this.ray);
            this.displayObject.addChild(this.rayGun);
            this.displayObject.addChild(this.triggerButton);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            var center = this.model.get('center');
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(20));
            var scale = targetWidth / this.rayGun.texture.width;

            this.rayGun.scale.x = scale;
            this.rayGun.scale.y = scale;

            this.triggerButton.scale.x = scale;
            this.triggerButton.scale.y = scale;
            // offset trigger from center
            this.triggerButton.x = -20 * scale;
            this.triggerButton.y = 20 * scale;

            this.displayObject.x = Math.floor(this.mvt.modelToViewX(center.x));
            this.displayObject.y = Math.floor(this.mvt.modelToViewY(center.y));

            this.update();
        },

        update: function(){
            this.updateTrigger();
        },

        toggle: function() {
            this.model.set('on', !this.model.get('on'));
        },

        initTriggers: function() {
            this.triggers = {};
            this.triggers.on = Assets.Images.GUN_ON_BUTTON;
            this.triggers.off = Assets.Images.GUN_OFF_BUTTON;
        },

        getTrigger: function() {
            if(this.model.get('on')){
                return this.triggers.on;
            } else {
                return this.triggers.off;
            }
        },

        updateTrigger: function() {
            this.triggerButton.texture = Assets.Texture(this.getTrigger());
        }

    }, {});


    return RayGunView;
});