define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');

    var Constants = require('constants');
    var Types = Constants.SourceObject.Types;

    var Assets = require('assets');

    /**
     * Draws all the rays coming from points on the source object.
     *   There are three different ray modes and an off mode.
     */
    var RaysView = PixiView.extend({

        /**
         * Initializes the new RaysView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = this.model;

            this.initGraphics();
            this.updateMVT(this.mvt);

            // Listen for changes in the source object
            this.listenTo(this.simulation.sourceObject, 'change:position',    this.drawPoint1Rays);
            this.listenTo(this.simulation.sourceObject, 'change:secondPoint', this.drawPoint2Rays);

            // Listen for changes in the lens
            this.listenTo(this.simulation.lens, 'change:position',    this.drawAllRays);
            this.listenTo(this.simulation.lens, 'change:focalLength', this.drawAllRays);
            this.listenTo(this.simulation.lens, 'change:diameter',    this.drawAllRays);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.point1Rays = new PIXI.Graphics();
            this.point2Rays = new PIXI.Graphics();

            this.displayObject.addChild(this.point1Rays);
            this.displayObject.addChild(this.point2Rays);
        },

        /**
         * Draws all the rays according to the current mode.
         */
        drawAllRays: function() {

        },

        /**
         * Draws the rays coming from the source object's position
         *   according to the current mode.
         */
        drawPoint1Rays: function() {

        },

        /**
         * Draws the rays coming from the source object's second
         *   point according to the current mode.
         */
        drawPoint2Rays: function() {

        },

        /**
         * Draws a specific set of rays onto the specified graphics
         *   object with the specified color from pointA through
         *   the lens to pointB.
         */
        drawRays: function(graphics, color, pointA, pointB) {

        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawAllRays();
        },


    }, Constants.RaysView);

    return RaysView;
});