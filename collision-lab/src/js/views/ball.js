define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var ArrowView = require('common/v3/pixi/view/arrow');
    var Colors    = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var Constants = require('constants');
    var PANEL_LINE_COLOR = Colors.parseHex(Constants.BallView.PANEL_LINE_COLOR);
    var PANEL_FILL_COLOR = Colors.parseHex(Constants.BallView.PANEL_FILL_COLOR);

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
            this._momentum     = new Vector2();

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
            this.initLabels();
            
            this.displayObject.addChild(this.ball);
            this.displayObject.addChild(this.velocityMarker);
            this.displayObject.addChild(this.momentumArrowView.displayObject);
            this.displayObject.addChild(this.velocityArrowView.displayObject);
            this.displayObject.addChild(this.number);

            this.updateMVT(this.mvt);
            this.pausedStateChanged(this.simulation, this.simulation.get('paused'));
            this.updateVelocity(this.model, this.model.get('velocity'));
            this.updateMomentumLabel();
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
            this.velocityMarker = new PIXI.Container();
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
            label.anchor.y = 0.45;
            label.resolution = this.getResolution();
            label.alpha = BallView.VELOCITY_MARKER_ALPHA;

            this.velocityMarker.addChild(circle);
            this.velocityMarker.addChild(label);
        },

        initNumber: function() {
            this.number = new PIXI.Text(this.model.get('number'), {
                font: BallView.NUMBER_FONT,
                fill: BallView.NUMBER_COLOR
            });
            this.number.resolution = this.getResolution();
            this.number.anchor.x = 0.5;
            this.number.anchor.y = 0.5;
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

        initLabels: function() {
            this.velocityLabel = new PIXI.Container();
            this.momentumLabel = new PIXI.Container();

            var offset = 8 + this.mvt.modelToViewDeltaX(this.model.get('radius'));
            var height = 44;
            var velWidth = 100;
            var momWidth = 158;
            var padding = 3;

            var velocityPanel = new PIXI.Graphics();
            velocityPanel.lineStyle(BallView.PANEL_LINE_WIDTH, PANEL_LINE_COLOR, BallView.PANEL_LINE_ALPHA);
            velocityPanel.beginFill(PANEL_FILL_COLOR, BallView.PANEL_FILL_ALPHA);
            velocityPanel.drawRect(-velWidth / 2, -offset - height, velWidth, height);
            velocityPanel.endFill();

            var momentumPanel = new PIXI.Graphics();
            momentumPanel.lineStyle(BallView.PANEL_LINE_WIDTH, PANEL_LINE_COLOR, BallView.PANEL_LINE_ALPHA);
            momentumPanel.beginFill(PANEL_FILL_COLOR, BallView.PANEL_FILL_ALPHA);
            momentumPanel.drawRect(-momWidth / 2, offset, momWidth, height);
            momentumPanel.endFill();

            var textSettings = {
                font: BallView.LABEL_FONT,
                fill: BallView.LABEL_TEXT_COLOR
            };

            var velocityLabelText = new PIXI.Text('Speed (m/s)', textSettings);
            velocityLabelText.anchor.x = 0.5;
            velocityLabelText.y = -offset - height + padding;
            var velocityValueText = new PIXI.Text('| v | = 0.50', textSettings);
            velocityValueText.anchor.x = 0.5;
            velocityValueText.anchor.y = 0.85;
            velocityValueText.y = -offset - padding;
            this.velocityValueText = velocityValueText;

            var momentumLabelText = new PIXI.Text('Momentum (kg ms/s)', textSettings);
            momentumLabelText.anchor.x = 0.5;
            momentumLabelText.y = offset + padding;
            var momentumValueText = new PIXI.Text('| p | = 1.00', textSettings);
            momentumValueText.anchor.x = 0.5;
            momentumValueText.anchor.y = 0.85;
            momentumValueText.y = offset + height - padding;
            this.momentumValueText = momentumValueText;

            this.velocityLabel.addChild(velocityPanel);
            this.velocityLabel.addChild(velocityLabelText);
            this.velocityLabel.addChild(velocityValueText);
            this.momentumLabel.addChild(momentumPanel);
            this.momentumLabel.addChild(momentumLabelText);
            this.momentumLabel.addChild(momentumValueText);

            this.displayObject.addChild(this.velocityLabel);
            this.displayObject.addChild(this.momentumLabel);
        },

        drawBall: function() {
            var radius = this.mvt.modelToViewDeltaX(this.model.get('radius'));

            this.ball.clear();
            this.ball.beginFill(this.color, 1);
            this.ball.drawCircle(0, 0, radius);
            this.ball.endFill();
        },

        dragStart: function(event) {
            if (!this.interactionEnabled)
                return;

            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
            this.moveToTop();
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.displayObject.parent, this._dragLocation);
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

                    this.simulation.updateCalculatedVariables();
                });
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
            this.simulation.separateAllBalls();
        },

        dragVelocityStart: function(event) {
            if (!this.interactionEnabled)
                return;

            this.dragOffset = event.data.getLocalPosition(this.velocityMarker, this._dragOffset);
            this.draggingVelocity = true;
            this.moveToTop();
        },

        dragVelocity: function(event) {
            if (this.draggingVelocity) {
                var local = event.data.getLocalPosition(this.displayObject, this._dragLocation);
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

        dragVelocityEnd: function(event) {
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

                this.velocityValueText.text = '| v | = ' + velocity.length().toFixed(2);
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
                this.simulation.updateCalculatedVariables();
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
            this.updateMomentumLabel();
        },

        updateMomentumY: function(model, momentumY) {
            this.momentumArrowViewModel.set('targetY', this.mvt.modelToViewDeltaY(momentumY) * BallView.MOMENTUM_SCALE);
            this.updateMomentumLabel();
        },

        updateMomentumLabel: function() {
            var momentum = this._momentum
                .set(
                    this.model.get('momentumX'),
                    this.model.get('momentumY')
                )
                .length();
            this.momentumValueText.text = '| p | = ' + momentum.toFixed(2);
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
        },

        showVelocityLabel: function() {
            this.velocityLabel.visible = true;
        },

        hideVelocityLabel: function() {
            this.velocityLabel.visible = false;
        },

        showMomentumLabel: function() {
            this.momentumLabel.visible = true;
        },

        hideMomentumLabel: function() {
            this.momentumLabel.visible = false;
        }

    }, Constants.BallView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BallView);


    return BallView;
});