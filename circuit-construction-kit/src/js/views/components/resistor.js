define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Colors      = require('common/colors/colors');

    var RectangularComponentView = require('views/components/rectangular');

    var Constants = require('constants');
    var BAND_COLORS = _.map(Constants.ResistorView.BAND_COLORS, function(color) {
        return Colors.parseHex(color);
    });

    var Assets = require('assets');

    /**
     * A view that represents a resistor
     */
    var ResistorView = RectangularComponentView.extend({

        imagePath:     Assets.Images.RESISTOR,
        maskImagePath: Assets.Images.RESISTOR_MASK,

        schematicImagePath:     Assets.Images.SCHEMATIC_RESISTOR,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_RESISTOR_MASK,

        contextMenuContent: 
            '<li><a class="change-resistance-btn"><span class="fa fa-bolt"></span>&nbsp; Change Resistance</a></li>' +
            '<li><a class="show-value-btn"><span class="fa fa-square-o"></span>&nbsp; Show Value</a></li>' +
            '<hr>' +
            RectangularComponentView.prototype.contextMenuContent,

        /**
         * Initializes the new ResistorView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:resistance', this.resistanceChanged);
        },

        initGraphics: function() {
            this.colorBands = new PIXI.Graphics();

            RectangularComponentView.prototype.initGraphics.apply(this, arguments);

            this.displayObject.addChild(this.colorBands);
            this.colorBands.y = -this.getBandHeight() / 2;
            this.drawColorBands();
        },

        initContextMenu: function($contextMenu) {
            RectangularComponentView.prototype.initContextMenu.apply(this, arguments);

            this.initShowValueMenuItem($contextMenu);
            this.initChangeResistanceMenuItem($contextMenu);
        },

        showResistanceControls: function(event) {
            this.model.set('selected', false);

            RectangularComponentView.prototype.showResistanceControls.apply(this, arguments);
        },

        getBandHeight: function() {
            return Math.floor((this.sprite.height - 1) / 2) * 2;
        },

        drawColorBands: function() {
            var height = this.getBandHeight();
            var width = 24;
            var startX = 90;
            var spacing = (340 - 90 * 2 - 24) / 3;

            var colors = this.getColors();
            var graphics = this.colorBands;
            graphics.clear();

            for (var i = 0; i < colors.length; i++) {
                graphics.beginFill(colors[i], 1);
                graphics.drawRect(startX + spacing * i, 0, width, height);
                graphics.endFill();
            }
        },

        getColors: function() {
            var resistance = this.model.get('resistance');
            var firstDigit;
            var secondDigit;

            // First 2 digits for value, third digit for scale.
            if (resistance < 10) {
                return [
                    BAND_COLORS[0], 
                    this.digitToColor(resistance), 
                    BAND_COLORS[0], 
                    BAND_COLORS[4]
                ];
            }
            else if (resistance < 100) {
                firstDigit  = Math.floor(resistance / 10);
                secondDigit = Math.floor(resistance % 10);
                return [
                    this.digitToColor(firstDigit), 
                    this.digitToColor(secondDigit), 
                    BAND_COLORS[0], 
                    BAND_COLORS[4]
                ];
            }
            else {
                var s = '' + resistance;
                firstDigit  = parseInt(s.charAt(0));
                secondDigit = parseInt(s.charAt(1));
                var factor = s.length - 2;

                var predicted = ((firstDigit * 10 + secondDigit) * Math.pow(10, factor));
                var offBy = (resistance - predicted) / predicted * 100;

                var colors = [
                    this.digitToColor(firstDigit), 
                    this.digitToColor(secondDigit), 
                    this.digitToColor(factor)
                ];

                if (offBy < 5)
                    colors.push(BAND_COLORS[4]);
                else if (offBy < 20)
                    colors.push(BAND_COLORS[8]);

                return colors;
            }
        },

        digitToColor: function(digit) {
            if (digit < 0 || digit >= 10)
                throw 'Out of range: ' + digit;

            return BAND_COLORS[digit];
        },

        resistanceChanged: function(model, resistance) {
            this.drawColorBands();
        },

        schematicModeChanged: function(circuit, schematic) {
            RectangularComponentView.prototype.schematicModeChanged.apply(this, arguments);

            this.colorBands.visible = !schematic;
        }

    }, Constants.ResistorView);

    return ResistorView;
});