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
	var SceneView = Backbone.View.extend({

		tagName: 'canvas',
		className: 'scene-view',

		events: {
			
		},

		assets: [

		],

		initialize: function(options) {

			// Default values
			options = _.extend({

			}, options);

			// Save options
			if (options.simulation)
				this.simulation = options.simulation;
			else
				throw 'SceneView requires a simulation model to render.';

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));
		},

		/**
		 * Renders content and canvas for heatmap
		 */
		render: function() {
			this.renderContent();
			this.initRenderer();

			this.postRenderCalled = false;

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

			this.postRenderCalled = true;

			if (this.assetsLoaded)
				this.initGraphics();
		},

		loadAssets: function() {
			this.assetsLoaded = false;
			var assetLoader = new AssetLoader(this.assets);
			assetLoader.onComplete = _.bind(function(){
				this.assetsLoaded = true;
				if (this.postRenderCalled)
					this.initGraphics();
			}, this);
			assetLoader.load();
		},

		/**
		 * Initializes a renderer
		 */
		initRenderer: function() {
			this.renderer = PIXI.autoDetectRenderer(
				this.$el.width(),  // Width
				this.$el.height(), // Height
				this.el,           // Canvas element
				true,              // Transparent background
				true               // Antialiasing
			);

			this.width  = this.$el.width();
			this.height = this.$el.height();
		},

		initGraphics: function() {
			// Create a stage to hold everything
			this.stage = new PIXI.Stage(0x000000);

			var tableTop = PIXI.Sprite.fromImage('img/phet/optimized/shelf_long.png');
			// tableTop.anchor.x = 0.5;
			tableTop.anchor.y = 1;
			tableTop.x = -(tableTop.width - this.width) / 2;
			tableTop.y = this.height;
			this.stage.addChild(tableTop);
			console.log(tableTop.width);

			this.initElements();
		},

		initElements: function() {
			
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

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			// if (!this.simulation.get('paused')) {
				
			// }

			// Render everything
			this.renderer.render(this.stage);
		}

	});

	return SceneView;
});
