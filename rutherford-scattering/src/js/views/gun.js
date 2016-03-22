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
            this.rayGun = Assets.createSprite(Assets.Images.RAY_GUN);
            this.rayGun.anchor.x = RayGunView.BARREL_CENTER_X;
            this.rayGun.anchor.y = RayGunView.BARREL_CENTER_Y;

            this.ray = new PIXI.Graphics();
            this.drawRay();

            this.rayTarget = new PIXI.Graphics();
            this.rayCap = new PIXI.Graphics();
            this.drawRayTargetCap();

            this.triggerButton = Assets.createSprite(this.getTrigger());
            this.triggerButton.buttonMode = true;
            this.triggerButton.defaultCursor = 'pointer';
            this.triggerButton.anchor.x = 0.5;
            this.triggerButton.anchor.y = 0;

            this.displayObject.addChild(this.ray);
            this.displayObject.addChild(this.rayTarget);
            this.displayObject.addChild(this.rayCap);
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

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(RayGunView.WIDTH));
            var scale = targetWidth / this.rayGun.texture.width;

            this.ray.scale.x = scale;
            this.ray.scale.y = scale;

            this.rayTarget.scale.x = scale;
            this.rayTarget.scale.y = scale;
            this.rayCap.scale.x = scale;
            this.rayCap.scale.y = scale;

            this.rayGun.scale.x = scale;
            this.rayGun.scale.y = scale;

            this.triggerButton.scale.x = scale;
            this.triggerButton.scale.y = scale;

            this.displayObject.x = Math.floor(this.mvt.modelToViewX(center.x));
            this.displayObject.y = Math.floor(this.mvt.modelToViewY(center.y));

            this.update();
        },

        update: function() {
            this.updateTrigger();
        },

        drawRay: function() {
            this.rayWidth = RayGunView.RAY_WIDTH * this.rayGun.texture.width;
            this.rayHeight = RayGunView.RAY_HEIGHT * this.rayGun.texture.height;

            this.ray.beginFill(Colors.parseHex('FFF'), 0.25);
            this.ray.drawRect(-0.5 * this.rayWidth, -1 * this.rayHeight - 0.5 * this.rayGun.texture.height, this.rayWidth, this.rayHeight);
            this.ray.endFill();
        },

        drawRayTargetCap: function() {
            this.rayTargetWidth = 1.4 * this.rayWidth;
            this.rayTargetHeight = 18;
            this.rayTargetTop = -1 * this.rayHeight - 0.5 * this.rayGun.texture.height;
            this.rayTargetLeft = -0.5 * this.rayTargetWidth;
            this.rayTargetRight = 0.5 * this.rayTargetWidth;

            this.rayTarget.beginFill(Colors.parseHex('3E5FFF'), 1);
            this.rayTarget.drawRect(this.rayTargetLeft, this.rayTargetTop, this.rayTargetWidth, this.rayTargetHeight);
            this.rayTarget.endFill();

            this.rayCapHeight = 12;
            this.rayCap.beginFill(Colors.parseHex('3E5FFF'), 0.5);
            this.rayCap.moveTo(this.rayTargetLeft, this.rayTargetTop);
            this.rayCap.lineTo(-0.4 * this.rayTargetWidth, this.rayTargetTop - this.rayCapHeight);
            this.rayCap.lineTo(0.4 * this.rayTargetWidth, this.rayTargetTop - this.rayCapHeight);
            this.rayCap.lineTo(this.rayTargetRight, this.rayTargetTop);
            this.rayCap.endFill();
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
            this.ray.visible = this.model.get('on');
        }

    }, Constants.RayGunView);


    return RayGunView;
});