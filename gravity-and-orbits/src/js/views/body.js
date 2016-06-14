define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var ArrowView = require('common/v3/pixi/view/arrow');

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

        /**
         * The offset of the body label in pixels
         */
        bodyLabelOffsetX:  40,
        bodyLabelOffsetY: -40,

        /**
         * The offset of the mass label in pixels from the edge
         *   of the body to the center of the text
         */
        massLabelOffsetY: 16,

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

            this.updateMass(this.model, this.model.get('mass'));
            
            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:velocity', this.updateVelocity);
            this.listenTo(this.model, 'change:force',    this.updateGravity);
            this.listenTo(this.model, 'change:mass',     this.updateMass);
            this.listenTo(this.model, 'change:radius',   this.updateRadius);
            this.listenTo(this.model, 'change:exploded', this.updateExploded);

            this.listenTo(this.velocityViewModel, 'change:targetX change:targetY', this.changeVelocity);
        },

        initGraphics: function() {
            this.bodyContainer = new PIXI.Container();

            this.initBody();
            this.initLabels();
            this.initGravityArrowView();
            this.initVelocityArrowView();
            this.initVelocityMarker();
            
            this.displayObject.addChild(this.bodyContainer);
            this.displayObject.addChild(this.bodyLabel);
            this.displayObject.addChild(this.massLabel);
            this.displayObject.addChild(this.gravityArrowView.displayObject);
            this.displayObject.addChild(this.velocityMarker);
            this.displayObject.addChild(this.velocityArrowView.displayObject);

            this.displayObject.position.x = 480;
            this.displayObject.position.y = 300;

            if (this.model.get('fixed'))
                this.hideVelocityArrow();

            this.updateMVT(this.mvt);
        },

        initBody: function() {
            this.body = Assets.createSprite(Assets.ImageFromModel(this.model));
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 0.5;
            this.body.buttonMode = true;
            this.body.defaultCursor = 'move';
            this.bodyContainer.addChild(this.body);
        },

        initLabels: function() {
            // Capitalize the first letter of each word in the name
            var name = this.model.get('name').replace( /\b\w/g, function (m) {
                return m.toUpperCase();
            });

            var textSettings = {
                font: BodyView.LABEL_FONT,
                fill: BodyView.LABEL_COLOR
            };

            var bodyLabelText = new PIXI.Text(name, textSettings);
            bodyLabelText.resolution = this.getResolution();
            bodyLabelText.anchor.x = 0.5;
            bodyLabelText.anchor.y = 0.6;
            bodyLabelText.x = this.bodyLabelOffsetX;
            bodyLabelText.y = this.bodyLabelOffsetY;

            var linePercentPadding = 0.2;
            var bodyLabelLine = new PIXI.Graphics();
            bodyLabelLine.lineStyle(2, Colors.parseHex(BodyView.LABEL_LINE_COLOR), BodyView.LABEL_LINE_ALPHA);
            bodyLabelLine.moveTo(0, 0);
            bodyLabelLine.lineTo(this.bodyLabelOffsetX * (1 - 2 * linePercentPadding), this.bodyLabelOffsetY * (1 - 2 * linePercentPadding));
            bodyLabelLine.x = this.bodyLabelOffsetX * linePercentPadding;
            bodyLabelLine.y = this.bodyLabelOffsetY * linePercentPadding;

            this.bodyLabel = new PIXI.Container();
            this.bodyLabel.addChild(bodyLabelText);
            this.bodyLabel.addChild(bodyLabelLine);

            this.massLabel = new PIXI.Text('', textSettings);
            this.massLabel.resolution = this.getResolution();
            this.massLabel.anchor.x = 0.5;
            this.massLabel.anchor.y = 0.4;
            this.massLabel.visible = false;
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
            this.velocityMarker = new PIXI.Container();
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
            label.resolution = this.getResolution();
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

        updateMass: function(body, mass) {
            this.massLabel.text = this.simulation.get('scenario').viewSettings.massReadoutFunction(mass);
        },

        updateRadius: function(body, radius) {
            this.bodyContainer.scale.x = this.bodyContainer.scale.y = this.getBodyScale(radius);

            var bodyRadius = this.mvt.modelToViewDeltaX(radius);
            if (this.massLabelOffsetY > 0)
                this.massLabel.y =  bodyRadius + this.massLabelOffsetY;
            else
                this.massLabel.y = -bodyRadius + this.massLabelOffsetY;
        },

        updateExploded: function(body, exploded) {
            this.displayObject.visible = !exploded;
        },

        updateBodyLabelVisibility: function() {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(this.model.get('radius') * 2);
            if (targetSpriteWidth < 9)
                this.bodyLabel.visible = true;
            else
                this.bodyLabel.visible = false;
        },

        update: function(time, delta) {
            
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateRadius(this.model, this.model.get('radius'));
            this.updatePosition(this.model, this.model.get('position'));
            this.updateVelocity();
            this.updateGravity();
            this.updateBodyLabelVisibility();
        },

        getBodyScale: function(radius) {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(radius * 2); // In pixels
            if (targetSpriteWidth < BodyView.MIN_DIAMETER)
                return (BodyView.MIN_DIAMETER / this.body.width) / this.textureBodyWidthRatio;
            else
                return (targetSpriteWidth / this.body.width) / this.textureBodyWidthRatio;
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = event.data.global.y - this.displayObject.y - this.dragOffset.y;
                
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

        dragEnd: function(event) {
            this.dragging = false;
        },

        dragVelocityStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.velocityMarker, this._dragOffset);
            this.draggingVelocity = true;
        },

        dragVelocity: function(event) {
            if (this.draggingVelocity) {
                var local = event.data.getLocalPosition(this.displayObject, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;
                
                this.velocityMarker.x = x;
                this.velocityMarker.y = y;

                this.velocityViewModel.set('targetX', this.velocityMarker.x);
                this.velocityViewModel.set('targetY', this.velocityMarker.y);
            }
        },

        dragVelocityEnd: function(event) {
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
        },

        showMassLabel: function() {
            this.massLabel.visible = true;
        },

        hideMassLabel: function() {
            this.massLabel.visible = false;
        }

    }, Constants.BodyView);


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BodyView);


    return BodyView;
});