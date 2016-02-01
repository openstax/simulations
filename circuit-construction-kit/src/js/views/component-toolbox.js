define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView   = require('common/v3/app/app');
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var Rectangle = require('common/math/rectangle');

    var Constants = require('constants');

    /**
     * 
     */
    var ComponentToolbox = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                x: 0,
                y: 0,
                width:  Constants.TOOLBOX_WIDTH,
                padding: Constants.TOOLBOX_PADDING,
                spacing: Constants.TOOLBOX_ITEM_SPACING,
                topToBottom: true,
                columns: 1,

                icons: [],

                fillColor: '#fff',
                fillAlpha: 0.7
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;

            this.x = options.x;
            this.y = options.y;
            this.width = options.width;
            this.padding = options.padding;
            this.spacing = options.spacing;
            this.topToBottom = options.topToBottom;
            this.columns = options.columns;

            this.iconConstructors = options.icons;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            // Cached objects
            this._bounds = new Rectangle();

            this.initGraphics();

            this.listenTo(this.simulation.circuit, 'change:schematic', this.schematicModeChanged);
        },

        initGraphics: function() {
            this.initBackground();
            this.initIconsContainer();
            this.initIcons();

            this.updateMVT(this.mvt);
        },

        initBackground: function() {
            this.background = new PIXI.Graphics();
            this.displayObject.addChild(this.background);
        },

        initIconsContainer: function() {
            this.iconsContainer = new PIXI.Container();
            this.iconsContainer.y = this.topToBottom ? this.padding : -this.padding;
            this.iconsContainer.x = this.padding;
            this.displayObject.addChild(this.iconsContainer);
        },

        initIcons: function() {
            var iconWidth = this.getIconWidth();
            var maxHeight = this.getIconMaxHeight();

            this.icons = [];
            for (var i = 0; i < this.iconConstructors.length; i++) {
                var icon = new this.iconConstructors[i]({
                    width: iconWidth,
                    maxHeight: maxHeight,
                    labelFontSize: AppView.windowIsShort() ? Constants.TOOLBOX_SHORT_SCREEN_LABEL_FONT_SIZE : Constants.TOOLBOX_LABEL_FONT_SIZE,
                    mvt: this.mvt,
                    simulation: this.simulation,
                    dummyLayer: this.dummyLayer
                });
                this.icons.push(icon);
                this.iconsContainer.addChild(icon.displayObject);
            }
        },

        getIconWidth: function() {
            return this.width - this.padding * 2;
        },

        getIconMaxHeight: function() {
            return Math.floor(this.getIconWidth() * 0.8);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateLayout();

            for (var i = 0; i < this.icons.length; i++)
                this.icons[i].updateMVT(mvt);
        },

        updateLayout: function() {
            this.displayObject.x = this.x;
            this.displayObject.y = this.y;

            if (this.columns > 1)
                this.layoutMultiColumn();
            else
                this.layoutSingleColumn();
        },

        layoutSingleColumn: function() {
            var i;
            var lastY;
            var lastH;
            if (this.topToBottom) {
                for (i = 1; i < this.icons.length; i++) {
                    lastY = this.icons[i - 1].displayObject.y;
                    lastH = this.icons[i - 1].displayObject.height;
                    this.icons[i].displayObject.y = lastY + lastH + this.spacing;
                }
            }
            else {
                lastY = 0;
                for (i = 0; i < this.icons.length; i++) {
                    var iconH = this.icons[i].displayObject.height;
                    this.icons[i].displayObject.y = lastY - iconH;

                    lastY = this.icons[i].displayObject.y - this.spacing;
                }
            }

            var backgroundHeight = this.iconsContainer.height + this.padding * 2;
            this.background.clear();
            this.background.beginFill(this.fillColor, this.fillAlpha);

            if (this.topToBottom)
                this.background.drawRect(0, 0, this.width, backgroundHeight);
            else
                this.background.drawRect(0, -backgroundHeight, this.width, backgroundHeight);

            this.background.endFill();
        },

        layoutMultiColumn: function() {
            // TODO: Either make this support more than 2 columns or change the name
            var i;
            var lastY;
            var lastH;
            var x = 0;
            if (this.topToBottom) {
                for (i = 1; i < this.icons.length; i++) {
                    if (i === Math.floor(this.icons.length / 2) + 1) {
                        lastY = this.icons[0].displayObject.y;
                        lastH = this.icons[0].displayObject.height;
                        x = this.width;
                    }
                    else {
                        lastY = this.icons[i - 1].displayObject.y;
                        lastH = this.icons[i - 1].displayObject.height;
                    }
                    this.icons[i].displayObject.y = lastY + lastH + this.spacing;
                    this.icons[i].displayObject.x = x;
                }
            }
            else {
                lastY = 0;
                for (i = 0; i < this.icons.length; i++) {
                    var iconH = this.icons[i].displayObject.height;

                    if (i === Math.floor(this.icons.length / 2) + 1) {
                        this.icons[i].displayObject.y = 0 - iconH;
                        x = this.width;
                    }
                    else {
                        this.icons[i].displayObject.y = lastY - iconH;
                    }

                    this.icons[i].displayObject.x = x;

                    lastY = this.icons[i].displayObject.y - this.spacing;
                }
            }

            var backgroundHeight = this.iconsContainer.height + this.padding * 2;
            var backgroundWidth = this.width * this.columns;
            this.background.clear();
            this.background.beginFill(this.fillColor, this.fillAlpha);

            if (this.topToBottom)
                this.background.drawRect(0, 0, backgroundWidth, backgroundHeight);
            else
                this.background.drawRect(0, -backgroundHeight, backgroundWidth, backgroundHeight);

            this.background.endFill();
        },

        setPosition: function(x, y) {
            this.x = x;
            this.y = y;
            this.updateLayout();
        },

        schematicModeChanged: function(circuit, schematic) {
            for (var i = 0; i < this.icons.length; i++)
                this.icons[i].updateIcon();

            this.updateLayout();
        }

    });


    return ComponentToolbox;
});