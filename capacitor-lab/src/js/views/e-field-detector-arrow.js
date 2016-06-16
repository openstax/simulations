define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var ArrowView = require('common/v3/pixi/view/arrow');

    var Constants = require('constants');


    var EFieldDetectorArrowView = ArrowView.extend({

        initialize: function(options) {
            options = _.extend({
                label: 'An Arrow',

                tailWidth: 8,

                headWidth: 20,
                headLength: 20,

                fillColor: Constants.EFieldDetectorView.DISPLAY_COLOR
            }, options);

            this.label = options.label;

            this.model = new ArrowView.ArrowViewModel({
                originX: 0,
                originY: 0,
                targetX: 0,
                targetY: 0,
                minLength: null 
            });
            this.scale = 1;
            this.value = 0;

            ArrowView.prototype.initialize.apply(this, [ options ]);
        },

        initGraphics: function() {
            ArrowView.prototype.initGraphics.apply(this, arguments);

            var textStyle = {
                font: '11px Helvetica Neue',
                fill: Constants.EFieldDetectorView.DISPLAY_COLOR
            };

            var label = new PIXI.Text(this.label, textStyle);
            var value = new PIXI.Text('10 V/m', textStyle);
            label.resolution = this.getResolution();
            value.resolution = this.getResolution();
            value.y = 12;

            this.text = new PIXI.Container();
            this.text.addChild(label);
            this.text.addChild(value);
            this.displayObject.addChild(this.text);

            this.labelText = label;
            this.valueText = value;

            this.update();
            this.drawArrow();
        },

        update: function() {
            var length = this.value * this.scale;
            this.model.set('targetY', this.model.get('originY') + length);

            this.updateText();
        },

        updateText: function(defaultDirection) {
            var length = this.value * this.scale;
            if (length === 0 && !defaultDirection)
                this.text.y = Math.round(-this.text.height / 2);
            else if (length > 0 || (defaultDirection && defaultDirection < 0))
                this.text.y = Math.round(-this.text.height + 4);
            else
                this.text.y = 4;

            this.labelText.x = Math.round(-this.labelText.width / 2);
            this.valueText.x = Math.round(-this.valueText.width / 2);

            this.valueText.text = Math.abs(Math.round(this.value)) + ' V/m';
        },

        setScale: function(scale) {
            this.scale = scale;
            this.update();
        },

        setValue: function(value) {
            this.value = value;
            this.update();
        },

        alignTextAbove: function() {
            this.updateText(-1);
        },

        alignTextBelow: function() {
            this.updateText(1);
        },

        centerOn: function(x, y) {
            this.model.centerOn(x, y);
            this.updateText();
        },

        moveToY: function(y) {
            this.model.moveTo(this.model.get('originX'), y);
        },

        getTotalHeight: function() {
            return this.displayObject.height;
        },

        getArrowHeight: function() {
            return Math.abs(Math.round(this.value));
        },

        getTextHeight: function() {
            return this.text.height;
        },

        getOriginY: function() {
            return this.model.get('originY');
        },

        getTargetY: function() {
            return this.model.get('targetY');
        },

        showValue: function() {
            this.valueText.visible = true;
        },

        hideValue: function() {
            this.valueText.visible = false;
        }

    });

    return EFieldDetectorArrowView;
});
