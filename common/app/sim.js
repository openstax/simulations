define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');

	/**
	 * SimView represents a tab in the simulation.  SimView must be extended
	 *   to create specific simulation views with specific simulation models.
	 *   SimViews interface with a simulation model and contain all necessary 
	 *   views for visualizing and interacting with the simulation model.
	 */
	var SimView = Backbone.View.extend({

		/**
		 * Sets basic properties and initializes updater and simulation model.
		 */
		initialize: function(options) {
			options = _.extend({
				title: 'Simulation',
				name: 'sim'
			}, options);

			this.title = options.title;
			this.name  = options.name;

			// Updater stuff
			this.update = _.bind(this.update, this);

			this.updater = new Updater();
			this.updater.addEventListener('update', this.update);

			// Initialize simulation model
			this.initSimulation();

			// We want it to start playing when they first open the tab
			this.resumePaused = false;
			this.$el.addClass('playing');
		},

		/**
		 * Initializes the simulation model
		 */
		initSimulation: function() {
			this.simulation = null;
		},

		/**
		 * Called when the view is being removed. Unbinds bound events
		 *   and stops the updater.
		 */
		remove: function() {
			Backbone.View.prototype.remove.apply(this);
			this.unbind();
			this.updater.pause();
		},

		/**
		 * Click event handler that plays the simulation
		 */
		play: function(event) {
			this.simulation.play();
			this.$el.addClass('playing');
		},

		/**
		 * Click event handler that pauses the simulation
		 */
		pause: function(event) {
			this.simulation.pause();
			this.$el.removeClass('playing');
		},

		/**
		 * Click event handler that plays the simulation for a specified duration
		 */
		step: function(event) {
			var milliseconds = 50;

			// Set the UI to pause mode
			this.pause();

			// Play until a certain number of milliseconds has elapsed.
			this.updater.play();
			setTimeout(_.bind(this.updater.pause, this.updater), milliseconds);
		},

		/**
		 * Click event handler that resets the simulation back to time zero.
		 */
		reset: function(event) {
			if (!confirm('Are you sure you want to reset everything?'))
				return;
			
			// Save whether or not it was paused when we reset
			var wasPaused = this.simulation.paused;

			// Set pause the updater and reset everything
			this.updater.pause();
			this.updater.reset();
			this.resetComponents();
			this.render();
			this.postRender();

			// Paint the first frame
			this.simulation.play();
			this.update(0, 0);
			this.simulation.pause();

			// Resume normal function
			this.updater.play();
			if (!wasPaused)
				this.waveSimulation.play();
		},

		/**
		 *
		 */
		resetComponents: function() {
			this.simulation.reset();
			this.initWaveSimulation();
			this.initHeatmapView();
			this.initCrossSectionGraphView();
		},

		/**
		 * If we switch to a new sim, we pause this one,
		 *   but we want to save whether or not it was
		 *   paused already so it doesn't resume when we
		 *   don't want it to.
		 */
		halt: function() {
			this.updater.pause();
		},

		/**
		 * Used from the outside to continue execution but
		 *   paying attention to whether it was already
		 *   paused or not before it was halted.
		 */
		resume: function() {
			this.updater.play();
		},

		/**
		 * This is run every tick of the updater and should
		 *   be used to update the simulation model and the
		 *   views.
		 */
		update: function(time, delta) {
			// Update the model
			this.simulation.update(time, delta);
		},

		/**
		 * Helper function for setting properties on the simulation without causing a
		 *   loop of updates between the wave simulation model and the view
		 */
		setFromInput: function(property, value) {
			if (this.updatingProperty)
				return;

			this.inputtingProperty = true;
			this.simulation.set(property, value);
			this.inputtingProperty = false;
		},

		/**
		 * Helper function for updating inputs from the simulation without causing a
		 *   loop of updates between the wave simulation model and the view
		 */
		updateInput: function($input, value) {
			if (this.inputtingProperty)
				return;

			this.updatingProperty = true;
			$input.val(value);
			this.updatingProperty = false;
		}

	});

	return SimView;
});
