define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Rectangle = require('common/math/rectangle');

    var GrabBag = require('views/grab-bag');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * 
     */
    var GrabBagButton = PixiView.extend({

        events: {
            'click     .background' : 'click',
            'mouseover .background' : 'hover',
            'mouseout  .background' : 'unhover'
        },

        initialize: function(options) {
            options = _.extend({
                width:  Constants.TOOLBOX_WIDTH,
                padding: Constants.TOOLBOX_PADDING,
                labelText: 'Grab Bag',
                labelFont: Constants.TOOLBOX_LABEL_FONT,
                labelColor: Constants.TOOLBOX_LABEL_COLOR,

                icons: [],

                fillColor: '#fff',
                fillAlpha: 0.7
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;

            this.width = options.width;
            this.padding = options.padding;
            this.paddingBottom = this.padding + 15;
            this.margin = 15;
            this.labelText = options.labelText;
            this.labelFont = options.labelFont;
            this.labelColor = options.labelColor;
            this.margin = 15;

            this.icons = options.icons;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            // Cached objects
            this._bounds = new Rectangle();

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBackground();
            this.initIcon();
            this.initLabel();
            this.initGrabBag();

            this.updateMVT(this.mvt);
            this.updateSize();
        },

        initBackground: function() {
            this.background = new PIXI.Graphics();
            this.background.buttonMode = true;
            this.displayObject.addChild(this.background);
        },

        initIcon: function() {
            this.icon = Assets.createSprite(Assets.Images.GRAB_BAG);
            this.icon.anchor.y = 1;
            this.icon.x = this.padding;
            this.icon.y = -this.paddingBottom;
            this.displayObject.addChild(this.icon);
        },

        initLabel: function() {
            var textSettings = {
                font: this.labelFont,
                fill: this.labelColor
            };

            var label = new PIXI.Text(this.labelText, textSettings);
            label.anchor.x = 0.5;
            label.x = this.width / 2;
            label.y = -this.paddingBottom + 5;
            label.resolution = 2;

            this.label = label;

            this.displayObject.addChild(label);
        },

        initGrabBag: function() {
            this.grabBag = new GrabBag({
                x: this.width + this.margin,
                y: 0,

                icons: this.icons,
                mvt: this.mvt,
                simulation: this.simulation,
                dummyLayer: this.dummyLayer
            });
            this.grabBag.hide();
            this.displayObject.addChild(this.grabBag.displayObject);
        },

        drawBackground: function() {
            var backgroundHeight = this.icon.height + this.paddingBottom + this.padding;
            var background = this.background;
            background.clear();
            background.beginFill(this.fillColor, this.fillAlpha);
            background.drawRect(0, -backgroundHeight, this.width, backgroundHeight);
            background.endFill();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            
        },

        updateSize: function() {
            var targetIconWidth = this.width - this.padding * 2;
            var scale = targetIconWidth / this.icon.texture.width;
            this.icon.scale.x = scale;
            this.icon.scale.y = scale;

            this.grabBag.setAnchor(this.width + 5, -this.paddingBottom - (this.icon.height / 2));

            this.drawBackground();
        },

        setWidth: function(width) {
            this.width = width;
            this.updateSize();
        },

        click: function(event) {
            if (this.grabBag.displayObject.visible)
                this.grabBag.hide();
            else
                this.grabBag.show();
        },

        hover: function(event) {
            this.background.alpha = this.icon.alpha = this.label.alpha = 0.9;
        },

        unhover: function(event) {
            this.background.alpha = this.icon.alpha = this.label.alpha = 1;
        },

        parentOf: function(displayObject) {
            var parent = displayObject.parent;
            while (parent) {
                if (parent === this.displayObject)
                    return true;
                parent = parent.parent;
            }
            return false;
        },

        hideGrabBagMenu: function() {
            this.grabBag.hide();
        }

    });


    return GrabBagButton;
});