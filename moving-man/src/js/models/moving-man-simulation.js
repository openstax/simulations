define(function (require, exports, module) {

    'use strict';

    //var _ = require('underscore');
    var Formula = require('fparser');
    var bs      = require('common/binarysearch/binarysearch');

    var Simulation = require('common/simulation/simulation');
    var MovingMan  = require('models/moving-man');

    /**
     * Constants
     */

    /**
     * Wraps the update function in 
     */
    var MovingManSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            containerWidth: 20,
            halfContainerWidth: 10,
            wallsEnabled: true,
            time: 0,
            furthestRecordedTime: 0,
            maxTime: 20,
            recording: true,
            playbackSpeed: 1
        }),

        /**
         * Object fields
         */
        history: [],
        time: 0,
        positionFormula: null,
        
        /**
         * Initialization code for moving man simulation models
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:containerWidth', function() {
                this.set('halfContainerWidth', this.get('containerWidth') / 2);
            });

            /* We're keeping track of the playback speed separate from the sim's
             *   timeScale because timeScale changes with modes, and we have to
             *   persistently store the playback speed across modes.
             */
            this.on('change:playbackSpeed', function(model, speed, options) {
                if (!this.get('recording'))
                    this.set('timeScale', speed);
            });
        },

        /**
         * Initialization options are processed here in a separate function
         *   so that we can reset the object and its starting values without
         *   re-initializing it.
         */
        applyOptions: function(options) {
            Simulation.prototype.applyOptions.apply(this, [options]);

            this.noRecording = options ? options.noRecording : false;
            if (this.noRecording)
                this.set('recording', false);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initMovingMan();
        },

        /**
         * Instantiates the moving man model
         */
        initMovingMan: function() {
            this.movingMan = new MovingMan(null, {
                simulation: this,
                noRecording: this.noRecording
            });
        },

        /**
         * Resets the simulation
         */
        reset: function() {
            Simulation.prototype.reset.apply(this);

            // This is the fastest way to clear an array by benchmarks
            var history = this.history;
            while (history.length > 0) {
                history.pop();
            }

            this.positionFormula = null;
        },

        /**
         * Only runs if simulation isn't currently paused.
         * If we're recording, it saves state
         */
        _update: function(time, delta) {
            // For the time slider and anything else relying on time
            this.set('time', time);

            if (this.get('recording')) {
                // Run update and then save state
                this.movingMan.update(time, delta);
                this.recordState();
                this.set('furthestRecordedTime', time);
            }
            else {
                // Either we're playing back or we just don't ever record
                if (!this.noRecording) {
                    // We're playing back, so apply a saved state instead of updating
                    this.applyPlaybackState();

                    // And if we've reached the end of what we've recorded, stop
                    if (time >= this.get('furthestRecordedTime'))
                        this.pause();
                }
                else
                    this.movingMan.update(time, delta);
            }
        },

        /**
         * Returns whether the specified x position is within the bounds of
         *   container (the area bounded by the walls).
         */
        positionWithinBounds: function(x) {
            return (x >= -this.get('halfContainerWidth') && x <= this.get('halfContainerWidth'));
        },

        /**
         * Evaluates the custom user-specified expression
         */
        evaluatePositionFunction: function(time) {
            if (this.positionFormula)
                return this.positionFormula.evaluate({ t: time });
            else
                return 0;
        },

        /**
         * Tries to set the custom expression and throws error if the
         *   expression is bad.
         */
        useCustomPositionFunction: function(expression) {
            // Showing the try-catch block even though we pass the error up
            try {
                // If this next line throws an error, we know it's bad.
                Formula.calc(expression, { t: 0 });

                // So if we made it this far, we've got a winner.
                this.positionFormula = new Formula(expression);
                this.movingMan.positionDriven(true);
            }
            catch (e) {
                this.positionFormula = null;
                throw e;
            }
        },

        /**
         * Tells the simulation to stop using the custom position function.
         */
        dropCustomPositionFunction: function() {
            this.positionFormula = null;
        },

        /**
         * Returns whether the simulation is currently using a custom
         *   position function.
         */
        usingCustomPositionFunction: function() {
            return this.positionFormula !== null;
        },

        /**
         * We need to set up some stuff before we can play back.  The
         *   PhET version sorted the history by the time closest to
         *   the current step time at each step and had a "todo" note
         *   to make it something more efficient like a binary search, 
         *   so I'm going ahead and implementing a binary search on a
         *   presorted history instead of sorting states from all 
         *   frames on every frame.
         */
        play: function() {
            if (!this.get('recording'))
                this.prepareForPlayback();

            Simulation.prototype.play.apply(this);
        },

        /**
         * Rewinds the simulation to its starting time of zero and
         *   clears all history if we're in record mode.
         */
        rewind: function() {
            this.time = 0;
            this.set('time', 0);

            if (this.get('recording'))
                this.resetTimeAndHistory();
        },

        /**
         * Called before switching to playback (non-recording) mode
         *   to get ready to read stored states in order. It sorts
         *   the array of historical states by time and then plucks
         *   just the times out into a separate array for faster 
         *   random access.
         */
        prepareForPlayback: function() {
            // Sort the historical states by time ascending
            _.sortBy(this.history, function(state) {
                return state.time;
            });

            /* Store just the times in a parallel array so we
             *   can do a binary search.
             */
            this._historyTimes = _.pluck(this.history, 'time');
        },

        /**
         * Resets all time fields to zero and clears history.
         */
        resetTimeAndHistory: function() {
            // This is the fastest way to clear an array by benchmarks
            var history = this.history;
            while (history.length > 0) {
                history.pop();
            }

            this._historyTimes = null;

            this.time = 0;
            this.set('time', 0);
            this.set('furthestRecordedTime', 0);

            this.movingMan.clear();
        },

        /**
         * Clears all history after a specified time.
         */
        clearHistoryAfter: function(time) {
            var points = [];
            for (var i = 0; i < this.history.length; i++) {
                if (this.history[i].time < time)
                    points.push(this.history[i]);
            }
            this.history = points;

            this._historyTimes = null;

            this.movingMan.clearHistoryAfter(time);
        },

        /**
         * Sets playback mode to record
         */
        record: function() {
            this.pause();

            /* If we switch to recording from playback, we need to clear whatever
             *   history is after the current time (where the cursor was) because
             *   we want to record over and not just add to the data.
             */
            this.clearHistoryAfter(this.time);

            this.set('timeScale', this.get('playbackSpeed'));    
            this.set('recording', true);
        },

        /**
         * Sets playback mode to playback
         */
        stopRecording: function() {
            this.pause();
            
            this.set('time', 0);
            this.time = 0;

            this.set('recording', false);
            this.set('timeScale', 1);
        },

        /**
         * Returns true if we're currently playing back (not in
         *   recording mode on a simulation that records).
         */
        playingBack: function() {
            return (!this.get('recording') && !this.noRecording);
        },

        /**
         * Stores the current state of everything as a json object
         *   in the history array for playback later.
         */
        recordState: function() {
            this.history.push({
                time: this.time,
                wallsEnabled: this.get('wallsEnabled'),
                movingMan: this.movingMan.getState()
            });
        },

        /**
         * Finds the appropriate state in history for this step and
         *   applies it to the simulation.
         */
        applyPlaybackState: function() {
            var state = this.findStateWithClosestTime(this.time);
            if (state) {
                this.set('wallsEnabled', state.wallsEnabled);
                this.movingMan.applyState(this.time, state.movingMan);
            }
        },

        /**
         * Performs a binary search to find the state whose time
         *   is closest to the specified time.
         */
        findStateWithClosestTime: function(time) {
            var stateIndex = bs.closest(this._historyTimes, time);
            return this.history[stateIndex];
        },

        /**
         * Used to set the time for playback and update the simulation
         *   model with the saved state for this moment in time.
         */
        setPlaybackTime: function(time) {
            this.time = time;
            this.set('time', time);
            if (!this._historyTimes)
                this.prepareForPlayback();
            this.applyPlaybackState();
        }

    });

    return MovingManSimulation;
});
