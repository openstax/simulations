define(function(require) {

    'use strict';

    var buzz = require('buzz');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    var range    = require('common/math/range');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;
    var PEDESTAL_TOP_COLOR  = Colors.parseHex(Constants.CannonView.PEDESTAL_TOP_COLOR);
    var PEDESTAL_SIDE_COLOR = Colors.parseHex(Constants.CannonView.PEDESTAL_SIDE_COLOR);

    /**
     * A view that represents a cannon model
     */
    var CannonView = PixiView.extend({

        events: {
            'touchstart      .cannon': 'dragCannonStart',
            'mousedown       .cannon': 'dragCannonStart',
            'touchmove       .cannon': 'dragCannon',
            'mousemove       .cannon': 'dragCannon',
            'touchend        .cannon': 'dragCannonEnd',
            'mouseup         .cannon': 'dragCannonEnd',
            'touchendoutside .cannon': 'dragCannonEnd',
            'mouseupoutside  .cannon': 'dragCannonEnd',

            'touchstart      .pedestal': 'dragPedestalStart',
            'mousedown       .pedestal': 'dragPedestalStart',
            'touchmove       .pedestal': 'dragPedestal',
            'mousemove       .pedestal': 'dragPedestal',
            'touchend        .pedestal': 'dragPedestalEnd',
            'mouseup         .pedestal': 'dragPedestalEnd',
            'touchendoutside .pedestal': 'dragPedestalEnd',
            'mouseupoutside  .pedestal': 'dragPedestalEnd',
        },

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.time = 0;

            this.initGraphics();

            this._dragOffset = new PIXI.Point();
            this._initialPosition = new Vector2();

            // this.blastSound = new buzz.sound('audio/blast', {
            //     formats: ['ogg', 'mp3', 'wav']
            // });

            // Listen to angle because the user can change that from the control panel,
            //   but don't listen to x or y because those will only ever be changed
            //   through this view.
            this.listenTo(this.model, 'change:angle', this.updateAngle);
            this.updateAngle(this.model, this.model.get('angle'));
            this.listenTo(this.model, 'fire', this.cannonFired);
        },

        initGraphics: function() {
            /*
             * The sprites layer will be used to scale all of our
             *   sprites at once instead of individually so they
             *   stay as a group with a common transform origin.
             */
            this.spritesLayer = new PIXI.DisplayObjectContainer();

            this.initCannon();
            this.initCarriage();
            this.initPedestal();
            this.initAxes();
            this.initParticles();

            this.displayObject.addChild(this.spritesLayer);

            this.updateMVT(this.mvt);
        },

        initCannon: function() {
            var cannon = Assets.createSprite(Assets.Images.CANNON);
            cannon.anchor.x = 0.34;
            cannon.anchor.y = 0.5;
            cannon.buttonMode = true;
            this.spritesLayer.addChild(cannon);
            this.cannon = cannon;
        },

        initCarriage: function() {
            var carriage = Assets.createSprite(Assets.Images.CANNON_CARRIAGE);
            carriage.anchor.x = 0.5;
            carriage.anchor.y = 1;
            carriage.y = 100;
            carriage.x = -26;
            
            this.spritesLayer.addChild(carriage);
        },

        initPedestal: function() {
            var pedestal = new PIXI.Graphics();
            pedestal.buttonMode = true;
            this.displayObject.addChild(pedestal);
            this.pedestal = pedestal;

            var pedestalSide = new PIXI.Graphics();
            this.displayObject.addChild(pedestalSide);
            this.pedestalSide = pedestalSide;
        },

        initAxes: function() {
            this.axes = new PIXI.Graphics();
            this.displayObject.addChild(this.axes);
        },

        initParticles: function() {
            /* 
             * The particles will be added to the sprites layer, which is always
             *   scaled with the images.  In this way we shouldn't ever have to
             *   reference the mvt object and do conversions when controlling
             *   the behavior of our particles or move their transform origin.
             */
            var particleContainer = new PIXI.SpriteBatch();
            this.spritesLayer.addChildAt(particleContainer, 0);

            var flameParticleTexture = PIXI.Texture.generateRoundParticleTexture(CannonView.FLAME_PARTICLE_END_RADIUS * 0.6, CannonView.FLAME_PARTICLE_END_RADIUS, CannonView.FLAME_PARTICLE_INSIDE_COLOR, CannonView.FLAME_PARTICLE_OUTSIDE_COLOR);//Assets.Texture(Assets.Images.FLAME_PARTICLE);
            var smokeParticleTexture = PIXI.Texture.generateRoundParticleTexture(0, 20, CannonView.SMOKE_PARTICLE_COLOR);

            this.activeFlameParticles = [];
            this.dormantFlameParticles = [];
            this.activeSmokeParticles = [];
            this.dormantSmokeParticles = [];

            var i;
            var particle;

            // Smoke particles
            for (i = 0; i < CannonView.NUM_SMOKE_PARTICLES; i++) {
                particle = new PIXI.Sprite(smokeParticleTexture);
                particle.visible = false;
                particle.anchor.x = particle.anchor.y = 0.5;
                particle.velocity = new Vector2();

                particleContainer.addChild(particle);
                this.dormantSmokeParticles.push(particle);
            }

            // Flame particles (in front of smoke particles)
            for (i = 0; i < CannonView.NUM_FLAME_PARTICLES; i++) {
                particle = new PIXI.Sprite(flameParticleTexture);
                particle.visible = false;
                particle.anchor.x = particle.anchor.y = 0.5;
                particle.blendMode = PIXI.blendModes.ADD; // Get that good bright flame effect
                particle.velocity = new Vector2();

                particleContainer.addChild(particle);
                this.dormantFlameParticles.push(particle);
            }

            // Range of a particle's starting y before rotation
            this.flameParticleStartYRange = range({
                min: -CannonView.PARTICLE_EMISSION_AREA_WIDTH / 2 + CannonView.FLAME_PARTICLE_START_RADIUS,
                max:  CannonView.PARTICLE_EMISSION_AREA_WIDTH / 2 - CannonView.FLAME_PARTICLE_START_RADIUS
            });
            // End of cannon relative to origin minus the particle radius so it starts inside the bore
            this.flameParticleStartX = this.cannon.width * (1 - this.cannon.anchor.x) - CannonView.FLAME_PARTICLE_START_RADIUS; 
        },        


        drawPedestal: function() {
            this.pedestal.clear();
            this.pedestalSide.clear();

            var pedestalHeight = this.model.get('y') + this.model.get('heightOffGround') + Constants.GROUND_Y;
            var pixelHeight  = Math.abs(this.mvt.modelToViewDeltaY(pedestalHeight));
            var pixelWidth   = this.mvt.modelToViewDeltaX(CannonView.PEDESTAL_WIDTH);
            var pixelYOffset = Math.abs(this.mvt.modelToViewDeltaY(this.model.get('heightOffGround')));
            var pedestal = this.pedestal;
            var pedestalSide = this.pedestalSide;

            // Set a minimum height
            if (pixelHeight < 2)
                pixelHeight = 2;

            var horizontalRadius = pixelWidth / 2;
            var verticalRadius = (pixelWidth * CannonView.PEDESTAL_PERSPECTIVE_MODIFIER) / 2;

            // Draw grass top
            pedestal.beginFill(PEDESTAL_TOP_COLOR, 1);
            pedestal.drawEllipse(0, pixelYOffset, horizontalRadius, verticalRadius);
            pedestal.endFill();

            pedestalSide.beginFill(PEDESTAL_SIDE_COLOR, 1);
            pedestalSide.moveTo(-horizontalRadius, pixelYOffset)
            pedestalSide.bezierCurveTo(-horizontalRadius, pixelYOffset + verticalRadius, horizontalRadius, pixelYOffset + verticalRadius, horizontalRadius, pixelYOffset);
            pedestalSide.lineTo(horizontalRadius, pixelYOffset + pixelHeight);
            pedestalSide.bezierCurveTo(horizontalRadius, pixelYOffset + pixelHeight + verticalRadius, -horizontalRadius, pixelYOffset + pixelHeight + verticalRadius, -horizontalRadius, pixelYOffset + pixelHeight)
            pedestalSide.lineTo(-horizontalRadius, pixelYOffset);
            pedestalSide.endFill();
        },

        drawAxes: function() {
            var width  = 2000; // Arbitrarily large stage sizes. displayObject.stage.width wasn't giving correct values
            var height = 1000;

            var global = this.displayObject.position;
            var left   = Math.ceil(0 - global.x);
            var right  = Math.ceil(width - global.x);
            var top    = Math.ceil(0 - global.y);
            var bottom = Math.ceil(height - global.y);
            
            this.axes.clear();
            this.axes.lineStyle(CannonView.AXIS_LINE_WIDTH, CannonView.AXIS_LINE_COLOR, CannonView.AXIS_LINE_ALPHA);
            this.axes.moveTo(left, 0);
            this.axes.lineTo(right, 0);
            this.axes.moveTo(0, top);
            this.axes.lineTo(0, bottom);
        },

        dragCannonStart: function(data) {
            this.draggingCannon = true;
        },

        dragCannon: function(data) {
            if (this.draggingCannon) {
                var x = data.global.x - this.displayObject.x;
                var y = data.global.y - this.displayObject.y;
                
                var angle = Math.atan2(y, x);
                var degrees = -angle * RADIANS_TO_DEGREES;
                // Catch the case where we go into negatives at the 180deg mark
                if (degrees >= -180 && degrees < Constants.Cannon.MIN_ANGLE && this.model.get('angle') > 0)
                    degrees = 360 + degrees;

                // Make sure it's within bounds
                if (degrees < Constants.Cannon.MIN_ANGLE)
                    degrees = Constants.Cannon.MIN_ANGLE;
                if (degrees > Constants.Cannon.MAX_ANGLE)
                    degrees = Constants.Cannon.MAX_ANGLE;
                this.model.set('angle', degrees);
            }
        },

        dragCannonEnd: function(data) {
            this.draggingCannon = false;
        },

        dragPedestalStart: function(data) {
            this.previousPedestalY = data.global.y;
            this.draggingPedestal = true;
        },

        dragPedestal: function(data) {
            if (this.draggingPedestal) {
                var dy = data.global.y - this.previousPedestalY;
                this.previousPedestalY = data.global.y;

                dy = this.mvt.viewToModelDeltaY(dy);

                var y = this.model.get('y') + dy;
                if (y < 0)
                    y = 0;
                this.model.set('y', y);

                this.updatePosition();
                this.drawPedestal();
                this.drawAxes();
            }
        },

        dragPedestalEnd: function(data) {
            this.draggingPedestal = false;
        },

        updateAngle: function(cannon, angleInDegrees) {
            this.cannon.rotation = this.model.firingAngle();
        },

        updatePosition: function() {
            this.displayObject.x = this.mvt.modelToViewX(this.model.get('x'));
            this.displayObject.y = this.mvt.modelToViewY(this.model.get('y'));
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Note: Maybe we don't need to ever update at all. Could we just scale the whole scene's displayObject?
            var targetCannonWidth = mvt.modelToViewDeltaX(this.model.get('width')); // in pixels
            var scale = targetCannonWidth / this.cannon.width;

            this.spritesLayer.scale.x = this.spritesLayer.scale.y = scale;

            this.updatePosition();
            this.drawPedestal();
            this.drawAxes();
        },

        update: function(time, deltaTime, paused) {
            if (!paused) {
                this.time += deltaTime;
                this.updateFireParticles(this.time, deltaTime);
                this.updateSmokeParticles(this.time, deltaTime);
            }
        },

        cannonFired: function() {
            this.timeToStopFireEmission = this.time + CannonView.FLAME_PARTICLE_EMISSION_DURATION;
        },

        updateFireParticles: function(time, deltaTime) {
            if (time < this.timeToStopFireEmission) {
                console.log(this.dormantFlameParticles.length);
                var numParticlesToEmit = Math.floor(CannonView.FLAME_PARTICLE_EMISSION_RATE * deltaTime);
                while (numParticlesToEmit > 0) {
                    this.emitFireParticle();
                    numParticlesToEmit--;
                }

                var particle;
                for (var i = this.activeFlameParticles.length - 1; i >= 0; i--) {
                    particle = this.activeFlameParticles[i];

                    particle.x += particle.velocity.x * deltaTime;
                    particle.y += particle.velocity.y * deltaTime;

                    particle.distanceTraveled += particle.velocity.length() * deltaTime;

                    if (particle.distanceTraveled > CannonView.FLAME_PARTICLE_TRAVEL_DISTANCE) {
                        particle.alpha = 1 - (particle.distanceTraveled - CannonView.FLAME_PARTICLE_TRAVEL_DISTANCE) / 10;
                        if (particle.alpha <= 0) {
                            particle.alpha = 0;
                            this.activeFlameParticles.splice(i, 1);
                            this.dormantFlameParticles.push(particle);
                        }
                    }
                }
            }
            else if (this.activeFlameParticles.length) {
                for (var i = this.activeFlameParticles.length - 1; i >= 0; i--) {
                    this.activeFlameParticles[i].visible = false;
                    this.dormantFlameParticles.push(this.activeFlameParticles[i]);
                    this.activeFlameParticles.splice(i, 1);
                }
            }
        },

        updateSmokeParticles: function(time, deltaTime) {

        },

        emitFireParticle: function() {
            if (!this.dormantFlameParticles.length)
                return null;

            var particle = this.dormantFlameParticles.pop();
            if (particle) {
                // Get the starting position of the particle if the cannon were not rotated.
                //   Then rotate that point around the cannon's rotational axis to get the 
                //   actual starting point.
                var initialPosition = this._initialPosition
                    .set(this.flameParticleStartX, this.flameParticleStartYRange.random())
                    .rotate(this.model.firingAngle());

                var scale = CannonView.FLAME_PARTICLE_START_RADIUS / (particle.texture.width / 2);
                var angle = this.model.firingAngle() + CannonView.FLAME_PARTICLE_SPREAD_ANGLE_RANGE.random();

                particle.x = initialPosition.x;
                particle.y = initialPosition.y;
                particle.scale.x = particle.scale.y = scale;
                particle.alpha = 1;
                particle.visible = true;
                particle.velocity.set(CannonView.FLAME_PARTICLE_TRAVEL_DISTANCE, 0).rotate(angle);
                particle.distanceTraveled = 0;

                this.activeFlameParticles.push(particle);    
            }

            return particle;
        }

    }, Constants.CannonView);

    return CannonView;
});