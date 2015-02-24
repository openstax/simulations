define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Updater = require('../updater/updater');

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
                name: 'sim',
                link: '',
                stepDuration: 33, // milliseconds
                runUpdateOnReset: false
            }, options);

            this.title = options.title;
            this.name  = options.name;
            this.link = options.link;
            this.stepDuration = options.stepDuration;
            this.runUpdateOnReset = options.runUpdateOnReset;

            // Updater stuff
            this.update = _.bind(this.update, this);

            this.updater = new Updater();
            this.updater.addEventListener('update', this.update);

            // Stepping
            this._stepFinished = _.bind(this._stepFinished, this);

            // Initialize simulation model
            this.initSimulation();

            // We want it to start playing when they first open the tab
            this.resumePaused = false;
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
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {},

        /**
         * Click event handler that plays the simulation
         */
        play: function(event) {
            this.simulation.play();
        },

        /**
         * Click event handler that pauses the simulation
         */
        pause: function(event) {
            this.simulation.pause();
        },

        /**
         * Click event handler that plays the simulation for a specified duration
         */
        step: function(event) {
            // Play until a certain number of milliseconds has elapsed.
            this.play();
            setTimeout(this._stepFinished, this.stepDuration);
        },

        /**
         * Called after a step through is finished
         */
        _stepFinished: function() {
            this.pause();
        },

        /**
         * Click event handler that resets the simulation back to time zero.
         */
        reset: function(event) {
            if (confirm('Are you sure you want to reset everything?'))
                this.resetSimulation();
        },

        resetSimulation: function() {
            // Save whether or not it was paused when we reset
            var wasPaused = this.simulation.get('paused');

            // Set pause the updater and reset everything
            this.updater.pause();
            this.updater.reset();
            this.resetComponents();
            this.rerender();

            // Paint the first frame
            if (this.runUpdateOnReset) {
                this.simulation.play();
                this.update(0, 0);
                this.simulation.pause();
            }

            // Resume normal function
            this.updater.play();
            if (!wasPaused)
                this.simulation.play();
        },

        /**
         * Resets the components when the reset button is pressed
         */
        resetComponents: function() {
            this.simulation.reset();
        },

        /**
         * Called during a reset to refresh the visuals.  If it
         *   is not desireable in the simulation to actually
         *   rerender the scene, this should be overriden to
         *   do whatever is necessary to set everything back to
         *   defaults.
         */
        rerender: function() {
            this.render();
            this.postRender();
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
         * Helper function for setting properties on the waveSimulation without causing a
         *   loop of updates between the wave simulation model and the view
         */
        inputLock: function(callback) {
            if (this.updatingProperty)
                return;

            this.inputtingProperty = true;
            callback.apply(this);
            this.inputtingProperty = false;
        },

        /**
         * Helper function for updating inputs from the wave simulation without causing a
         *   loop of updates between the wave simulation model and the view
         */
        updateLock: function(callback) {
            if (this.inputtingProperty)
                return;

            this.updatingProperty = true;
            callback.apply(this);
            this.updatingProperty = false;
        },

    });

    return SimView;
});
