define(function (require) {

	'use strict';

	var $                   = require('jquery');
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
		functionHelpTemplate: _.template(functionHelpHtml),

		/**
		 * Dom event listeners
		 */
		events: {
			'click .from-expression' : 'useExpression',
			'click .drop-expression' : 'dropExpression',

			'slide .position .slider'     : 'changePosition',
			'slide .velocity .slider'     : 'changeVelocity',
			'slide .acceleration .slider' : 'changeAcceleration',

			'keyup .position .variable-text'     : 'changePosition',
			'keyup .velocity .variable-text'     : 'changeVelocity',
			'keyup .acceleration .variable-text' : 'changeAcceleration',

			'change .velocity     .vector-check' : 'changeVelocityVectorVisibility',
			'change .acceleration .vector-check' : 'changeAccelerationVectorVisibility',

			'click .sound-btn' : 'changeVolume',

			'keyup .position .expression-text' : 'changeExpression'
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

			this.listenTo(this.simulation.movingMan, 'change:position',     this.positionChanged);
			this.listenTo(this.simulation.movingMan, 'change:velocity',     this.velocityChanged);
			this.listenTo(this.simulation.movingMan, 'change:acceleration', this.accelerationChanged);

			this.listenTo(this.simulation.movingMan, 'change:motionStrategy', this.motionStrategyChanged);
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

			this.simulation.movingMan.trigger('change:motionStrategy', this.simulation.movingMan);

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
			var $position = $(this.variableControlTemplate(this.getPositionTemplateData()));
			var $velocity = $(this.variableControlTemplate(this.getVelocityTemplateData()));
			var $acceleration = $(this.variableControlTemplate(this.getAccelerationTemplateData()));

			this.$variables = $()
				.add($position)
				.add($velocity)
				.add($acceleration);

			this.$('.position-row').append($position);
			this.$('.velocity-row').append($velocity);
			this.$('.acceleration-row').append($acceleration);

			this.$position     = $position;
			this.$velocity     = $velocity;
			this.$acceleration = $acceleration;

			this.initVariableSliders();

			this.$positionInputs     = this.$position.find(    '.variable-text, .slider');
			this.$velocityInputs     = this.$velocity.find(    '.variable-text, .slider');
			this.$accelerationInputs = this.$acceleration.find('.variable-text, .slider');

			this.$expression      = this.$('.position .expression-text');
			this.$expressionGroup = this.$('.position .expression-group');

			this.$el.append(this.functionHelpTemplate({
				help_modal_id: this.getHelpModalId()
			}));
		},

		/**
		 *
		 */
		initVariableSliders: function() {
			var sliderOptions = this.getSliderOptions();

			this.$variables.each(function(){
				var $slider = $(this).find('.variable-slider');
				$slider.noUiSlider(sliderOptions);
				$slider.Link('lower').to($(this).find('.variable-text'));	
			});
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
		 *
		 */
		getHelpModalId: function() {
			return this.name + '-function-help-modal';
		},

		/**
		 *
		 */
		getPositionTemplateData: function() {
			return {
				className: 'position',
				name:  'Position',
				units: 'm',
				unique: this.name + '-position',
				vectors: false,
				expression: true,
				help_modal_id: this.getHelpModalId()
			};
		},

		/**
		 *
		 */
		getVelocityTemplateData: function() {
			return {
				className: 'velocity',
				name:  'Velocity',
				units: 'm/s',
				unique: this.name + '-velocity',
				vectors: true,
				expression: false
			};
		},

		/**
		 *
		 */
		getAccelerationTemplateData: function() {
			return {
				className: 'acceleration',
				name:  'Acceleration',
				units: 'm/s<sup>2</sup>',
				unique: this.name + '-acceleration',
				vectors: true,
				expression: false
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

			this.changeExpression();			
		},

		/**
		 * Switches position away from expression mode and updates sim.
		 */
		dropExpression: function() {
			this.$('.position').removeClass('expression');

			this.$('.position .slider').removeAttr('disabled');
			
			// Update simulation
			this.simulation.dropCustomPositionFunction();
		},

		/**
		 * Tries to set the custom position function on the simulation and
		 *   shows error feedback to the user if it fails.
		 */
		changeExpression: function(event) {
			try {
				this.simulation.useCustomPositionFunction(this.$expression.val());
				if (this.simulation.noRecording) {
					/* Start back at time zero so the user can see what
					 *  his or her function does. If it's a simulation
					 *  that records (i.e., Charts), the user will have
					 *  control over the time, so this isn't needed.
					 */
					this.simulation.resetTimeAndHistory();
				}
				this.$expressionGroup.removeClass('error');
			}
			catch (e) {
				this.$expressionGroup.addClass('error');
			}
		},

		/**
		 *
		 */
		changePosition: function(event) {
			var position = parseFloat($(event.target).val());
			if (!isNaN(position)) {
				this.inputLock(function(){
					this.simulation.movingMan.positionDriven(true);
					this.simulation.movingMan.setMousePosition(position);
				});
			}
		},

		/**
		 *
		 */
		changeVelocity: function(event) {
			var velocity = parseFloat($(event.target).val());
			if (!isNaN(velocity)) {
				this.inputLock(function(){
					this.simulation.movingMan.velocityDriven(true);
					this.simulation.movingMan.set('velocity', velocity);
				});
			}
		},

		/**
		 *
		 */
		changeAcceleration: function(event) {
			var acceleration = parseFloat($(event.target).val());
			if (!isNaN(acceleration)) {
				this.inputLock(function(){
					this.simulation.movingMan.accelerationDriven(true);
					this.simulation.movingMan.set('acceleration', acceleration);
				});	
			}
		},

		/**
		 *
		 */
		positionChanged: function(model, value) {
			if (!(this.simulation.movingMan.positionDriven() && !this.sceneView.movingManView.dragging)) {
				this.updateLock(function(){
					this.$positionInputs.val(value.toFixed(2));
				});	
			}
		},

		/**
		 *
		 */
		velocityChanged: function(model, value) {
			this.updateLock(function(){
				this.$velocityInputs.val(value.toFixed(2));
			});
		},

		/**
		 *
		 */
		accelerationChanged: function(model, value) {
			this.updateLock(function(){
				this.$accelerationInputs.val(value.toFixed(2));
			});
		},

		/**
		 *
		 */
		changeVelocityVectorVisibility: function(event) {
			if ($(event.target).is(':checked'))
				this.sceneView.movingManView.showVelocityVector();
			else
				this.sceneView.movingManView.hideVelocityVector();
		},

		/**
		 *
		 */
		changeAccelerationVectorVisibility: function(event) {
			if ($(event.target).is(':checked'))
				this.sceneView.movingManView.showAccelerationVector();
			else
				this.sceneView.movingManView.hideAccelerationVector();
		},

		/**
		 *
		 */
		changeVolume: function(event) {
			var $btn = $(event.target).closest('.sound-btn');

			$btn.hide();

			if ($btn.hasClass('sound-btn-mute')) {
				this.$('.sound-btn-low').show();
				this.sceneView.movingManView.lowVolume();
			}
			else if ($btn.hasClass('sound-btn-low')) {
				this.$('.sound-btn-high').show();
				this.sceneView.movingManView.highVolume();
			}
			else if ($btn.hasClass('sound-btn-high')) {
				this.$('.sound-btn-mute').show();
				this.sceneView.movingManView.muteVolume();
			}
		},

		/**
		 * The simulation's moving man changed its motion strategy.
		 */
		motionStrategyChanged: function(model, value, options) {
			var $variable;

			if (model.positionDriven())
				$variable = this.$position;
			else if (model.velocityDriven())
				$variable = this.$velocity; 
			else if (model.accelerationDriven())
				$variable = this.$acceleration;

			this.$variables.removeClass('driving');

			$variable.addClass('driving');		
		}

	});

	return MovingManSimView;
});
