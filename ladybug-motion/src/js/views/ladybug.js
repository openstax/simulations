define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView  = require('common/pixi/view');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the player particle
     */
    var LadybugView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:position',     this.updatePosition);
            this.listenTo(this.model, 'change:velocity',     this.velocityChanged);
            this.listenTo(this.model, 'change:acceleration', this.accelerationChanged);
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

            this.idleWings = new PIXI.DisplayObjectContainer();
            this.openWings = new PIXI.DisplayObjectContainer();

            this.idleWings.addChild(ladybug);
            this.openWings.addChild(ladybugOpenWings);
            this.openWings.visible = false;

            this.displayObject.addChild(this.idleWings);
            this.displayObject.addChild(this.openWings);

            this.updateMVT(this.mvt);
        },

        updatePosition: function(particle, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
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

        update: function(time, deltaTime, paused) {
            
        },

        velocityChanged: function(simulation, velocity) {
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

        accelerationChanged: function(simulation, acceleration) {
            // TODO: change the acceleration vector arrow
        }

    }, Constants.LadybugView);

    return LadybugView;
});