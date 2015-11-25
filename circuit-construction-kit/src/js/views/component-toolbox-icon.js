define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/pixi/view');
    var Rectangle = require('common/math/rectangle');

    var ReservoirObjectView = require('views/reservoir-object');

    var Constants = require('constants');

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
            'mouseupoutside  .icon': 'dragEnd'
        },

        initialize: function(options) {
            options = _.extend({
                width:  50,
                labelText: 'Component',
                labelFont: Constants.TOOLBOX_LABEL_FONT,
                labelColor: Constants.TOOLBOX_LABEL_COLOR
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;

            this.width = options.width;
            this.labelText = options.labelText;
            this.labelFont = options.labelFont;
            this.labelColor = options.labelColor;

            // Cached objects
            this._bounds = new Rectangle();

            this.initGraphics();
        },

        initGraphics: function() {
            this.initIcon();
            this.initLabel();

            this.updateMVT(this.mvt);
        },

        initIcon: function() {

        },

        initLabel: function() {
            var textSettings = {
                font: this.labelFont,
                fill: this.labelColor
            };

            var label = new PIXI.Text(this.labelText, textSettings);
            label.anchor.x = 0.5;
            label.anchor.y = -0.11;
            label.x = this.width / 2;
            label.y = this.thickness;

            this.displayObject.addChild(label);
        },

        /**
         * Creates a new object (of whatever this reservoir contains)
         *   and returns it so it can be added to the scene as a
         *   dummy object.  Note the dummy object will not be added
         *   to the simulation until it gets turned into a real
         *   object after the user drops it.
         */
        createDummyObject: function() {
            var model = new Charge();
            var view = new ReservoirObjectView({
                model: model,
                mvt: this.mvt,
                interactive: false
            });
            return view;
        },

        destroyObject: function(object) {
            object.destroy();
        },

        /**
         * Creates the actual object based off of the position of the
         *   dummy object and adds it to the simulation/scene.
         */
        createAndAddComponent: function(dummyModel) {},

        updateMVT: function(mvt) {
            this.mvt = mvt;

            
        },

        setWidth: function(width) {

        },

        dragStart: function(event) {
            this.dragging = true;

            this.dummyObject = this.createDummyObject();
            this.dummyLayer.addChild(this.dummyObject.displayObject);
        },

        drag: function(event) {
            if (this.dragging) {
                this.dummyObject.setPosition(
                    event.data.global.x,
                    event.data.global.y
                );
            }
        },

        dragEnd: function(event) {
            this.dragging = false;

            if (this.dummyObject) {
                var x = this.dummyObject.displayObject.x;
                var y = this.dummyObject.displayObject.y;

                if (!this.contains(x, y)) {
                    // Create a real object and add it to the sim
                    this.createAndAddComponent(this.dummyObject.model);
                }

                this.dummyObject.removeFrom(this.dummyLayer);
                this.dummyObject.model.destroy();
                this.dummyObject = null;
            }
        },

        getBounds: function() {
            return this._bounds.set(
                this.displayObject.x,
                this.displayObject.y,
                this.width,
                this.height
            );
        },

        /**
         * Returns whether or not a point on the screen lies inside the
         *   reservoir's bounds.
         */
        contains: function(x, y) {
            return this.getBounds().contains(x, y);
        },

    });


    return ComponentToolboxIcon;
});