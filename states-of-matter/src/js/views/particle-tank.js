define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView           = require('common/pixi/view');
    var ThermometerView    = require('common/pixi/view/thermometer');
    var Vector2            = require('common/math/vector2');
    var range              = require('common/math/range');
    var ModelViewTransform = require('common/math/model-view-transform');

    var Atom = require('models/atom');

    var Assets = require('assets');

    var Constants = require('constants');


    /**
     * A view that represents the particle tank
     */
    var ParticleTankView = PixiView.extend({

        events: {
            'touchstart      .lid': 'dragStart',
            'mousedown       .lid': 'dragStart',
            'touchmove       .lid': 'drag',
            'mousemove       .lid': 'drag',
            'touchend        .lid': 'dragEnd',
            'mouseup         .lid': 'dragEnd',
            'touchendoutside .lid': 'dragEnd',
            'mouseupoutside  .lid': 'dragEnd'
        },

        initialize: function(options) {
            options = _.extend({
                lidDraggable: true,
                showFinger: true
            }, options);

            this.simulation = options.simulation;
            this.lidDraggable = options.lidDraggable;
            this.showFinger = options.showFinger;

            this._leftConnectorPosition  = new Vector2();
            this._rightConnectorPosition = new Vector2();
            this._dragOffset = new PIXI.Point();

            // This is a hybrid PIXI/HTML view
            this.el = document.createElement('div');
            this.$el = $(this.el);

            this.initGraphics();

            this.listenTo(this.simulation, 'change:particleContainerHeight', this.particleContainerHeightChanged);
            this.listenTo(this.simulation, 'change:exploded', this.containerExplodedStateChanged);
            this.listenTo(this.simulation, 'particles-injected', this.particlesInjected);
            this.listenTo(this.simulation, 'particles-cleared', this.removeAllParticles);
            this.listenTo(this.simulation, 'particles-initialized', this.addInitialParticles);
        },

        initGraphics: function() {
            this.initTank();
            this.initLid();
            this.initThermometer();
            this.initReturnLidButton();
            this.initParticleContainer();
            this.initParticleTextures();
            this.addInitialParticles();
        },

        initTank: function() {
            this.tank = Assets.createSprite(Assets.Images.TANK);
            this.tank.anchor.x = 0.5;
            this.tank.anchor.y = 1;

            this.displayObject.addChild(this.tank);
        },

        initLid: function() {
            this.lidYRange = range({ max: -20, min: -20 - 255  });

            var lidSprite = Assets.createSprite(Assets.Images.TANK_LID);
            lidSprite.anchor.x = 0.5;
            lidSprite.anchor.y = 1;

            this.lid = new PIXI.DisplayObjectContainer();
            this.lid.y = this.lidYRange.min;
            this.lid.addChild(lidSprite);

            if (this.lidDraggable) {
                this.lid.buttonMode = true;
                this.lid.defaultCursor = 'ns-resize';
            }

            this.displayObject.addChild(this.lid);
        },

        initThermometer: function() {
            var thermometerView = new ThermometerView({

            });
            thermometerView.displayObject.x = -this.lid.width * 0.38;
            thermometerView.displayObject.y = 14;
            this.lid.addChild(thermometerView.displayObject);
        },

        initReturnLidButton: function() {
            // Create button
            var self = this;
            this.$button = $('<button class="btn return-lid-btn">Return Lid</button>');
            this.$button.on('click', function() {
                self.returnLidClicked();
            });

            // Add button
            this.$el.append(this.$button);
        },

        initParticleContainer: function() {
            // Distance from the edge of the image (in pixels) that the container inside starts
            var xOffsetFromEdge = 31;

            // A fudge factor--it's a limitation of using normalized diameters
            //   for the particle calculations and means that it's difficult to
            //   calculate it in a way that is satisfactory for all particle
            //   sizes, so it's easier just to come up with a value that looks
            //   nice.
            var particleSizeOffset = -2;
            xOffsetFromEdge += particleSizeOffset;

            // Create, position, and add container
            this.particleContainer = new PIXI.DisplayObjectContainer();
            this.particleContainer.x = -this.tank.width / 2 + xOffsetFromEdge;
            this.particleContainer.y = -19 - particleSizeOffset;

            this.displayObject.addChild(this.particleContainer);

            // Create particle layers for different atoms in a molecule
            this.lowerParticleLayer = new PIXI.SpriteBatch();
            this.upperParticleLayer = new PIXI.SpriteBatch();

            this.particleContainer.addChild(this.lowerParticleLayer);
            this.particleContainer.addChild(this.upperParticleLayer);

            // Set up model view transform for particles
            var particleContainerWidth = this.tank.width - (2 * xOffsetFromEdge);
            var scale = particleContainerWidth / Constants.CONTAINER_BOUNDS.w;
            this.mvt = ModelViewTransform.createOffsetScaleMapping(new Vector2(), scale, -scale);
        },

        initParticleTextures: function() {
            // Generate particle textures
            var lineWidth = ParticleTankView.PARTICLE_LINE_WIDTH;
            var lineColor = ParticleTankView.PARTICLE_LINE_COLOR;
            this.argonTexture    = PIXI.Texture.generateCircleTexture(this.mvt.modelToViewDeltaX(Atom.ArgonAtom.RADIUS),    Atom.ArgonAtom.COLOR,    lineWidth, lineColor);
            this.neonTexture     = PIXI.Texture.generateCircleTexture(this.mvt.modelToViewDeltaX(Atom.NeonAtom.RADIUS),     Atom.NeonAtom.COLOR,     lineWidth, lineColor);
            this.oxygenTexture   = PIXI.Texture.generateCircleTexture(this.mvt.modelToViewDeltaX(Atom.OxygenAtom.RADIUS),   Atom.OxygenAtom.COLOR,   lineWidth, lineColor);
            this.hydrogenTexture = PIXI.Texture.generateCircleTexture(this.mvt.modelToViewDeltaX(Atom.HydrogenAtom.RADIUS), Atom.HydrogenAtom.COLOR, lineWidth, lineColor);
        },

        addInitialParticles: function() {
            for (var i = 0; i < this.simulation.moleculeDataSet.numberOfAtoms; i++)
                this.addParticle(this.simulation.particles[i]);
        },

        addParticle: function(particleModel) {
            var texture;
            var layer;

            // Determine the layer and texture based on the type
            if (particleModel instanceof Atom.HydrogenAtom) {
                texture = this.hydrogenTexture;

                if (Math.random() <  ParticleTankView.PERCENT_HYDROGEN_ON_TOP)
                    layer = this.upperParticleLayer;
                else
                    layer = this.lowerParticleLayer;
            }
            else {
                layer = this.upperParticleLayer;

                if (particleModel instanceof Atom.ArgonAtom)
                    texture = this.argonTexture;
                else if (particleModel instanceof Atom.NeonAtom)
                    texture = this.neonTexture;
                else if (particleModel instanceof Atom.OxygenAtom)
                    texture = this.oxygenTexture;
            }

            var particle = new PIXI.Sprite(texture);
            particle.anchor.x = 0.5;
            particle.anchor.y = 0.5;
            particle.model = particleModel;

            layer.addChild(particle);

            this.updateParticle(particle);
        },

        removeParticle: function(particleModel) {
            var children;
            var i;

            children = this.lowerParticleLayer.children;
            for (i = 0; i < children.length; i++) {
                if (children[i].model === particleModel) {
                    this.lowerParticleLayer.removeChildAt(i);
                    break;
                }
            }
                this.updateParticle(children[i]);

            children = this.upperParticleLayer.children;
            for (i = 0; i < children.length; i++) {
                if (children[i].model === particleModel) {
                    this.upperParticleLayer.removeChildAt(i);
                    break;
                }
            }
        },

        removeAllParticles: function() {
            this.lowerParticleLayer.removeChildren();
            this.upperParticleLayer.removeChildren();
        },

        particlesInjected: function(particles, numParticlesInjected) {
            for (var i = particles.length - 1; i > particles.length - 1 - numParticlesInjected; i--)
                this.addParticle(particles[i]);
        },

        particleContainerHeightChanged: function(simulation, particleContainerHeight) {
            var relativeHeight = particleContainerHeight / Constants.CONTAINER_BOUNDS.h;

            this.lid.y = this.lidYRange.lerp(1 - relativeHeight);

            if (this.simulation.get('exploded')) {
                // Rotate the lid to create the visual appearance of it being
                //   blown off the top of the container.
                this.lid.rotation += this.rotationAmount;
            }
        },

        containerExplodedStateChanged: function(simulation, exploded) {
            if (exploded) {
                this.$button.show();

                var containerHeightAtExplosion = simulation.get('particleContainerHeight');
                this.rotationAmount = Math.PI / 100 + (Math.random() * Math.PI / 50);
                if (Math.random() > 0.5)
                    this.rotationAmount *= -1;
            }
            else {
                this.lid.rotation = 0;
                this.removeAllParticles();
                this.addInitialParticles();
            }
        },

        getLeftConnectorPosition: function() {
            return this._leftConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(-this.displayObject.width / 2, -37);
        },

        getRightConnectorPosition: function() {
            return this._rightConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(this.displayObject.width / 2, -37);
        },

        dragStart: function(data) {
            if (!this.lidDraggable)
                return;

            this.dragOffset = data.getLocalPosition(this.lid, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var local = data.getLocalPosition(this.displayObject, this._dragLocation);
                var y = local.y - this.dragOffset.y;
                
                if (y > this.lidYRange.max)
                    y = this.lidYRange.max;
                if (y < this.lidYRange.min)
                    y = this.lidYRange.min;
                    
                //this.lid.y = y;
                var rangePercent = this.lidYRange.percent(y);
                var targetHeight = Constants.CONTAINER_BOUNDS.h * (1 - rangePercent);
                this.simulation.set('targetContainerHeight', targetHeight);
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
            this.simulation.set('targetContainerHeight', this.simulation.get('particleContainerHeight'));
        },

        returnLidClicked: function() {
            this.simulation.returnLid();
            this.$button.hide();
        },

        update: function() {
            var children;
            var i;

            children = this.lowerParticleLayer.children;
            for (i = 0; i < children.length; i++)
                this.updateParticle(children[i]);

            children = this.upperParticleLayer.children;
            for (i = 0; i < children.length; i++)
                this.updateParticle(children[i]);
        },

        updateParticle: function(particle) {
            var viewPosition = this.mvt.modelToView(particle.model.position);
            particle.x = viewPosition.x;
            particle.y = viewPosition.y;
        }

    }, Constants.ParticleTankView);

    return ParticleTankView;
});