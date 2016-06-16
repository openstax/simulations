define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var HybridView = require('common/v3/pixi/view/hybrid');
    var ArrowView  = require('common/v3/pixi/view/arrow');

    var LadybugMover = require('models/ladybug-mover');

    var Assets = require('assets');

    var Constants = require('constants');
    var UpdateMode = Constants.UpdateMode;

    /**
     * A view that represents the player particle
     */
    var LadybugView = HybridView.extend({

        events: {
            'touchstart      .ladybug': 'dragStart',
            'mousedown       .ladybug': 'dragStart',
            'touchmove       .ladybug': 'drag',
            'mousemove       .ladybug': 'drag',
            'touchend        .ladybug': 'dragEnd',
            'mouseup         .ladybug': 'dragEnd',
            'touchendoutside .ladybug': 'dragEnd',
            'mouseupoutside  .ladybug': 'dragEnd',
        },

        tagName: 'button',
        className: 'btn btn-secondary return-ladybug-btn',

        htmlEvents: {
            'click': 'returnButtonClicked'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            // Object caches
            this._dragOffset = new PIXI.Point();
            this._dragLocation = new PIXI.Point();

            this.initGraphics();

            this.ladybug.buttonMode = true;
            this.ladybug.cursor = 'pointer';

            this.listenTo(this.model, 'change:position',     this.updatePosition);
            this.listenTo(this.model, 'change:velocity',     this.velocityChanged);
            this.listenTo(this.model, 'change:acceleration', this.accelerationChanged);
            this.listenTo(this.model, 'change:angle',        this.angleChanged);

            this.$el.html('Return Ladybug');
            this.$el.hide();
            this.returnButtonHidden = true;
        },

        initGraphics: function() {
            this.initArrows();
            this.initSprites();

            this.updateMVT(this.mvt);
            this.angleChanged(this.model, this.model.get('angle'));
        },

        initSprites: function() {
            var ladybug = Assets.createSprite(Assets.Images.LADYBUG);
            ladybug.anchor.x = 0.5;
            ladybug.anchor.y = 0.5;
            this.ladybugSprite = ladybug;

            var ladybugOpenWings = Assets.createSprite(Assets.Images.LADYBUG_OPEN_WINGS);
            ladybugOpenWings.anchor.x = 0.5;
            ladybugOpenWings.anchor.y = 0.5;

            this.ladybug = new PIXI.Container();
            this.idleWings = new PIXI.Container();
            this.openWings = new PIXI.Container();

            this.idleWings.addChild(ladybug);
            this.openWings.addChild(ladybugOpenWings);
            this.openWings.visible = false;

            this.ladybug.addChild(this.idleWings);
            this.ladybug.addChild(this.openWings);
            this.displayObject.addChild(this.ladybug);
        },

        initArrows: function() {
            this.velocityArrowModel = new ArrowView.ArrowViewModel({
                targetX: 0,
                targetY: 0
            });

            this.velocityArrowView = new ArrowView({
                model: this.velocityArrowModel,
                fillColor: Constants.VELOCITY_COLOR
            });

            this.accelerationArrowModel = new ArrowView.ArrowViewModel({
                targetX: 0,
                targetY: 0
            });

            this.accelerationArrowView = new ArrowView({
                model: this.accelerationArrowModel,
                fillColor: Constants.ACCELERATION_COLOR
            });

            this.displayObject.addChild(this.velocityArrowView.displayObject);
            this.displayObject.addChild(this.accelerationArrowView.displayObject);
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;

            if (this.simulation.ladybugOutOfBounds())
                this.showReturnButton();
            else
                this.hideReturnButton();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.ladybug.scale.x = this.ladybug.scale.y = this.calculateScale();

            this.updatePosition(this.model, this.model.get('position'));
        },

        calculateScale: function() {
            var targetSpriteHeight = this.mvt.modelToViewDeltaY(this.model.get('length')); // in pixels
            return targetSpriteHeight / this.ladybugSprite.height;
        },

        dragStart: function(event) {
            this.simulation.startSampling();

            if (!this.simulation.get('recording'))
                this.simulation.set('recording', true);

            if (this.simulation.get('paused'))
                this.simulation.play();

            this.simulation.set('motionType', 'Manual');
            this.simulation.set('updateMode', UpdateMode.POSITION);

            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                
                var x = this.mvt.viewToModelX(local.x);
                var y = this.mvt.viewToModelY(local.y);

                this.simulation.setSamplePoint(x, y);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;

            this.simulation.stopSampling();
        },

        update: function(time, deltaTime, paused) {
            
        },

        velocityChanged: function(model, velocity) {
            if (velocity.length() >= LadybugView.WING_OPEN_VELOCITY) {
                this.openWings.visible = true;
                this.idleWings.visible = false;
            }
            else {
                this.idleWings.visible = true;
                this.openWings.visible = false;
            }

            this.velocityArrowModel.set('targetX', this.mvt.modelToViewDeltaX(velocity.x));
            this.velocityArrowModel.set('targetY', this.mvt.modelToViewDeltaY(velocity.y));
        },

        accelerationChanged: function(model, acceleration) {
            this.accelerationArrowModel.set('targetX', this.mvt.modelToViewDeltaX(acceleration.x));
            this.accelerationArrowModel.set('targetY', this.mvt.modelToViewDeltaY(acceleration.y));
        },

        angleChanged: function(model, angle) {
            this.ladybug.rotation = angle + Math.PI / 2;
        },

        returnButtonClicked: function(event) {
            this.simulation.returnLadybug();
        },

        hideReturnButton: function() {
            if (!this.returnButtonHidden) {
                this.$el.hide();
                this.returnButtonHidden = true;
            }
        },

        showReturnButton: function() {
            if (this.returnButtonHidden) {
                this.$el.show();
                this.returnButtonHidden = false;
            }
        },

        reset: function() {
            this.updateMVT(this.mvt);
            this.angleChanged(this.model, this.model.get('angle'));
        },

        showVelocityArrow: function() {
            this.velocityArrowView.displayObject.visible = true;
        },

        hideVelocityArrow: function() {
            this.velocityArrowView.displayObject.visible = false;
        },

        showAccelerationArrow: function() {
            this.accelerationArrowView.displayObject.visible = true;
        },

        hideAccelerationArrow: function() {
            this.accelerationArrowView.displayObject.visible = false;
        }

    }, Constants.LadybugView);

    return LadybugView;
});