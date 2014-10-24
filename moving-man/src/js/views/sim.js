define(function (require) {

	'use strict';

	// var $                   = require('jquery');
	var _                   = require('underscore');

	var SimView             = require('common/app/sim');
	var MovingManSimulation = require('models/moving-man-simulation');
	var SceneView           = require('views/scene');

	require('nouislider');
	require('bootstrap');

	// CSS
	require('less!styles/sim');
	require('less!styles/variable-controls');
	require('less!common/styles/slider');
	require('less!common/styles/radio');

	// HTML
	var simHtml             = require('text!templates/sim.html');
	var variableControlHtml = require('text!templates/variable-control.html');
	var functionHelpHtml    = require('text!templates/function-help-modal.html');

	/**
	 * 
	 */
	var MovingManSimView = SimView.extend({

		/**
		 * Root element properties
		 */
		tagName:   'section',
		className: 'sim-view',

		/**
		 * Template for rendering the basic scaffolding
		 */
		template: _.template(simHtml),
		variableControlTemplate: _.template(variableControlHtml),

		/**
		 * Dom event listeners
		 */
		events: {
			// Playback controls
			'click .play-btn' : 'play',
			'click .pause-btn': 'pause',
			'click .step-btn' : 'step',
			'click .reset-btn': 'reset',

			'click .from-expression' : 'useExpression',
			'click .drop-expression' : 'dropExpression'
		},

		/**
		 * Inits simulation, views, and variables.
		 *
		 * @params options
		 */
		initialize: function(options) {
			SimView.prototype.initialize.apply(this, [options]);

			// Initialize the HeatmapView
			this.initSceneView();
		},

		/**
		 * Initializes the Simulation.
		 */
		initSimulation: function() {
			this.simulation = new MovingManSimulation();
		},

		/**
		 * Initializes the SceneView.
		 */
		initSceneView: function() {
			this.sceneView = new SceneView({
				simulation: this.simulation
			});
		},

		/**
		 * Renders everything
		 */
		render: function() {
			this.$el.empty();

			this.renderScaffolding();
			this.renderSceneView();
			this.renderVariableControls();

			return this;
		},

		/**
		 * Renders page content. Should be overriden by child classes
		 */
		renderScaffolding: function() {
			this.$el.html(this.template());
		},

		/**
		 * Renders the scene view
		 */
		renderSceneView: function() {
			this.sceneView.render();
			this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
		},

		/**
		 *
		 */
		renderVariableControls: function() {
			var $position = $(this.variableControlTemplate({
				className: 'position',
				name:  'Position',
				units: 'm',
				unique: this.name + '-position',
				vectors: false,
				expression: true
			}));

			var $velocity = $(this.variableControlTemplate({
				className: 'velocity',
				name:  'Velocity',
				units: 'm/s',
				unique: this.name + '-velocity',
				vectors: true,
				expression: false
			}));

			var $acceleration = $(this.variableControlTemplate({
				className: 'acceleration',
				name:  'Acceleration',
				units: 'm/s<sup>2</sup>',
				unique: this.name + '-acceleration',
				vectors: true,
				expression: false
			}));

			var sliderOptions = this.getSliderOptions();

			$()
				.add($position)
				.add($velocity)
				.add($acceleration)
				.each(function(){
					var $slider = $(this).find('.variable-slider');

					$slider.noUiSlider(sliderOptions);
					// $slider.noUiSlider_pips({
					// 	mode: 'positions',
					// 	density: 5,
					// 	values: [0, 50, 100]
					// });
					$slider.Link('lower').to($(this).find('.variable-text'));	
				});

			this.$('.sim-controls')
				.append($position)
				.append($velocity)
				.append($acceleration);

			this.$el.append(functionHelpHtml);
		},

		/**
		 * Default intro view needs horizontal sliders, while the charts
		 *   view has more compact variable controls with a vertical slider.
		 */
		getSliderOptions: function() {
			return {
				start: 0,
				range: {
					min: -10,
					max:  10
				}
			};
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.sceneView.postRender();
		},

		/**
		 *
		 */
		resetComponents: function() {
			SimView.prototype.resetComponents.apply(this);
			this.initSceneView();
		},

		/**
		 * This is run every tick of the updater.  It updates the wave
		 *   simulation and the views.
		 */
		update: function(time, delta) {
			// Update the model
			this.simulation.update(time, delta);

			// Update the scene
			this.sceneView.update(time, delta);
		},

		/**
		 * Switches positon to expression mode and updates simulation.
		 */
		useExpression: function() {
			this.$('.position').addClass('expression');

			/*
			 * PhET didn't do this, but I'm disabling the position
			 *   while using an expression because it can cause
			 *   unexpected behavior and is otherwise useless.
			 */
			this.$('.position .slider').attr('disabled', 'disabled');

			// Update simulation
		},

		/**
		 * Switches position away from expression mode and updates sim.
		 */
		dropExpression: function() {
			this.$('.position').removeClass('expression');

			this.$('.position .slider').removeAttr('disabled');
			
			// Update simulation
		}

	});

	return MovingManSimView;
});
