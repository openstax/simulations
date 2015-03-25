define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var HybridView  = require('common/pixi/view/hybrid');

    var Assets = require('assets');

    var Constants = require('constants');

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
            var ladybug = Assets.createSprite(Assets.Images.LADYBUG);
            ladybug.anchor.x = 0.5;
            ladybug.anchor.y = 0.5;
            this.ladybugSprite = ladybug;

            var ladybugOpenWings = Assets.createSprite(Assets.Images.LADYBUG_OPEN_WINGS);
            ladybugOpenWings.anchor.x = 0.5;
            ladybugOpenWings.anchor.y = 0.5;
            ladybugOpenWings.visible = false;

            this.ladybug = new PIXI.DisplayObjectContainer();
            this.idleWings = new PIXI.DisplayObjectContainer();
            this.openWings = new PIXI.DisplayObjectContainer();

            this.idleWings.addChild(ladybug);
            this.openWings.addChild(ladybugOpenWings);
            this.openWings.visible = false;

            this.ladybug.addChild(this.idleWings);
            this.ladybug.addChild(this.openWings);
            this.displayObject.addChild(this.ladybug);

            this.updateMVT(this.mvt);
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

            this.displayObject.scale.x = this.displayObject.scale.y = this.calculateScale();

            this.updatePosition(this.model, this.model.get('position'));
        },

        calculateScale: function() {
            var targetSpriteHeight = this.mvt.modelToViewDeltaY(this.model.get('length')); // in pixels
            return targetSpriteHeight / this.ladybugSprite.height;
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;

            this.simulation.startSampling();
        },

        drag: function(data) {
            if (this.dragging) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);

                var x = this.mvt.viewToModelX(local.x);
                var y = this.mvt.viewToModelY(local.y);

                this.simulation.setSamplePoint(x, y);
            }
        },

        dragEnd: function(data) {
            this.dragging = false;

            this.simulation.stopSampling();
        },

        update: function(time, deltaTime, paused) {
            
        },

        velocityChanged: function(model, velocity) {
            if (velocity.length() >= LadybugView.WING_OPEN_VELOCITY) {
                this.idleWings.visible = false;
                this.openWings.visible = true;
            }
            else {
                this.idleWings.visible = true;
                this.openWings.visible = false;
            }

            // TODO: change the velocity vector arrow
        },

        accelerationChanged: function(model, acceleration) {
            // TODO: change the acceleration vector arrow
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
        }

    }, Constants.LadybugView);

    return LadybugView;
});