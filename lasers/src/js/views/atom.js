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
            this.mvt = options.mvt;
            
            this.initGraphics();

            this.listenTo(this.model, 'change:position',    this.updatePosition);
            this.listenTo(this.model, 'change:currentState', this.updateAtomicState);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.energyLevelGraphics = new PIXI.Graphics();

            this.atomSprite = Assets.createSprite(Assets.Images.SPHERE);
            this.atomSprite.anchor.x = 0.5;
            this.atomSprite.anchor.y = 0.5;

            this.label = new PIXI.Text('1', {
                font: 'bold 18px Helvetica Neue',
                fill: '#fff'
            });
            this.label.resolution = this.getResolution();
            this.label.anchor.x = 0.5;
            this.label.anchor.y = 0.5;

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

            this.updatePosition(this.model, this.model.get('position'));
            this.updateAtomicState(this.model, this.model.get('currentState'));
        },

        updateAtomicState: function(model, currentState) {
            var graphics = this.energyLevelGraphics;

            graphics.clear();
            graphics.beginFill(this.getEnergyLevelColor(), 1);
            graphics.drawCircle(0, 0, this.getEnergyLevelRadius());
            graphics.endFill();

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
            var state = atom.getCurrentState();

            // Determine the thickness of the colored ring that represents the energy
            var groundStateRingThickness = 2;
            var de1 = atom.getHighestEnergyState().getEnergyLevel() - atom.getGroundState().getEnergyLevel();
            var de2 = state.getEnergyLevel() - atom.getGroundState().getEnergyLevel();
            var maxRingThickness = 6;
            var baseAtomRadius = this.atomSprite.width / 2;
            var radius = maxRingThickness * de2 / de1 + groundStateRingThickness + baseAtomRadius;

            return radius;
        }

    });


    return AtomView;
});