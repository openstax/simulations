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
            'touchmove       .icon': 'drag',
            'mousemove       .icon': 'drag',
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
                labelText: 'Component',
                labelFont: Constants.TOOLBOX_LABEL_FONT,
                labelColor: Constants.TOOLBOX_LABEL_COLOR
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;

            this.width = options.width;
            this.maxHeight = (options.maxHeight !== undefined) ? options.maxHeight : this.width;
            this.labelText = options.labelText;
            this.labelFont = options.labelFont;
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
            this.icon = this.createIconSprite();
            this.icon.anchor.x = 0.5;
            this.icon.x = this.width / 2;
            var scale;
            if (this.icon.texture.width > this.icon.texture.height)
                scale = this.width / this.icon.texture.width;
            else
                scale = this.maxHeight / this.icon.texture.height;
            this.icon.scale.x = scale;
            this.icon.scale.y = scale;
            this.icon.buttonMode = true;
            this.displayObject.addChild(this.icon);
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

        initLabel: function() {
            var textSettings = {
                font: this.labelFont,
                fill: this.labelColor
            };

            var label = new PIXI.Text(this.labelText, textSettings);
            label.resolution = this.getResolution();
            label.anchor.x = 0.5;
            label.anchor.y = -0.11;
            label.x = this.width / 2;
            label.y = this.icon.height;

            this.displayObject.addChild(label);
        },

        /**
         * Creates a new object (of whatever this reservoir contains)
         *   and returns it so it can be added to the scene as a
         *   dummy object.  Note the dummy object will not be added
         *   to the simulation until it gets turned into a real
         *   object after the user drops it.
         */
        createComponentView: function(x, y) {},

        setJunctionPositions: function(dummyModel, x, y) {
            var x = this.mvt.viewToModelX(x);
            var y = this.mvt.viewToModelY(y);
            var dx = dummyModel.getX2() - dummyModel.getX1();
            var dy = dummyModel.getY2() - dummyModel.getY1();
            dummyModel.get('startJunction').setPosition(x - dx / 2, y - dy / 2);
            dummyModel.get('endJunction').setPosition(  x + dx / 2, y + dy / 2);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            
        },

        setWidth: function(width) {

        },

        dragStart: function(event) {
            this.dragging = true;
            
            this.componentView = this.createComponentView(event.data.global.x, event.data.global.y);
            this.simulation.circuit.addBranch(this.componentView.model);
            this.dummyLayer.addChild(this.componentView.displayObject);

            this.componentView.dragStart(event);

            // this.lastX = event.data.global.x;
            // this.lastY = event.data.global.y;
        },

        drag: function(event) {
            // if (this.dragging) {
            //     var dx = this.mvt.viewToModelDeltaX(event.data.global.x - this.lastX);
            //     var dy = this.mvt.viewToModelDeltaY(event.data.global.y - this.lastY);
                
            //     this.componentView.model.translate(dx, dy);

            //     this.lastX = event.data.global.x;
            //     this.lastY = event.data.global.y;
            // }
        },

        dragEnd: function(event) {
            if (this.componentView && this.dragging) {
                var relativePoint = event.data.getLocalPosition(this.displayObject.parent, this._point);

                if (this.displayObject.parent.getLocalBounds().contains(relativePoint.x, relativePoint.y)) {
                    // Remove the model from the sim because it never left the toolbox
                    this.simulation.circuit.removeBranch(this.componentView.model);
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
        }

    });


    return ComponentToolboxIcon;
});