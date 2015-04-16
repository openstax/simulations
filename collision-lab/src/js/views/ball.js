define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var ArrowView = require('common/pixi/view/arrow');
    var Colors    = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var Constants = require('constants');

    var BallView = PixiView.extend({

        events: {
            'touchstart      .ball': 'dragStart',
            'mousedown       .ball': 'dragStart',
            'touchmove       .ball': 'drag',
            'mousemove       .ball': 'drag',
            'touchend        .ball': 'dragEnd',
            'mouseup         .ball': 'dragEnd',
            'touchendoutside .ball': 'dragEnd',
            'mouseupoutside  .ball': 'dragEnd',

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
            options = _.extend({
                interactionEnabled: true
            }, options);

            this.color = Colors.parseHex(this.model.get('color'));
            this.interactionEnabled = options.interactionEnabled;
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.velocityArrowViewModel = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });
            this.momentumArrowViewModel = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._viewPosition = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position',  this.updatePosition);
            this.listenTo(this.model, 'change:velocity',  this.updateVelocity);
            this.listenTo(this.model, 'change:momentumX', this.updateMomentumX);
            this.listenTo(this.model, 'change:momentumY', this.updateMomentumY);
            this.listenTo(this.model, 'change:radius',    this.drawBall);

            this.listenTo(this.velocityArrowViewModel, 'change:targetX change:targetY', this.changeVelocity);

            this.listenTo(this.simulation, 'change:paused', this.pausedStateChanged);
        },

        initGraphics: function() {
            this.ball = new PIXI.Graphics();
            this.ball.buttonMode = true;
            this.ball.defaultCursor = 'move';

            this.initVelocityArrow();
            this.initVelocityMarker();
            this.initNumber();
            this.initMomentumArrow();
            
            this.displayObject.addChild(this.ball);
            this.displayObject.addChild(this.velocityMarker);
            this.displayObject.addChild(this.momentumArrowView.displayObject);
            this.displayObject.addChild(this.velocityArrowView.displayObject);
            this.displayObject.addChild(this.number);

            this.updateMVT(this.mvt);
            this.pausedStateChanged(this.simulation, this.simulation.get('paused'));
        },

        initVelocityArrow: function() {
            this.velocityArrowView = new ArrowView({ 
                model: this.velocityArrowViewModel,

                tailWidth:  BallView.ARROW_TAIL_WIDTH,
                headWidth:  BallView.ARROW_HEAD_WIDTH,
                headLength: BallView.ARROW_HEAD_LENGTH,

                fillColor: BallView.ARROW_COLOR,
                fillAlpha: BallView.ARROW_ALPHA
            });
        },

        initVelocityMarker: function() {
            this.velocityMarker = new PIXI.DisplayObjectContainer();
            this.velocityMarker.hitArea = new PIXI.Circle(0, 0, BallView.VELOCITY_MARKER_RADIUS);
            this.velocityMarker.buttonMode = true;

            var color = Colors.parseHex(BallView.VELOCITY_MARKER_COLOR);

            var circle = new PIXI.Graphics();
            circle.lineStyle(BallView.VELOCITY_MARKER_THICKNESS, color, BallView.VELOCITY_MARKER_ALPHA);
            circle.drawCircle(0, 0, BallView.VELOCITY_MARKER_RADIUS);

            var label = new PIXI.Text('V', {
                font: BallView.VELOCITY_MARKER_FONT,
                fill: BallView.VELOCITY_MARKER_COLOR
            });
            label.anchor.x = 0.5
            label.anchor.y = 0.4;
            label.alpha = BallView.VELOCITY_MARKER_ALPHA;

            this.velocityMarker.addChild(circle);
            this.velocityMarker.addChild(label);
        },

        initNumber: function() {
            this.number = new PIXI.Text(this.model.get('number'), {
                font: BallView.NUMBER_FONT,
                fill: BallView.NUMBER_COLOR
            });
            this.number.anchor.x = 0.5;
            this.number.anchor.y = 0.45;
        },

        initMomentumArrow: function() {
            this.momentumArrowView = new ArrowView({ 
                model: this.momentumArrowViewModel,

                tailWidth:  BallView.MOMENTUM_ARROW_TAIL_WIDTH,
                headWidth:  BallView.MOMENTUM_ARROW_HEAD_WIDTH,
                headLength: BallView.MOMENTUM_ARROW_HEAD_LENGTH,

                fillColor: BallView.MOMENTUM_ARROW_COLOR,
                fillAlpha: BallView.MOMENTUM_ARROW_ALPHA
            });
        },

        drawBall: function() {
            var radius = this.mvt.modelToViewDeltaX(this.model.get('radius'));

            this.ball.clear();
            this.ball.beginFill(this.color, 1);
            this.ball.drawCircle(0, 0, radius);
            this.ball.endFill();
        },

        dragStart: function(data) {
            if (!this.interactionEnabled)
                return;

            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
            this.moveToTop();
        },

        drag: function(data) {
            if (this.dragging) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                this._viewPosition.x = local.x - this.dragOffset.x;
                this._viewPosition.y = local.y - this.dragOffset.y;
                
                var modelPosition = this.mvt.viewToModel(this._viewPosition);
                if (this.simulation.get('oneDimensional'))
                    modelPosition.y = 0;

                this.simulation.keepWithinBounds(this.model, modelPosition);

                // The object that the MVT returned is about to get overwritten
                var modelX = modelPosition.x;
                var modelY = modelPosition.y;

                var correctedViewPosition = this.mvt.modelToView(modelPosition);
                this.displayObject.x = correctedViewPosition.x;
                this.displayObject.y = correctedViewPosition.y;

                this.inputLock(function() {
                    this.model.setPosition(modelX, modelY);

                    if (!this.simulation.hasStarted())
                        this.model.setInitPosition(modelX, modelY);
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
            this.simulation.separateAllBalls();
        },

        dragVelocityStart: function(data) {
            if (!this.interactionEnabled)
                return;

            this.dragOffset = data.getLocalPosition(this.velocityMarker, this._dragOffset);
            this.draggingVelocity = true;
            this.moveToTop();
        },

        dragVelocity: function(data) {
            if (this.draggingVelocity) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;

                if (this.simulation.get('oneDimensional'))
                    y = 0;
                
                this.velocityMarker.x = x;
                this.velocityMarker.y = y;

                this.velocityArrowViewModel.set('targetX', this.velocityMarker.x);
                this.velocityArrowViewModel.set('targetY', this.velocityMarker.y);
            }
        },

        dragVelocityEnd: function(data) {
            this.draggingVelocity = false;
        },

        moveToTop: function() {
            var parent = this.displayObject.parent;
            parent.setChildIndex(this.displayObject, parent.children.length - 1);
        },

        updateVelocity: function(model, velocity) {
            this.updateLock(function() {
                var viewVelocity = this.mvt.modelToViewDelta(velocity);
                viewVelocity.scale(BallView.VELOCITY_SCALE);

                this.velocityMarker.x = viewVelocity.x;
                this.velocityMarker.y = viewVelocity.y;
                // We don't want it to draw twice, so make the first silent
                this.velocityArrowViewModel.set('targetX', viewVelocity.x);
                this.velocityArrowViewModel.set('targetY', viewVelocity.y);
            });
        },

        changeVelocity: function() {
            this.inputLock(function() {
                var vx = this.mvt.viewToModelDeltaX(this.velocityArrowViewModel.get('targetX'));
                var vy = this.mvt.viewToModelDeltaY(this.velocityArrowViewModel.get('targetY'));

                vx /= BallView.VELOCITY_SCALE;
                vy /= BallView.VELOCITY_SCALE;

                if (!this.simulation.hasStarted())
                    this.model.setInitVelocity(vx, vy);

                this.model.setVelocity(vx, vy);
            });
        },

        updatePosition: function(model, position) {
            this.updateLock(function() {
                var viewPos = this.mvt.modelToView(position);
                this.displayObject.x = viewPos.x;
                this.displayObject.y = viewPos.y;
            });
        },

        updateMomentumX: function(model, momentumX) {
            this.momentumArrowViewModel.set('targetX', this.mvt.modelToViewDeltaX(momentumX) * BallView.MOMENTUM_SCALE);
        },

        updateMomentumY: function(model, momentumY) {
            this.momentumArrowViewModel.set('targetY', this.mvt.modelToViewDeltaY(momentumY) * BallView.MOMENTUM_SCALE);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawBall();
            this.updatePosition(this.model, this.model.get('position'));
            this.updateVelocity(this.model, this.model.get('velocity'));
            this.updateMomentumX(this.model, this.model.get('momentumX'));
            this.updateMomentumY(this.model, this.model.get('momentumY'));
        },

        pausedStateChanged: function(simulation, paused) {
            if (paused)
                this.enableInteraction();
            else
                this.disableInteraction();
        },

        enableInteraction: function() {
            this.interactionEnabled = true;
            this.ball.buttonMode = true;
            if (this.velocityArrowVisible)
                this.velocityMarker.visible = true;
        },

        disableInteraction: function() {
            this.interactionEnabled = false;
            this.ball.buttonMode = false;
            this.velocityMarker.visible = false;
        },

        showVelocityArrow: function() {
            this.velocityArrowVisible = true;
            this.velocityArrowView.show();
            if (this.interactionEnabled)
                this.velocityMarker.visible = true;
        },

        hideVelocityArrow: function() {
            this.velocityArrowVisible = false;
            this.velocityArrowView.hide();
            this.velocityMarker.visible = false;
        },

        showMomentumArrow: function() {
            this.momentumArrowView.show();
        },

        hideMomentumArrow: function() {
            this.momentumArrowView.hide();
        }

    }, Constants.BallView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BallView);


    return BallView;
});