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
            'touchstart      .velocityMarker': 'dragStart',
            'mousedown       .velocityMarker': 'dragStart',
            'touchmove       .velocityMarker': 'drag',
            'mousemove       .velocityMarker': 'drag',
            'touchend        .velocityMarker': 'dragEnd',
            'mouseup         .velocityMarker': 'dragEnd',
            'touchendoutside .velocityMarker': 'dragEnd',
            'mouseupoutside  .velocityMarker': 'dragEnd',
        },

        initialize: function(options) {
            options = _.extend({
                color: '#ddd'
            }, options);

            this.color = Colors.parseHex(options.color);
            this.mvt = options.mvt;

            this.arrowViewModel = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });

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
            this.graphics = new PIXI.Graphics();

            this.arrowView = new ArrowView({ 
                model: this.arrowViewModel,

                tailWidth:  BodyView.ARROW_TAIL_WIDTH,
                headWidth:  BodyView.ARROW_HEAD_WIDTH,
                headLength: BodyView.ARROW_HEAD_LENGTH,

                fillColor: BodyView.ARROW_COLOR,
                fillAlpha: BodyView.ARROW_ALPHA
            });

            this.initVelocityMarker();
            
            this.displayObject.addChild(this.arrowView.displayObject);
            this.displayObject.addChild(this.velocityMarker);
            this.displayObject.addChild(this.graphics);

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

            this.graphics.clear();
            this.graphics.beginFill(this.color, 1);
            this.graphics.drawCircle(0, 0, radius);
            this.graphics.endFill();
        },

        updateVelocity: function() {
            this.updateLock(function() {
                // We don't want it to draw twice, so make the first silent
                this.arrowViewModel.set('targetX', this.mvt.modelToViewDeltaX(this.model.get('initVX')), silent);
                this.arrowViewModel.set('targetY', this.mvt.modelToViewDeltaY(this.model.get('initVY')));
            });
        },

        changeVelocity: function() {
            this.inputLock(function() {
                this.model.set('initVX', this.mvt.viewToModelDeltaX(this.arrowViewModel.get('targetX')));
                this.model.set('initVY', this.mvt.viewToModelDeltaX(this.arrowViewModel.get('targetY')));
            });
        },

        updateX: function(model, x) {
            this.displayObject.x = this.mvt.modelToViewX(x);
        },

        updateY: function(model, y) {
            this.displayObject.y = this.mvt.modelToViewY(y);
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
        }

    }, Constants.BodyView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BodyView);


    return BodyView;
});