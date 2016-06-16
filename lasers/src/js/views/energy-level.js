define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                           require('common/v3/pixi/draw-arrow');
    var PixiView         = require('common/v3/pixi/view');
    var SliderView       = require('common/v3/pixi/view/slider');
    var Colors           = require('common/colors/colors');
    var WavelengthColors = require('common/colors/wavelength');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var AtomView = require('views/atom');

    var Constants = require('constants');

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
                atomRadius: 8,
                wavelengthChangeEnabled: true,
                lifetimeChangeEnabled: true
            }, options);

            this.simulation = options.simulation;
            this.width = options.width;
            this.energyToY = options.energyToY;
            this.yToEnergy = options.yToEnergy ? options.yToEnergy : options.energyToY.createInverse();
            this.minY = options.minY;
            this.maxY = options.maxY;
            this.groundState = options.groundState;
            this.highestEnergyState = options.highestEnergyState;
            this.atomRadius = options.atomRadius;
            this.levelNumber = options.levelNumber;
            this.wavelengthChangeEnabled = options.wavelengthChangeEnabled;
            this.lifetimeChangeEnabled = options.lifetimeChangeEnabled;
            this.paddingLeft = 80;
            this.minLifetime = options.minLifetime;
            this.maxLifetime = options.maxLifetime;
            
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
            this.dragHandle.hitArea = new PIXI.Rectangle(0, -handleThickness / 2, this.width - this.paddingLeft + 10, handleThickness);
            if (this.wavelengthChangeEnabled)
                this.dragHandle.buttonMode = true;

            this.wavelengthColorGraphics = new PIXI.Graphics();

            this.atomSprite = AtomView.createSprite();
            this.atomSprite.scale.x = this.atomSprite.scale.y = ((this.atomRadius * 2) / this.atomSprite.texture.width);
            this.atomSprite.x = this.width - this.paddingLeft;

            this.label = new PIXI.Text(this.levelNumber, {
                font: '11px Helvetica Neue',
                fill: '#fff'
            });
            this.label.resolution = this.getResolution();
            this.label.anchor.x = 0.43;
            this.label.anchor.y = 0.5;
            this.label.x = this.atomSprite.x;

            if (this.wavelengthChangeEnabled) {
                var arrowX = Math.floor(this.atomSprite.x * 0.85);
                this.arrowGraphics = new PIXI.Graphics();
                this.arrowGraphics.beginFill(0xAAAAAA, 1);
                this.arrowGraphics.drawArrow(arrowX, 0, arrowX, -12, 4, 9, 7);
                this.arrowGraphics.drawArrow(arrowX, 0, arrowX,  12, 4, 9, 7);
                this.arrowGraphics.endFill();

                this.displayObject.addChild(this.arrowGraphics);
            }
            
            this.displayObject.addChild(this.wavelengthColorGraphics);
            this.displayObject.addChild(this.atomSprite);
            this.displayObject.addChild(this.dragHandle);
            this.displayObject.addChild(this.label);

            if (this.lifetimeChangeEnabled)
                this.initSlider();
        },

        initSlider: function() {
            var minWidth = 30;
            var maxWidth = 50;
            var width = minWidth + Math.floor((maxWidth - minWidth) * (this.maxLifetime / Constants.MAXIMUM_STATE_LIFETIME));

            // Create the slider view
            this.sliderView = new SliderView({
                start: this.model.get('meanLifetime'),
                range: {
                    min: this.minLifetime,
                    max: this.maxLifetime
                },

                width: width,

                backgroundHeight: 2,
                backgroundColor: '#000',
                backgroundAlpha: 0.12,

                // handleSize: 14
            });
            this.sliderView.displayObject.x = this.width - maxWidth;
            this.sliderView.displayObject.y = 0;
            

            // Bind events
            this.listenTo(this.sliderView, 'slide', this.slideLifetime);

            // Create the label
            var text = new PIXI.Text('Lifetime', {
                font: 'bold 12px Helvetica Neue',
                fill: '#000'
            });
            text.resolution = this.getResolution();
            text.anchor.x = 0.5;
            text.anchor.y = 1;
            text.x = this.sliderView.displayObject.x + width / 2;
            text.y = -8;

            this.displayObject.addChild(text);
            this.displayObject.addChild(this.sliderView.displayObject);
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
            if (energy === this.groundState.getEnergyLevel())
                return '#000';

            var deltaEnergy = energy - this.groundState.getEnergyLevel();
            return WavelengthColors.nmToHex(PhysicsUtil.energyToWavelength(deltaEnergy));
        },

        getRadius: function() {
            var highestState = this.highestEnergyState;
            var groundState = this.groundState;
            var currentState = this.model;
            var baseAtomRadius = this.atomSprite.width / 2;

            return AtomView.getEnergyLevelRadius(baseAtomRadius, groundState, currentState, highestState);
        },

        setMinY: function(minY) {
            this.minY = minY;
        },

        setMaxY: function(maxY) {
            this.maxY = maxY;
        },

        dragStart: function(event) {
            if (!this.wavelengthChangeEnabled)
                return;

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

        slideLifetime: function(value, prev) {
            this.model.set('meanLifetime', value);
        },

        energyLevelChanged: function(model, energyLevel) {
            this.displayObject.y = this.energyToY(energyLevel);
            this.drawWavelengthColor();
        }

    });


    return EnergyLevelView;
});