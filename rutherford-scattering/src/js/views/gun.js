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
            'touchstart .triggerButton': 'toggle',
            'mousedown  .triggerButton': 'toggle'
        },

        /**
         * Initializes the new RayGunView.
         */
        initialize: function(options) {
            options = _.extend({
                color: '#fff',
                alpha: 0.25,
                targetColor: '#3e5fff',
                squareTarget: false
            }, options);

            this.mvt = options.mvt;
            this.color = Colors.parseHex(options.color);
            this.alpha = options.alpha;
            this.targetColor = Colors.parseHex(options.targetColor);
            this.squareTarget = options.squareTarget;

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

            this.rayCap = new PIXI.Container();
            this.drawRayCap();

            this.triggerButton = Assets.createSprite(this.getTrigger());
            this.triggerButton.buttonMode = true;
            this.triggerButton.defaultCursor = 'pointer';
            this.triggerButton.anchor.x = 0.5;
            this.triggerButton.anchor.y = 0;

            this.displayObject.addChild(this.ray);
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
            var center = this.model.get('center') ? this.model.get('center') : this.model.get('position');
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(RayGunView.WIDTH));
            var scale = targetWidth / this.rayGun.texture.width;

            this.ray.scale.x = scale;
            this.ray.scale.y = scale;

            this.rayCap.scale.x = scale;
            this.rayCap.scale.y = scale;
            this.rayCap.y = - this.rayHeight - this.rayTargetHeight / 2;

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

        setColor: function(hexString) {
            this.color = Colors.parseHex(hexString);
            this.drawRay();
        },

        drawRay: function() {
            this.rayWidth = RayGunView.RAY_WIDTH * this.rayGun.texture.width;
            this.rayHeight = RayGunView.RAY_HEIGHT * this.rayGun.texture.height;

            this.ray.clear();
            this.ray.beginFill(this.color, this.alpha);
            this.ray.drawRect(-0.5 * this.rayWidth, -1 * this.rayHeight - 0.5 * this.rayGun.texture.height, this.rayWidth, this.rayHeight);
            this.ray.endFill();
        },

        drawRayCap: function() {
            this.rayTarget = new PIXI.Graphics();
            this.rayTargetCap = new PIXI.Graphics();
            this.rayView = new PIXI.Graphics();

            this.rayTargetWidth = 1.4 * this.rayWidth;
            this.rayTargetLeft = -0.5 * this.rayTargetWidth;
            this.rayTargetRight = 0.5 * this.rayTargetWidth;
            this.rayTargetHeight = (this.squareTarget) ? this.rayTargetWidth : 18;

            this.rayTarget.beginFill(this.targetColor, 1);
            this.rayTarget.drawRect(this.rayTargetLeft, 0, this.rayTargetWidth, this.rayTargetHeight);
            this.rayTarget.endFill();

            var rayTargetCapHeight = 12;
            this.rayTargetCap.beginFill(this.targetColor, 0.5);
            this.rayTargetCap.moveTo(this.rayTargetLeft, 0);
            this.rayTargetCap.lineTo(-0.4 * this.rayTargetWidth, -rayTargetCapHeight);
            this.rayTargetCap.lineTo( 0.4 * this.rayTargetWidth, -rayTargetCapHeight);
            this.rayTargetCap.lineTo(this.rayTargetRight, 0);
            this.rayTargetCap.endFill();

            this.rayViewWidth = 0.2 * this.rayWidth;
            this.rayViewHeight = this.rayViewWidth;
            this.rayViewLeft = this.rayTargetRight - 3 * this.rayViewWidth;
            this.rayViewTop = (this.rayTargetHeight - this.rayViewHeight) / 2;

            this.rayView.beginFill(Colors.parseHex('#131d35'), 1);
            this.rayView.lineStyle(1, 0xFFFFFF, 1);
            this.rayView.drawRect(this.rayViewLeft, this.rayViewTop, this.rayViewWidth, this.rayViewHeight);
            this.rayView.endFill();

            this.rayCap.addChild(this.rayTarget);
            this.rayCap.addChild(this.rayTargetCap);
            this.rayCap.addChild(this.rayView);
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
        },

        getRayViewTop: function() {
            return this.displayObject.y + this.rayCap.y + this.rayViewTop * this.rayCap.scale.y;
        },

        getRayViewBottom: function() {
            return this.displayObject.y + this.rayCap.y + (this.rayViewTop + this.rayViewHeight) * this.rayCap.scale.y;
        },

        getRayViewLeft: function() {
            return this.displayObject.x + this.rayCap.x + this.rayViewLeft * this.rayCap.scale.x;
        }

    }, Constants.RayGunView);


    return RayGunView;
});