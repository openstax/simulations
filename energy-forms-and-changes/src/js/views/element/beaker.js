define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');
    //var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Colors = require('common/colors/colors');

    var ThermalElementView = require('views/element/thermal');

    var Constants = require('constants');
    var BV = Constants.BeakerView;

    // Generate a texture to use as the steam particle
    var steamParticleTexture = PIXI.Texture.generateRoundParticleTexture(0, BV.STEAM_PARTICLE_RADIUS_RANGE.max, BV.STEAM_PARTICLE_COLOR);

    /**
     * A view that represents a block model
     */
    var BeakerView = ThermalElementView.extend({

        events: {
            'touchstart      .backLayer': 'dragStart',
            'mousedown       .backLayer': 'dragStart',
            'touchmove       .backLayer': 'drag',
            'mousemove       .backLayer': 'drag',
            'touchend        .backLayer': 'dragEnd',
            'mouseup         .backLayer': 'dragEnd',
            'touchendoutside .backLayer': 'dragEnd',
            'mouseupoutside  .backLayer': 'dragEnd',
        },

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                fillColor: BeakerView.FILL_COLOR,
                fillAlpha: BeakerView.FILL_ALPHA,
                lineWidth: BeakerView.LINE_WIDTH,
                lineColor: BeakerView.LINE_COLOR,
                lineJoin:  'round',
                textFont:  BeakerView.TEXT_FONT,

                fluidFillColor: BeakerView.WATER_FILL_COLOR,
                fluidFillAlpha: BeakerView.WATER_FILL_ALPHA,
                fluidLineColor: BeakerView.WATER_LINE_COLOR,
                fluidLineWidth: BeakerView.WATER_LINE_WIDTH,

                dragLayer: 'backLayer'
            }, options);

            this.fluidFillColor = options.fluidFillColor;
            this.fluidFillAlpha = options.fluidFillAlpha;
            this.fluidLineColor = options.fluidLineColor;
            this.fluidLineWidth = options.fluidLineWidth;

            this.fluidFillColorHex = Colors.parseHex(this.fluidFillColor);
            this.fluidLineColorHex = Colors.parseHex(this.fluidLineColor);

            ThermalElementView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:fluidLevel', this.updateFluidLevel);
            this.updateFluidLevel(this.model, this.model.get('fluidLevel'));
        },

        initGraphics: function() {
            this.backLayer        = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer       = new PIXI.DisplayObjectContainer();
            
            // Get a version of the rectangle that defines the beaker size and
            //   location in the view.
            this.beakerViewRect = this.mvt.modelToViewScale(this.model.getRawOutlineRect()).clone();
            this.ellipseHeight = this.beakerViewRect.w * BeakerView.PERSPECTIVE_PROPORTION;
            
            this.initBeaker();
            this.initFluid();
            this.initLabel();
            this.initEnergyChunks(this.energyChunkLayer);
            this.initSteam();

            this.initDebugSlices();
            
            // Calculate the bounding box for the dragging bounds
            this.boundingBox = this.beakerViewRect.clone();
        },

        initDebugSlices: function() {
            this.debugLayer = new PIXI.DisplayObjectContainer();

            this.debugSlicesGraphics = new PIXI.Graphics();
            this.debugLayer.addChild(this.debugSlicesGraphics);

            this.debugSliceColors = [];
            for (var i = 0; i < this.model.slices.length; i++) {
                this.debugSliceColors[i] = Math.random() * 0xAAAAAA;
            }
        },

        initBeaker: function() {
            // Create the shapes for the top and bottom of the beaker.  These are
            //   ellipses in order to create a 3D-ish look.
            var backCurves  = new PiecewiseCurve();
            var frontCurves = new PiecewiseCurve();
            var backFill  = new PiecewiseCurve();
            var frontFill = new PiecewiseCurve();

            var top    = this.beakerViewRect.bottom() - this.beakerViewRect.h;
            var bottom = this.beakerViewRect.bottom();
            var left   = this.beakerViewRect.left();
            var right  = this.beakerViewRect.right();
            var ellipseHeight = this.ellipseHeight;

            // Front fill
            frontFill
                .moveTo(left, bottom)
                .curveTo(
                    left,  bottom + ellipseHeight / 2,
                    right, bottom + ellipseHeight / 2,
                    right, bottom
                )
                .lineTo(right, top)
                .curveTo(
                    right, top + ellipseHeight / 2,
                    left,  top + ellipseHeight / 2,
                    left,  top
                )
                .lineTo(left, bottom)
                .close();
            // Back fill (the top little ellipse area)
            backFill
                .moveTo(left, top)
                .curveTo(
                    left,  top - ellipseHeight / 2,
                    right, top - ellipseHeight / 2,
                    right, top
                )
                .moveTo(left, top)
                .curveTo(
                    left,  top + ellipseHeight / 2,
                    right, top + ellipseHeight / 2,
                    right, top
                );

            var fillStyle = {
                lineWidth: 0,
                fillStyle: this.fillColor,
                fillAlpha: this.fillAlpha
            };

            this.frontLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(frontFill, fillStyle));
            this.backLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(backFill, fillStyle));

            // Top back curve
            backCurves
                .moveTo(left, top)
                .curveTo(
                    left,  top - ellipseHeight / 2,
                    right, top - ellipseHeight / 2,
                    right, top
                );
            // Top front curve
            frontCurves
                .moveTo(left, top)
                .curveTo(
                    left,  top + ellipseHeight / 2,
                    right, top + ellipseHeight / 2,
                    right, top
                );
            // Bottom back curve
            backCurves
                .moveTo(left, bottom)
                .curveTo(
                    left,  bottom - ellipseHeight / 2,
                    right, bottom - ellipseHeight / 2,
                    right, bottom
                );
            // Bottom front curve
            frontCurves
                .moveTo(left, bottom)
                .curveTo(
                    left,  bottom + ellipseHeight / 2,
                    right, bottom + ellipseHeight / 2,
                    right, bottom
                );
            // Vertical edges
            frontCurves
                .moveTo(left, bottom)
                .lineTo(left, top)
                .moveTo(right, bottom)
                .lineTo(right, top);


            // Outline style
            var lineStyle = {
                lineWidth:   this.lineWidth,
                strokeStyle: this.lineColor,
                lineJoin:    this.lineJoin
            };

            this.backLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(backCurves, lineStyle));
            this.frontLayer.addChild(PIXI.Sprite.fromPiecewiseCurve(frontCurves, lineStyle));
        },

        initFluid: function() {
            var left  = this.beakerViewRect.left();
            var right = this.beakerViewRect.right();
            var ellipseHeight = this.ellipseHeight;

            var fluidTopCurve = new PiecewiseCurve();
            fluidTopCurve
                .moveTo(left, 0)
                .curveTo(
                    left,  -ellipseHeight / 2,
                    right, -ellipseHeight / 2,
                    right, 0
                )
                .curveTo(
                    right, ellipseHeight / 2,
                    left,  ellipseHeight / 2,
                    left,  0
                );

            var fluidStyle = {
                fillStyle:   this.fluidFillColor,
                fillAlpha:   this.fluidFillAlpha,
                strokeStyle: this.fluidLineColor,
                lineWidth:   this.fluidLineWidth
            };

            this.fluidTop = PIXI.Sprite.fromPiecewiseCurve(fluidTopCurve, fluidStyle);
            this.fluidFront = new PIXI.Graphics();

            this.fluidLayer = new PIXI.DisplayObjectContainer();
            this.fluidLayer.addChild(this.fluidFront);
            this.fluidLayer.addChild(this.fluidTop);

            this.frontLayer.addChildAt(this.fluidLayer, 0);

            this.fluidMask = new PIXI.Graphics();
            this.frontLayer.addChild(this.fluidMask);
        },

        initLabel: function() {
            // Label
            this.label = new PIXI.Text(this.labelText, {
                font: this.textFont,
                fill: this.textColor
            });
            this.label.anchor.x = this.label.anchor.y = 0.5;
            this.label.x = 0;
            this.label.y = -(this.beakerViewRect.h / 2);
            this.frontLayer.addChild(this.label);
        },

        initEnergyChunks: function(energyChunkLayer) {
            ThermalElementView.prototype.initEnergyChunks.apply(this, [energyChunkLayer]);

            energyChunkLayer.mask = this.fluidMask;
        },

        initSteam: function() {
            this.steamLayer = new PIXI.SpriteBatch();
            this.fluidLayer.addChild(this.steamLayer);

            this.activeSteamParticles = [];
            this.dormantSteamParticles = [];
            var particle;
            for (var i = 0; i < BeakerView.NUM_STEAM_PARTICLES; i++) {
                particle = new PIXI.Sprite(steamParticleTexture);
                particle.visible = false;
                this.steamLayer.addChild(particle);
                this.dormantSteamParticles.push(particle);
            }

            this.particleProductionRemainder = 0;
        },

        activateSteamParticle: function(time, scale, x, y) {
            if (!this.dormantSteamParticles.length)
                return null;

            var particle = this.dormantSteamParticles.pop();
            particle.x = x;
            particle.y = y;
            particle.scale.x = particle.scale.y = scale;
            particle.anchor.x = particle.anchor.y = 0.5;
            particle.alpha = 0;
            particle.visible = true;
            particle.timeToLive = BeakerView.STEAM_PARTICLE_LIFE_RANGE.random();
            particle.lifeEndsAt = time + particle.timeToLive;
            this.activeSteamParticles.push(particle);

            return particle;
        },

        reset: function() {
            ThermalElementView.prototype.reset.apply(this);

            
        },

        calculateDragBounds: function(dx, dy) {
            var bounds = this.backLayer.getBounds();
            return this._dragBounds.set(
                bounds.x + dx,
                bounds.y + dy,
                bounds.width,
                bounds.height - this.lineWidth
            );
        },

        showEnergyChunks: function() {
            this.fluidTop.alpha = this.fluidFront.alpha = 0.8;
            this.energyChunkLayer.visible = true;
        },

        hideEnergyChunks: function() {
            this.fluidTop.alpha = this.fluidFront.alpha = 1;
            this.energyChunkLayer.visible = false;
        },

        updateFluidLevel: function(model, fluidLevel) {
            var top    = (this.beakerViewRect.bottom() - this.beakerViewRect.h) * fluidLevel;
            var bottom = this.beakerViewRect.bottom();
            var left   = this.beakerViewRect.left();
            var right  = this.beakerViewRect.right();
            var ellipseHeight = this.ellipseHeight;

            this.fluidTop.y = top;

            this.fluidFront
                .clear()
                .beginFill(this.fluidFillColorHex, this.fluidFillAlpha)
                .lineStyle(this.fluidLineWidth, this.fluidLineColorHex, 1)
                .moveTo(left, top)
                .bezierCurveTo(
                    left,  top + ellipseHeight / 2,
                    right, top + ellipseHeight / 2,
                    right, top
                )
                .lineTo(right, bottom)
                .bezierCurveTo(
                    right, bottom + ellipseHeight / 2,
                    left,  bottom + ellipseHeight / 2,
                    left,  bottom
                )
                .lineTo(left, top)
                .endFill();

            this.fluidMask
                .clear()
                .beginFill(0x000000, 1)
                .moveTo(left, top)
                .bezierCurveTo(
                    left,  top -ellipseHeight / 2,
                    right, top -ellipseHeight / 2,
                    right, top
                )
                .lineTo(right, bottom)
                .bezierCurveTo(
                    right, bottom + ellipseHeight / 2,
                    left,  bottom + ellipseHeight / 2,
                    left,  bottom
                )
                .lineTo(left, top)
                .moveTo(left + 20, bottom - 20)
                .lineTo(left + 40, bottom - 40)
                .lineTo(left + 60, bottom - 20)
                .lineTo(left + 20, bottom - 20)
                .endFill();
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        },

        updateSteam: function(time, deltaTime) {
            var fluidTop = (this.beakerViewRect.bottom() - this.beakerViewRect.h) * this.model.get('fluidLevel');

            var steamingProportion = 0;
            if (Constants.BOILING_POINT_TEMPERATURE - this.model.getTemperature() < BeakerView.STEAMING_RANGE) {
                // Water is emitting some amount of steam.  Set the proportionate amount.
                steamingProportion = 1 - ((Constants.BOILING_POINT_TEMPERATURE - this.model.getTemperature()) / BeakerView.STEAMING_RANGE);
                steamingProportion = Math.min(1, Math.max(steamingProportion, 0));
            }
            //steamingProportion = 0.7;
            //console.log(this.model.getTemperature());

            // Add any new steam particles
            if (steamingProportion > 0) {
                var particlesToProduce = BeakerView.STEAM_PARTICLE_PRODUCTION_RATE_RANGE.lerp(steamingProportion) * deltaTime;
                
                this.particleProductionRemainder += particlesToProduce % 1;
                if (this.particleProductionRemainder >= 1) {
                    particlesToProduce += Math.floor(this.particleProductionRemainder);
                    this.particleProductionRemainder -= Math.floor(this.particleProductionRemainder);
                }
                particlesToProduce = Math.floor(particlesToProduce);

                var startingScale;
                var x;
                for (var k = 0; k < particlesToProduce; k++) {
                    startingScale = BeakerView.STEAM_PARTICLE_RADIUS_RANGE.random() / BeakerView.STEAM_PARTICLE_RADIUS_RANGE.max;
                    x = (Math.random() - 0.5) * (this.beakerViewRect.w - steamParticleTexture.width);
                    this.activateSteamParticle(time, startingScale, x, fluidTop);
                }
            }

            // Update existing steam particles
            var speed = BeakerView.STEAM_PARTICLE_SPEED_RANGE.lerp(steamingProportion);
            var unfilledBeakerHeight = this.beakerViewRect.h * (1 - this.model.get('fluidLevel'));
            var fadeInDistance = unfilledBeakerHeight / 4;
            var centerX = 0;

            var particle;
            for (var i = this.activeSteamParticles.length - 1; i >= 0; i--) {
                particle = this.activeSteamParticles[i];
                particle.y += deltaTime * -speed;

                if (time >= particle.lifeEndsAt) {
                    particle.visible = false;
                    this.activeSteamParticles.splice(i, 1);
                    this.dormantSteamParticles.push(particle);
                }
                else if (particle.y < -this.beakerViewRect.h) {
                    var scale = particle.scale.x * (1 + BeakerView.STEAM_PARTICLE_GROWTH_RATE * deltaTime);
                    particle.scale.x = particle.scale.y = scale;
                    var distanceFromCenterX = particle.x - centerX;
                    particle.x += distanceFromCenterX * 0.2 * deltaTime;

                    // Fade the particle out as it reaches the end of its life
                    particle.alpha = ((particle.lifeEndsAt - time) / particle.timeToLive) * BeakerView.MAX_STEAM_PARTICLE_OPACITY;
                }
                else {
                    // Fade the particle in
                    var distanceFromWater = fluidTop - particle.y;
                    particle.alpha = Math.min(1, Math.max(0, (distanceFromWater / fadeInDistance))) * BeakerView.MAX_STEAM_PARTICLE_OPACITY;
                }
            }
        },

        update: function(time, deltaTime, simulationPaused) {
            ThermalElementView.prototype.update.apply(this, [time, deltaTime, simulationPaused]);
            if (!simulationPaused) {
                this.updateSteam(time, deltaTime);

                // this.debugSlicesGraphics.clear();
                // for (var i = 0; i < this.model.slices.length; i++) {
                //     this.debugSlicesGraphics.lineStyle(2, this.debugSliceColors[i], 0.5);
                //     this.debugSlicesGraphics.drawPiecewiseCurve(this.mvt.modelToView(this.model.slices[i].getShape()));
                // }
            }
        }

    }, Constants.BeakerView);

    return BeakerView;
});