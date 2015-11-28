define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

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

            this.iconConstructors = options.icons;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            // Cached objects
            this._bounds = new Rectangle();

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBackground();
            this.initIcons();

            this.updateMVT(this.mvt);
        },

        initBackground: function() {
            this.background = new PIXI.Graphics();
            this.displayObject.addChild(this.background);
        },

        initIcons: function() {
            this.iconsContainer = new PIXI.Container();
            this.iconsContainer.y = this.topToBottom ? this.padding : -this.padding;
            this.iconsContainer.x = this.padding;
            this.displayObject.addChild(this.iconsContainer);

            var iconWidth = this.width - this.padding * 2;
            var maxHeight = Math.floor(iconWidth * 0.8);

            this.icons = [];
            for (var i = 0; i < this.iconConstructors.length; i++) {
                var icon = new this.iconConstructors[i]({
                    width: iconWidth,
                    maxHeight: maxHeight,
                    mvt: this.mvt,
                    simulation: this.simulation,
                    dummyLayer: this.dummyLayer
                });
                this.icons.push(icon);
                this.iconsContainer.addChild(icon.displayObject);
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateLayout();
        },

        updateLayout: function() {
            this.displayObject.x = this.x;
            this.displayObject.y = this.y;

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

        setPosition: function(x, y) {
            this.x = x;
            this.y = y;
            this.updateLayout();
        }

    });


    return ComponentToolbox;
});