define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var ArrowView = require('common/pixi/view/arrow');

    var defineInputUpdateLocks = require('common/locks/define-locks');

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

        events: {
            'touchstart      .body': 'dragStart',
            'mousedown       .body': 'dragStart',
            'touchmove       .body': 'drag',
            'mousemove       .body': 'drag',
            'touchend        .body': 'dragEnd',
            'mouseup         .body': 'dragEnd',
            'touchendoutside .body': 'dragEnd',
            'mouseupoutside  .body': 'dragEnd',

            'touchstart      .velocityMarker': 'dragVelocityStart',
            'mousedown       .velocityMarker': 'dragVelocityStart',
            'touchmove       .velocityMarker': 'dragVelocity',
            'mousemove       .velocityMarker': 'dragVelocity',
            'touchend        .velocityMarker': 'dragVelocityEnd',
            'mouseup         .velocityMarker': 'dragVelocityEnd',
            'touchendoutside .velocityMarker': 'dragVelocityEnd',
            'mouseupoutside  .velocityMarker': 'dragVelocityEnd'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.velocityViewModel = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });

            this.gravityViewModel = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();

            this.initGraphics();
            
            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:velocity', this.updateVelocity);
            this.listenTo(this.model, 'change:force',    this.updateGravity);
            this.listenTo(this.model, 'change:mass',     this.updateMass);
            this.listenTo(this.model, 'change:radius',   this.updateRadius);
            this.listenTo(this.model, 'change:exploded', this.updateExploded);

            this.listenTo(this.velocityViewModel, 'change:targetX change:targetY', this.changeVelocity);
        },

        initGraphics: function() {
            this.bodyContainer = new PIXI.DisplayObjectContainer();

            this.body = Assets.createSprite(Assets.ImageFromModel(this.model));
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 0.5;
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';
            this.bodyContainer.addChild(this.body);

            this.initGravityArrowView();
            this.initVelocityArrowView();
            this.initVelocityMarker();
            
            this.displayObject.addChild(this.bodyContainer);
            this.displayObject.addChild(this.gravityArrowView.displayObject);
            this.displayObject.addChild(this.velocityMarker);
            this.displayObject.addChild(this.velocityArrowView.displayObject);

            this.displayObject.position.x = 480;
            this.displayObject.position.y = 300;

            if (this.model.get('fixed'))
                this.hideVelocityArrow();

            this.updateMVT(this.mvt);
        },

        initGravityArrowView: function() {
            this.gravityArrowView = new ArrowView({ 
                model: this.gravityViewModel,

                tailWidth:  BodyView.ARROW_TAIL_WIDTH,
                headWidth:  BodyView.ARROW_HEAD_WIDTH,
                headLength: BodyView.ARROW_HEAD_LENGTH,

                fillColor: BodyView.GRAVITY_ARROW_COLOR,
                fillAlpha: BodyView.GRAVITY_ARROW_ALPHA
            });
        },

        initVelocityArrowView: function() {
            this.velocityArrowView = new ArrowView({ 
                model: this.velocityViewModel,

                tailWidth:  BodyView.ARROW_TAIL_WIDTH,
                headWidth:  BodyView.ARROW_HEAD_WIDTH,
                headLength: BodyView.ARROW_HEAD_LENGTH,

                fillColor: BodyView.ARROW_COLOR,
                fillAlpha: BodyView.ARROW_ALPHA
            });
        },

        initVelocityMarker: function() {
            this.velocityMarker = new PIXI.DisplayObjectContainer();
            this.velocityMarker.hitArea = new PIXI.Circle(0, 0, BodyView.VELOCITY_MARKER_RADIUS);
            this.velocityMarker.buttonMode = true;

            var color = Colors.parseHex(BodyView.VELOCITY_MARKER_COLOR);

            var circle = new PIXI.Graphics();
            circle.lineStyle(BodyView.VELOCITY_MARKER_THICKNESS, color, BodyView.VELOCITY_MARKER_ALPHA);
            circle.drawCircle(0, 0, BodyView.VELOCITY_MARKER_RADIUS);

            var label = new PIXI.Text('V', {
                font: BodyView.VELOCITY_MARKER_FONT,
                fill: BodyView.VELOCITY_MARKER_COLOR
            });
            label.anchor.x = 0.5
            label.anchor.y = 0.4;
            label.alpha = BodyView.VELOCITY_MARKER_ALPHA;

            this.velocityMarker.addChild(circle);
            this.velocityMarker.addChild(label);
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

        updateExploded: function(body, exploded) {
            this.displayObject.visible = !exploded;
        },

        update: function(time, delta) {
            
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateRadius(this.model, this.model.get('radius'));
            this.updatePosition(this.model, this.model.get('position'));
            this.updateVelocity();
            this.updateGravity();
        },

        getBodyScale: function(radius) {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(radius * 2); // In pixels
            return (targetSpriteWidth / this.body.width) / this.textureBodyWidthRatio;
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;

                var x = Math.round(this.mvt.viewToModelX(this.displayObject.x));
                var y = Math.round(this.mvt.viewToModelY(this.displayObject.y));

                this.inputLock(function() {
                    this.model.setPosition(x, y);
                    if (this.simulation.get('paused'))
                        this.simulation.updateForceVectors();
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        dragVelocityStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.velocityMarker, this._dragOffset);
            this.draggingVelocity = true;
        },

        dragVelocity: function(data) {
            if (this.draggingVelocity) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;
                
                this.velocityMarker.x = x;
                this.velocityMarker.y = y;

                this.velocityViewModel.set('targetX', this.velocityMarker.x);
                this.velocityViewModel.set('targetY', this.velocityMarker.y);
            }
        },

        dragVelocityEnd: function(data) {
            this.draggingVelocity = false;
        },

        updateVelocity: function() {
            this.updateLock(function() {
                var velocityScale = this.simulation.get('scenario').viewSettings.velocityScale;
                var x = this.mvt.modelToViewDeltaX(this.model.get('velocity').x * velocityScale);
                var y = this.mvt.modelToViewDeltaY(this.model.get('velocity').y * velocityScale);
                this.velocityMarker.x = x;
                this.velocityMarker.y = y;
                // We don't want it to draw twice, so make the first silent
                this.velocityViewModel.set('targetX', x);
                this.velocityViewModel.set('targetY', y);
            });
        },

        changeVelocity: function() {
            this.inputLock(function() {
                var velocityScale = this.simulation.get('scenario').viewSettings.velocityScale;
                this.model.setVelocity(
                    Math.round(this.mvt.viewToModelDeltaX(this.velocityViewModel.get('targetX')) / velocityScale),
                    Math.round(this.mvt.viewToModelDeltaY(this.velocityViewModel.get('targetY')) / velocityScale)
                );
            });
        },

        updateGravity: function() {
            var forceScale = this.simulation.get('scenario').viewSettings.forceScale;
            var x = this.mvt.modelToViewDeltaX(this.model.get('force').x * forceScale);
            var y = this.mvt.modelToViewDeltaY(this.model.get('force').y * forceScale);
            this.gravityViewModel.set('targetX', x);
            this.gravityViewModel.set('targetY', y);
        },

        showVelocityArrow: function() {
            if (!this.model.get('fixed')) {
                this.velocityMarker.visible = true;
                this.velocityArrowView.show();
            }
        },

        hideVelocityArrow: function() {
            this.velocityMarker.visible = false;
            this.velocityArrowView.hide();
        },

        showGravityArrow: function() {
            this.gravityArrowView.show();
        },

        hideGravityArrow: function() {
            this.gravityArrowView.hide();
        }

    }, Constants.BodyView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BodyView);


    return BodyView;
});