define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var ArrowView = require('common/pixi/view/arrow');

    var Constants = require('constants');


    var EFieldDetectorArrowView = ArrowView.extend({

        initialize: function(options) {
            options = _.extend({
                label: 'An Arrow',
                centerX: 0,
                centerY: 0,

                tailWidth: 8,

                headWidth: 20,
                headLength: 20,

                fillColor: Constants.EFieldDetectorView.DISPLAY_COLOR
            }, options);

            this.label = options.label;
            this.centerX = options.centerX;
            this.centerY = options.centerY;

            this.model = new ArrowView.ArrowViewModel({ minLength: null });
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
            value.y = 12;

            this.text = new PIXI.DisplayObjectContainer();
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
            this.model.centerOn(this.centerX, this.centerY, 0, length);

            if (length === 0)
                this.text.y = Math.round(-this.text.height / 2);
            else if (length > 0)
                this.text.y = Math.round(-this.text.height + 4)
            else
                this.text.y = 4;

            this.labelText.x = Math.round(-this.labelText.width / 2);
            this.valueText.x = Math.round(-this.valueText.width / 2);

            this.valueText.setText(Math.abs(Math.round(this.value)) + ' V/m');
        },

        setScale: function(scale) {
            this.scale = scale;
            this.update();
        },

        setValue: function(value) {
            this.value = value;
            this.update();
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

        showValue: function() {
            this.valueText.visible = true;
        },

        hideValue: function() {
            this.valueText.visible = false;
        }

    });

    return EFieldDetectorArrowView;
});
