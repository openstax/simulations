define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var Colors  = require('common/colors/colors');
    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var CapacitorView              = require('views/capacitor');
    var DielectricTotalChargeView  = require('views/charge/dielectric-total');
    var DielectricExcessChargeView = require('views/charge/dielectric-excess');

    var Constants = require('constants');
    var Polarity = Constants.Polarity;

    /**
     * 
     */
    var CapacitanceControlledCapacitorView = CapacitorView.extend({

        initialize: function(options) {
            options = _.extend({
                handleColor: '#5c35a3',
                handleHoverColor: '#955cff',

                labelFontFamily: 'Helvetica Neue',
                labelFontSize: '14px',
                labelColor: '#000',
                labelAlpha: 1
            }, options);

            this.maxDielectricEField = options.maxDielectricEField;
            this.maxPlateCharge = options.maxPlateCharge;
            this.maxExcessDielectricPlateCharge = options.maxExcessDielectricPlateCharge;
            this.maxEffectiveEField = options.maxEffectiveEField;

            // Handle colors
            this.handleColor = Colors.parseHex(options.handleColor);
            this.handleHoverColor = Colors.parseHex(options.handleHoverColor);

            // Label text
            this.labelAlpha = options.labelAlpha;
            this.labelTitleStyle = {
                font: 'bold ' + options.labelFontSize + ' ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelTitleHoverStyle = _.clone(this.labelTitleStyle);
            this.labelTitleHoverStyle.fill = options.handleHoverColor;

            this.labelValueStyle = {
                font: options.labelFontSize + ' ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelValueHoverStyle = _.clone(this.labelValueStyle);
            this.labelValueHoverStyle.fill = options.handleHoverColor;

            // Cached objects

            CapacitorView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            CapacitorView.prototype.initGraphics.apply(this, arguments);

            
        },

        update: function() {
            CapacitorView.prototype.update.apply(this, arguments);


        },

    });

    return CapacitanceControlledCapacitorView;
});