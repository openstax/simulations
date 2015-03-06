define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    /**
     * SceneView is the main focus of the app. 
     *
     */
    var PixiSceneView = Backbone.View.extend({

        tagName: 'canvas',
        className: 'scene-view',

        events: {
            
        },

        initialize: function(options) {
            // Save options
            if (options.simulation)
                this.simulation = options.simulation;
            else
                throw 'PixiSceneView requires a simulation model to render.';

            // Bind events
            $(window).bind('resize', $.proxy(this.windowResized, this));
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.renderContent();
            this.initRenderer();

            return this;
        },

        /**
         * Renders 
         */
        renderContent: function() {
            
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.resize(true);

            this.initGraphics();
        },

        /**
         * Initializes a renderer
         */
        initRenderer: function() {
            this.renderer = PIXI.autoDetectRenderer(
                this.$el.width(),  // Width
                this.$el.height(), // Height
                {
                    view:        this.el, // Canvas element
                    transparent: true,    // Transparent background
                    antialias:   true     // Antialiasing
                }
            );

            this.width  = this.$el.width();
            this.height = this.$el.height();

            // Create a stage to hold everything
            this.stage = new PIXI.Stage(0x000000);
        },

        initGraphics: function() {
            
        },

        /**
         * Called on a window resize to resize the canvas
         */
        windowResized: function(event) {
            this.resizeOnNextUpdate = true;
        },

        resize: function(override) {
            var width  = this.$el.width();
            var height = this.$el.height();
            this.width  = width;
            this.height = height;
            if (override || width != this.renderer.width || height != this.renderer.height) {
                this.resizeGraphics();
                this.trigger('resized');
            }
            this.resizeOnNextUpdate = false;

            this.offset = this.$el.offset();
        },

        resizeGraphics: function() {
            this.renderer.resize(this.width, this.height);
        },

        reset: function() {

        },

        update: function(time, deltaTime, paused, timeScale) {
            if (this.resizeOnNextUpdate)
                this.resize();

            this._update(time, deltaTime, paused, timeScale);

            // Render everything
            this.renderer.render(this.stage);
        },

        _update: function(time, deltaTime) {}

    });

    return PixiSceneView;
});
