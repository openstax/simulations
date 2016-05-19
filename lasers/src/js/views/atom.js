define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView         = require('common/v3/pixi/view');
    var Colors           = require('common/colors/colors');
    var WavelengthColors = require('common/colors/wavelength');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var Assets = require('assets');

    /**
     * 
     */
    var AtomView = PixiView.extend({

        /**
         * Initializes the new AtomView.
         */
        initialize: function(options) {
            options = _.extend({
                showEnergyLevel: true
            }, options);

            this.mvt = options.mvt;
            this.showEnergyLevel = options.showEnergyLevel;
            
            this.initGraphics();

            this.listenTo(this.model, 'change:position',    this.updatePosition);
            this.listenTo(this.model, 'change:currentState', this.updateAtomicState);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.energyLevelGraphics = new PIXI.Graphics();
            this.energyLevelGraphics.visible = this.showEnergyLevel;

            this.atomSprite = AtomView.createSprite();

            this.label = new PIXI.Text('1', {
                font: 'bold 18px Helvetica Neue',
                fill: '#fff'
            });
            this.label.resolution = this.getResolution();
            this.label.anchor.x = 0.5;
            this.label.anchor.y = 0.5;
            this.label.visible = this.showEnergyLevel;

            this.displayObject.addChild(this.energyLevelGraphics);
            this.displayObject.addChild(this.atomSprite);
            this.displayObject.addChild(this.label);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(this.model.get('radius') * 2);
            var scale = targetWidth / this.atomSprite.texture.width;
            this.atomSprite.scale.x = scale;
            this.atomSprite.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
            this.updateAtomicState(this.model, this.model.get('currentState'));
        },

        updateAtomicState: function(model, currentState) {
            if (!this.showEnergyLevel)
                return;

            var graphics = this.energyLevelGraphics;

            graphics.clear();
            graphics.beginFill(this.getEnergyLevelColor(), 1);
            graphics.drawCircle(0, 0, this.getEnergyLevelRadius());
            graphics.endFill();

            var modelRadius = this.mvt.viewToModelDeltaX(this.getEnergyLevelRadius());
            this.model.set('radius', modelRadius);

            var energyLevelNumber = this.model.getCurrentStateNumber() + 1;
            this.label.text = energyLevelNumber;
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        getEnergyLevelColor: function() {
            var groundStateEnergy = this.model.getGroundState().getEnergyLevel();
            var energy = this.model.getCurrentState().getEnergyLevel();

            if (energy === groundStateEnergy)
                return '#000';

            var deltaEnergy = energy - groundStateEnergy;
            var hex = WavelengthColors.nmToHex(PhysicsUtil.energyToWavelength(deltaEnergy));

            return Colors.parseHex(hex);
        },

        getEnergyLevelRadius: function() {
            var atom = this.model;

            var baseAtomRadius = this.atomSprite.width / 2;
            var highestState = atom.getHighestEnergyState();
            var groundState = atom.getGroundState();
            var currentState = atom.getCurrentState();

            return AtomView.getEnergyLevelRadius(baseAtomRadius, groundState, currentState, highestState);
        }

    }, {

        createSprite: function() {
            var sprite = new PIXI.Sprite(AtomView.getTexture());
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.tint = 0xBBBBBB;
            return sprite;
        },

        getTexture: function() {
            return Assets.Texture(Assets.Images.SPHERE);
        },

        getTextureWidth: function() {
            return AtomView.getTexture().width;
        },

        getEnergyLevelRadius: function(baseAtomRadius, groundState, currentState, highestState) {
            var groundStateRingThickness = 2;
            var de1 = highestState.getEnergyLevel() - groundState.getEnergyLevel();
            var de2 = currentState.getEnergyLevel() - groundState.getEnergyLevel();
            var maxRingThickness = 6;
            var radius = (de2 === 0) ? 
                groundStateRingThickness + baseAtomRadius :
                maxRingThickness * de2 / de1 + groundStateRingThickness + baseAtomRadius;

            return radius;
        }

    });


    return AtomView;
});