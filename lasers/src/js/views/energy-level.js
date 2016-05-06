define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView          = require('common/v3/app/app');
    var PixiView         = require('common/v3/pixi/view');
    var Colors           = require('common/colors/colors');
    var WavelengthColors = require('common/colors/wavelength');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * 
     */
    var EnergyLevelView = PixiView.extend({

        events: {
            'touchstart      .dragHandle': 'dragStart',
            'mousedown       .dragHandle': 'dragStart',
            'touchmove       .dragHandle': 'drag',
            'mousemove       .dragHandle': 'drag',
            'touchend        .dragHandle': 'dragEnd',
            'mouseup         .dragHandle': 'dragEnd',
            'touchendoutside .dragHandle': 'dragEnd',
            'mouseupoutside  .dragHandle': 'dragEnd'
        },

        /**
         * Initializes the new EnergyLevelView.
         */
        initialize: function(options) {
            options = _.extend({
                levelNumber: 0,
                atomRadius: 6,
                wavelengthChangeEnabled: true,
                lifetimeChangeEnabled: true
            }, options);

            this.simulation = options.simulation;
            this.width = options.width;
            this.energyToY = options.energyToY;
            this.yToEnergy = options.yToEnergy ? options.yToEnergy : options.energyToY.createInverse();
            this.groundStateEnergy = options.groundStateEnergy;
            this.minY = options.minY;
            this.maxY = options.maxY;
            this.atomRadius = options.atomRadius;
            this.levelNumber = options.levelNumber;
            this.wavelengthChangeEnabled = options.wavelengthChangeEnabled;
            this.lifetimeChangeEnabled = options.lifetimeChangeEnabled;
            
            // Initialize the graphics
            this.initGraphics();

            this.listenTo(this.model, 'change:energyLevel', this.energyLevelChanged);
            this.energyLevelChanged(this.model, this.model.get('energyLevel'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var handleThickness = 20;
            this.dragHandle = new PIXI.Container();
            this.dragHandle.hitArea = new PIXI.Rectangle(0, -handleThickness / 2, this.width, handleThickness);
            this.dragHandle.buttonMode = true;

            this.wavelengthColorGraphics = new PIXI.Graphics();

            this.atomSprite = Assets.createSprite(Assets.Images.SPHERE);
            this.atomSprite.anchor.x = 0.5;
            this.atomSprite.anchor.y = 0.5;
            this.atomSprite.scale.x = this.atomSprite.scale.y = ((this.atomRadius * 2) / this.atomSprite.texture.width);
            this.atomSprite.x = this.width - 80;

            this.displayObject.addChild(this.wavelengthColorGraphics);
            this.displayObject.addChild(this.atomSprite);
            this.displayObject.addChild(this.dragHandle);
        },

        drawWavelengthColor: function() {
            var graphics = this.wavelengthColorGraphics;
            var color = Colors.parseHex(this.getColor());
            var radius = this.getRadius();
            var atomCenterX = this.atomSprite.x;

            graphics.clear();

            graphics.beginFill(color, 1);
            graphics.drawCircle(atomCenterX, 0, radius);
            graphics.endFill();

            graphics.lineStyle(2, color, 1);
            graphics.moveTo(0, 0);
            graphics.lineTo(atomCenterX, 0);
        },

        getColor: function() {
            var energy = this.model.getEnergyLevel();
            if (energy === this.groundStateEnergy)
                return '#000';

            var deltaEnergy = energy - this.groundStateEnergy;
            return WavelengthColors.nmToHex(PhysicsUtil.energyToWavelength(deltaEnergy));
        },

        getRadius: function() {
            if (this.model.getEnergyLevel() === this.groundStateEnergy)
                return this.atomRadius + 3;
            else
                return this.atomRadius + 10;
        },

        setMinY: function(minY) {
            this.minY = minY;
        },

        setMaxY: function(maxY) {
            this.maxY = maxY;
        },

        dragStart: function(event) {
            this.dragging = true;

            this.lastDragY = event.data.global.y;
        },

        drag: function(event) {
            if (this.dragging) {
                var dy = event.data.global.y - this.lastDragY;
                var newY = this.displayObject.y + dy;
                if (newY < this.minY)
                    newY = this.minY;
                if (newY > this.maxY)
                    newY = this.maxY;
                var newEnergy = this.yToEnergy(newY);
                this.model.set('energyLevel', newEnergy);

                this.lastDragY = event.data.global.y;
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        energyLevelChanged: function(model, energyLevel) {
            this.displayObject.y = this.energyToY(energyLevel);
            this.drawWavelengthColor();
        }

    });


    return EnergyLevelView;
});