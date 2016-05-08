define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                           require('common/v3/pixi/create-drop-shadow');
                           require('common/v3/pixi/draw-stick-arrow');
    var AppView          = require('common/v3/app/app');
    var PixiView         = require('common/v3/pixi/view');
    var Colors           = require('common/colors/colors');
    var WavelengthColors = require('common/colors/wavelength');
    var Rectangle        = require('common/math/rectangle');
    var Functions        = require('common/math/functions');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var EnergyLevelView = require('views/energy-level');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * 
     */
    var EnergyLevelPanelView = PixiView.extend({

        width: 300,
        height: 200,

        /**
         * Initializes the new EnergyLevelPanelView.
         */
        initialize: function(options) {
            options = _.extend({
                padding: 15,
                bgColor: '#f5f5f5',
                bgAlpha: 0.75,
                axisLineColor: '#000',
                axisLineAlpha: 1
            }, options);

            // Required options
            this.simulation = options.simulation;

            // Optional options
            this.padding = options.padding;
            this.bgColor = Colors.parseHex(options.bgColor);
            this.bgAlpha = options.bgAlpha;
            this.axisLineColor = Colors.parseHex(options.axisLineColor);
            this.axisLineAlpha = options.axisLineAlpha;

            this.energyLevelViews = [];

            // Initialize the graphics
            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initAxis();

            this.energyLevelsLayer = new PIXI.Container();
            this.displayObject.addChild(this.energyLevelsLayer);

            this.createEnergyLevels();
        },

        initPanel: function() {
            // Draw the shadow
            var rectangle = new Rectangle(0, 0, this.width, this.height);
            var shadow = PIXI.createDropShadow(rectangle);
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.bgColor, this.bgAlpha);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initAxis: function() {
            var labelWidth = 20;
            var x = this.padding + labelWidth;
            var y0 = this.height - this.padding;
            var y1 = this.padding;
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(2, this.axisLineColor, this.axisLineAlpha);
            graphics.drawStickArrow(x, y0, x, y1, 12, 10);

            var text = new PIXI.Text('Energy (eV)', {
                font: 'bold 12px Helvetica Neue',
                fill: '#000'
            });
            text.resolution = this.getResolution();
            text.rotation = -Math.PI / 2;
            text.anchor.y = 0;
            text.anchor.x = 0.5;
            text.x = this.padding;
            text.y = this.height / 2;

            this.displayObject.addChild(graphics);
            this.displayObject.addChild(text);

            this.axisOriginX = x;
        },

        createEnergyLevels: function() {
            var x = this.axisOriginX + 10;
            var width = this.width - x - this.padding;
            var minY = this.padding + 16;
            var maxY = this.height - this.padding - 10;

            var groundStateEnergy = this.simulation.getGroundState().getEnergyLevel();
            var energyToY = Functions.createLinearFunction(
                groundStateEnergy + PhysicsUtil.wavelengthToEnergy(WavelengthColors.MIN_WAVELENGTH),
                groundStateEnergy,
                minY,
                maxY
            );

            var states = this.simulation.getStates();
            for (var i = 0; i < states.length; i++) {
                var energyLevelView = new EnergyLevelView({
                    simulation: this.simulation,
                    model: states[i],
                    energyToY: energyToY,
                    minY: minY,
                    maxY: maxY,
                    groundStateEnergy: groundStateEnergy,
                    width: width,
                    levelNumber: i + 1,
                    wavelengthChangeEnabled: (i > 0),
                    lifetimeChangeEnabled: (i > 0)
                });
                energyLevelView.displayObject.x = x;

                this.energyLevelsLayer.addChild(energyLevelView.displayObject);
            }
        },

    }, Constants.EnergyLevelPanelView);


    return EnergyLevelPanelView;
});