define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A visual representation of some kind of object supply.  The
     *   user creates new objects with this view.  Dragging from 
     *   the view creates a new object and places it in the scene,
     *   while dragging an existing object back onto this view
     *   destroys it.
     */
    var ComponentToolboxIcon = PixiView.extend({

        events: {
            'touchstart      .icon': 'dragStart',
            'mousedown       .icon': 'dragStart',
            'touchend        .icon': 'dragEnd',
            'mouseup         .icon': 'dragEnd',
            'touchendoutside .icon': 'dragEnd',
            'mouseupoutside  .icon': 'dragEnd',
            'mouseover       .icon': 'hover',
            'mouseout        .icon': 'unhover'
        },

        initialize: function(options) {
            options = _.extend({
                width:  50,
                maxHeight: undefined,
                minHeight: 20,
                labelText: 'Component',
                labelFont: Constants.TOOLBOX_LABEL_FONT,
                labelFontSize: Constants.TOOLBOX_LABEL_FONT_SIZE,
                labelColor: Constants.TOOLBOX_LABEL_COLOR
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;

            this.width = options.width;
            this.maxHeight = (options.maxHeight !== undefined) ? options.maxHeight : this.width;
            this.minHeight = options.minHeight;
            this.labelText = options.labelText;
            this.labelFont = options.labelFont;
            this.labelFontSize = options.labelFontSize;
            this.labelColor = options.labelColor;

            // Cached objects
            this._point = new PIXI.Point();

            this.initGraphics();
        },

        initGraphics: function() {
            this.initIcon();
            this.initLabel();

            this.updateMVT(this.mvt);
        },

        initIcon: function() {
            this.icon = new PIXI.Container();
            this.icon.buttonMode = true;
            this.displayObject.addChild(this.icon);

            this.updateIconSprite();
        },

        updateIconSprite: function() {
            this.icon.removeChildren();

            var sprite;

            if (this.simulation.circuit.get('schematic'))
                sprite = this.createSchematicIconSprite();
            else
                sprite = this.createIconSprite();

            sprite.anchor.x = 0.5;
            sprite.x = this.width / 2;
            var scale;    
            if (sprite.texture.width > sprite.texture.height)
                scale = this.width / sprite.texture.width;
            else
                scale = this.maxHeight / sprite.texture.height;
            sprite.scale.x = scale;
            sprite.scale.y = scale;

            this.icon.addChild(sprite);
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createIconSprite: function() {
            var icon = Assets.createSprite(Assets.Images.BULB_ON);
            return icon;
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createSchematicIconSprite: function() {
            return this.createIconSprite();
        },

        initLabel: function() {
            var textSettings = {
                font: this.labelFontSize + 'px ' + this.labelFont,
                fill: this.labelColor
            };

            var label = new PIXI.Text(this.labelText, textSettings);
            label.resolution = this.getResolution();
            label.anchor.x = 0.5;
            label.anchor.y = -0.11;
            label.x = this.width / 2;
            label.y = this.icon.height;

            this.label = label;

            this.displayObject.addChild(label);
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {},

        setJunctionPositions: function(dummyModel, x, y) {
            x = this.mvt.viewToModelX(x);
            y = this.mvt.viewToModelY(y);
            var dx = dummyModel.getX2() - dummyModel.getX1();
            var dy = dummyModel.getY2() - dummyModel.getY1();
            dummyModel.get('startJunction').setPosition(x - dx / 2, y - dy / 2);
            dummyModel.get('endJunction').setPosition(  x + dx / 2, y + dy / 2);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateHitArea();
        },

        setWidth: function(width) {

        },

        dragStart: function(event) {
            this.dragging = true;
            
            this.componentView = this.createComponentView(event.data.global.x, event.data.global.y);
            this.simulation.circuit.addBranch(this.componentView.model);
            this.dummyLayer.addChild(this.componentView.displayObject);
            this.dummyLayer.addChild(this.componentView.hoverLayer);

            this.componentView.dragStart(event);
        },

        dragEnd: function(event) {
            if (this.componentView && this.dragging) {
                var relativePoint = event.data.getLocalPosition(this.displayObject.parent, this._point);

                if (this.displayObject.parent.getLocalBounds().contains(relativePoint.x, relativePoint.y)) {
                    // Remove the model from the sim because it never left the toolbox
                    this.simulation.circuit.removeBranch(this.componentView.model);
                }
                else {
                    this.componentView.dragEnd(event);
                }

                this.componentView.remove();
                this.componentView = null;
            }

            this.dragging = false;
        },

        hover: function(event) {
            this.displayObject.alpha = 0.7;
        },

        unhover: function(event) {
            this.displayObject.alpha = 1;
        },

        updateIcon: function() {
            this.updateIconSprite();
            this.label.y = this.icon.height;
            this.updateHitArea();
        },

        updateHitArea: function() {
            this.icon.hitArea = new PIXI.Rectangle(0, 0, this.width, this.icon.height + this.label.height);
        }

    });


    return ComponentToolboxIcon;
});