define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var ArrowView = require('common/pixi/view/arrow');
    var Colors    = require('common/colors/colors');
    //var Vector2  = require('common/math/vector2');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var Constants = require('constants');
    
    var silent = { silent: true };

    var BodyView = PixiView.extend({

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
            options = _.extend({
                color: '#ddd',
                interactionEnabled: true
            }, options);

            this.color = Colors.parseHex(options.color);
            this.interactionEnabled = options.interactionEnabled;
            this.mvt = options.mvt;

            this.arrowViewModel = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:x', this.updateX);
            this.listenTo(this.model, 'change:y', this.updateY);
            this.listenTo(this.model, 'change:mass', this.drawBody);
            this.listenTo(this.model, 'change:destroyedInCollision', this.updateDestroyedState);

            this.listenTo(this.model, 'change:initVX', this.updateVelocity);
            this.listenTo(this.model, 'change:initVY', this.updateVelocity);

            this.listenTo(this.arrowViewModel, 'change:targetX change:targetY', this.changeVelocity);
        },

        initGraphics: function() {
            this.body = new PIXI.Graphics();
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';

            this.arrowView = new ArrowView({ 
                model: this.arrowViewModel,

                tailWidth:  BodyView.ARROW_TAIL_WIDTH,
                headWidth:  BodyView.ARROW_HEAD_WIDTH,
                headLength: BodyView.ARROW_HEAD_LENGTH,

                fillColor: BodyView.ARROW_COLOR,
                fillAlpha: BodyView.ARROW_ALPHA
            });

            this.initVelocityMarker();
            
            this.displayObject.addChild(this.velocityMarker);
            this.displayObject.addChild(this.arrowView.displayObject);
            this.displayObject.addChild(this.body);

            this.updateMVT(this.mvt);
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

        drawBody: function() {
            var diameter = 2.5 * Math.pow(this.model.get('mass'), 1/3) + 6;
            var radius = this.mvt.modelToViewDeltaX(diameter) / 2;

            this.body.clear();
            this.body.beginFill(this.color, 1);
            this.body.drawCircle(0, 0, radius);
            this.body.endFill();
        },

        dragStart: function(data) {
            if (!this.interactionEnabled)
                return;

            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;

                var x = this.mvt.viewToModelDeltaX(this.displayObject.x);
                var y = this.mvt.viewToModelDeltaY(this.displayObject.y);

                this.inputLock(function() {
                    this.model.set('x', x);
                    this.model.set('y', y);
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        dragVelocityStart: function(data) {
            if (!this.interactionEnabled)
                return;

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

                this.arrowViewModel.set('targetX', this.velocityMarker.x);
                this.arrowViewModel.set('targetY', this.velocityMarker.y);
            }
        },

        dragVelocityEnd: function(data) {
            this.draggingVelocity = false;
        },

        updateVelocity: function() {
            this.updateLock(function() {
                var x = this.mvt.modelToViewDeltaX(this.model.get('initVX'));
                var y = this.mvt.modelToViewDeltaY(this.model.get('initVY'));
                this.velocityMarker.x = x;
                this.velocityMarker.y = y;
                // We don't want it to draw twice, so make the first silent
                this.arrowViewModel.set('targetX', x);
                this.arrowViewModel.set('targetY', y);
            });
        },

        changeVelocity: function() {
            this.inputLock(function() {
                this.model.set('initVX', Math.round(this.mvt.viewToModelDeltaX(this.arrowViewModel.get('targetX'))));
                this.model.set('initVY', Math.round(this.mvt.viewToModelDeltaY(this.arrowViewModel.get('targetY'))));
            });
        },

        updateX: function(model, x) {
            this.updateLock(function() {
                this.displayObject.x = this.mvt.modelToViewX(x);
            });
        },

        updateY: function(model, y) {
            this.updateLock(function() {
                this.displayObject.y = this.mvt.modelToViewY(y);
            });
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawBody();
            this.updateX(this.model, this.model.get('x'));
            this.updateY(this.model, this.model.get('y'));
            this.updateVelocity();
        },

        updateDestroyedState: function(body, destroyedInCollision) {
            this.displayObject.visible = !destroyedInCollision;
        },

        enableInteraction: function() {
            this.interactionEnabled = true;
            this.body.buttonMode = true;
            this.velocityMarker.visible = true;
            this.arrowView.show();
        },

        disableInteraction: function() {
            this.interactionEnabled = false;
            this.body.buttonMode = false;
            this.velocityMarker.visible = false;
            this.arrowView.hide();
        }

    }, Constants.BodyView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BodyView);


    return BodyView;
});