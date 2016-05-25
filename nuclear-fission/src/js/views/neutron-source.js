define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    
    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var NeutronSourceView = PixiView.extend({

        events: {
            'touchstart .button': 'click',
            'mousedown  .button': 'click',

            'touchstart      .dragHandle': 'dragStart',
            'mousedown       .dragHandle': 'dragStart',
            'touchmove       .dragHandle': 'drag',
            'mousemove       .dragHandle': 'drag',
            'touchend        .dragHandle': 'dragEnd',
            'mouseup         .dragHandle': 'dragEnd',
            'touchendoutside .dragHandle': 'dragEnd',
            'mouseupoutside  .dragHandle': 'dragEnd'
        },

        /**
         * Initializes the new NeutronSourceView.
         */
        initialize: function(options) {
            options = _.extend({
                modelWidth: 26,
                cooldownTime: 1,
                rotationEnabled: true
            }, options);

            this.mvt = options.mvt;
            this.modelWidth = options.modelWidth;
            this.rotationEnabled = options.rotationEnabled;
            this.cooldownTime = options.cooldownTime;
            this.cooldownTimer = 0;

            this.initGraphics();

            // Cached objects
            this._dragOffset = new PIXI.Point();
            this._vec2 = new Vector2();
            this._pivotPoint = new Vector2();

            this.listenTo(this.model, 'change:firingAngle', this.updateRotation);
            this.listenTo(this.model, 'change:position',    this.updatePosition);

            this.updateRotation(this.model, this.model.get('firingAngle'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.pressedButtonTexture   = Assets.Texture(Assets.Images.FIRE_BUTTON_PRESSED);
            this.unpressedButtonTexture = Assets.Texture(Assets.Images.FIRE_BUTTON_UNPRESSED);

            this.button = new PIXI.Sprite(this.unpressedButtonTexture);
            this.button.buttonMode = true;
            this.button.defaultCursor = 'pointer';
            this.button.anchor.x = 0.5;
            this.button.anchor.y = 0.5;
            this.button.x = -104;
            this.button.scale.x = this.button.scale.y = 0.4;

            this.pivotPointOffset = new Vector2(-70, 0);

            this.dragHandle = new PIXI.Container();
            this.dragHandle.hitArea = new PIXI.Rectangle(-42, -16, 42, 32);
            this.dragHandle.buttonMode = true;
            this.dragHandle.defaultCursor = 'row-resize';

            if (!this.rotationEnabled)
                this.dragHandle.visible = false;

            this.gunSprite = Assets.createSprite(Assets.Images.NEUTRON_GUN);
            this.gunSprite.anchor.x = 1;
            this.gunSprite.anchor.y = (30 / 104);
            this.gunSprite.addChild(this.button);
            this.gunSprite.addChild(this.dragHandle);
            
            this.displayObject.addChild(this.gunSprite);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(this.modelWidth));
            var scale = targetWidth / this.gunSprite.texture.width;

            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
        },

        update: function(time, deltaTime) {
            if (this.cooldownTimer > 0) {
                this.cooldownTimer -= deltaTime;

                // Check to see if it has cooled down
                if (this.cooldownTimer <= 0) {
                    this.cooldownTimer = 0;
                    this.showUnpressedButtonTexture();
                }
            }
        },

        updateRotation: function(model, firingAngle) {
            this.gunSprite.rotation = firingAngle;
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        dragStart: function(event) {
            this.dragging = true;

            this._pivotPoint
                .set(this.pivotPointOffset)
                .rotate(this.model.get('firingAngle'))
                .add(this.displayObject.x, this.displayObject.y);
        },

        drag: function(event) {
            if (this.dragging) {
                var offset = this._vec2
                    .set(event.data.global.x, event.data.global.y)
                    .sub(this._pivotPoint);

                var angle = offset.angle();

                var viewPosition = offset
                    .normalize()
                    .scale(this.pivotPointOffset.length())
                    .add(this._pivotPoint);

                this.model.set('firingAngle', angle);
                this.model.setPosition(this.mvt.viewToModel(viewPosition));
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        click: function() {
            // Only fire it if it has cooled down
            if (this.cooldownTimer === 0) {
                this.cooldownTimer = this.cooldownTime;
                this.model.generateNeutron();
                this.showPressedButtonTexture();
            }
        },

        showPressedButtonTexture: function() {
            this.button.texture = this.pressedButtonTexture;
        },

        showUnpressedButtonTexture: function() {
            this.button.texture = this.unpressedButtonTexture;
        }

    }, Constants.NeutronSourceView);


    return NeutronSourceView;
});