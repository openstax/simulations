define(function(require) {

    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');

    var MovingManSimulation = require('models/moving-man-simulation');
    var MovingManSimView    = require('views/sim');
    var SceneView           = require('views/scene');
    var MovingManGraphView  = require('views/graph/moving-man');
    
    require('nouislider');

    // HTML
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    // CSS
    require('less!styles/playback-controls');
    require('less!styles/graph');

    /**
     * Extends the functionality of the MovingManSimView to create
     *   the Charts tab.  Major differences are recording/playback
     *   and showing charts of the variables' values over time.
     */
    var ChartsSimView = MovingManSimView.extend({

        events: _.extend(MovingManSimView.prototype.events, {
            // Playback controls
            'click .play-btn'   : 'play',
            'click .record-btn' : 'play',
            'click .pause-btn'  : 'pause',
            'click .step-btn'   : 'step',
            'click .rewind-btn' : 'rewind',
            'click .reset-btn'  : 'reset',
            'click .clear-btn'  : 'clear',

            'slide .playback-speed' : 'changePlaybackSpeed',

            'change .playback-mode' : 'changePlaybackMode',

            'click .row-hide': 'hideRow',
            'click .row-show': 'showRow'
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Charts',
                name:  'charts'
            }, options);
            
            MovingManSimView.prototype.initialize.apply(this, [ options ]);

            this.listenTo(this.simulation, 'change:paused',    this.pausedChanged);
            this.listenTo(this.simulation, 'change:recording', this.recordingChanged);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MovingManSimulation({
                paused: true
            });
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new SceneView({
                simulation: this.simulation,
                compact: true
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            MovingManSimView.prototype.render.apply(this);

            this.renderPlaybackControls();
            this.renderGraphs();

            this.simulation.trigger('change:paused');
            this.simulation.trigger('change:recording');

            this.$el.find('.variable-controls').addClass('compact');

            return this;
        },

        /**
         * Renders the playback controls
         */
        renderPlaybackControls: function() {
            this.$('.playback-controls-placeholder').replaceWith(playbackControlsHtml);

            // Intialize controls
            this.$('.playback-speed').noUiSlider({
                start: 1,
                range: {
                    'min': [ 0.2 ],
                    '50%': [ 1 ],
                    'max': [ 4 ]
                }
            });
        },

        /**
         * Renders the graphs
         */
        renderGraphs: function() {
            var xInfo = {
                start: 0,
                end:  20,
                step:  2,
                decimalPlaces: 1,
                label: 'time (sec)',
                showNumbers: true
            };

            this.positionGraphView = new MovingManGraphView({
                title: '',
                x: xInfo,
                y: {
                    start: -10,
                    end:    10,
                    step:    5,
                    decimalPlaces: 1,
                    label:  '',
                    showNumbers: true
                },
                hideXAxisLabels: true,
                lineColor: '#2575BA',
                latitudinalGridLines: 3,
                longitudinalGridLines: 9,
                graphSeries: this.simulation.movingMan.positionGraphSeries,
                simulation: this.simulation
            });

            this.velocityGraphView = new MovingManGraphView({
                title: '',
                x: xInfo,
                y: {
                    start: -12,
                    end:    12,
                    step:    6,
                    decimalPlaces: 1,
                    label:  '',
                    showNumbers: true
                },
                hideXAxisLabels: true,
                lineColor: '#CD2520',
                latitudinalGridLines: 3,
                longitudinalGridLines: 9,
                graphSeries: this.simulation.movingMan.velocityGraphSeries,
                simulation: this.simulation
            });

            this.accelerationGraphView = new MovingManGraphView({
                title: '',
                x: xInfo,
                y: {
                    start: -60,
                    end:    60,
                    step:   30,
                    decimalPlaces: 1,
                    label:  '',
                    showNumbers: true
                },
                lineColor: '#349E34',
                latitudinalGridLines: 3,
                longitudinalGridLines: 9,
                graphSeries: this.simulation.movingMan.accelerationGraphSeries,
                simulation: this.simulation
            });

            this.positionGraphView.render();
            this.velocityGraphView.render();
            this.accelerationGraphView.render();

            this.$('.position-row .row-content').append(this.positionGraphView.el);
            this.$('.velocity-row .row-content').append(this.velocityGraphView.el);
            this.$('.acceleration-row .row-content').append(this.accelerationGraphView.el);

            this.positionGraphView.postRender();
            this.velocityGraphView.postRender();
            this.accelerationGraphView.postRender();

            this.graphViews = [
                this.positionGraphView,
                this.velocityGraphView,
                this.accelerationGraphView
            ];


            // Link zooming on the x-axis for all the graphs together
            _.each(this.graphViews, function(graphView) {
                this.listenTo(graphView, 'zoom-x', function(timeSpan) {
                    _.each(this.graphViews, function(view) {
                        view.zoomX(timeSpan);
                    });
                });
            }, this);
        },

        /**
         * In the Charts tab, the velocity and acceleration sliders are 
         *   actually supposed to have different ranges.
         */
        initVariableSliders: function() {
            var initSlider = function($variable, options) {
                var $slider = $variable.find('.variable-slider');
                $slider.noUiSlider(options);
                $slider.Link('lower').to($variable.find('.variable-text'));
            };

            initSlider(this.$position, this.getSliderOptions());

            initSlider(this.$velocity, _.extend(this.getSliderOptions(), {
                range: {
                    min: -16,
                    max:  16
                }
            }));
            
            initSlider(this.$acceleration, _.extend(this.getSliderOptions(), {
                range: {
                    min: -60,
                    max:  60
                }
            }));
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
                },
                orientation: 'vertical',
                direction: 'rtl'
            };
        },

        /**
         * Makes sure things like canvases are sized correctly.
         */
        postRender: function() {
            MovingManSimView.prototype.postRender.apply(this);

            this.positionGraphView.postRender();
            this.velocityGraphView.postRender();
            this.accelerationGraphView.postRender();
        },

        /**
         * Updates everything MovingManSimView updated as well as all the graphs.
         */
        update: function(time, delta) {
            MovingManSimView.prototype.update.apply(this, [time, delta]);

            this.positionGraphView.update(time, delta);
            this.velocityGraphView.update(time, delta);
            this.accelerationGraphView.update(time, delta);
        },

        /**
         * Pauses the simulation and rewinds it to the beginning.
         */
        rewind: function(event) {
            this.pause();
            this.simulation.rewind();
        },

        /**
         * Pauses the simulation and resets all the time and history.
         */
        clear: function(event) {
            this.pause();
            this.simulation.resetTimeAndHistory();
        },

        /**
         * Changes the playback speed on the simulation according to
         *   user input via the playback-speed slider.
         */
        changePlaybackSpeed: function(event) {
            var speed = parseFloat($(event.target).val());
            if (!isNaN(speed)) {
                this.inputLock(function(){
                    this.simulation.set('playbackSpeed', speed);
                });
            }
        },

        /**
         * Changes whether we're in playback or record mode according
         *   to user input.
         */
        changePlaybackMode: function(event) {
            var mode = $(event.target).val();
            if (mode === 'record')
                this.simulation.record();
            else
                this.simulation.stopRecording();
        },

        /**
         * The simulation changed its recording state.
         */
        recordingChanged: function() {
            if (this.simulation.get('recording')) {
                this.$el.addClass('record-mode');
                this.$('#playback-mode-record').prop('checked', true);
            }
            else {
                this.$el.removeClass('record-mode');
                this.$('#playback-mode-play').prop('checked', true);
            }
        },

        /**
         * Hides whichever variable row the user wanted to hide.
         */
        hideRow: function(event) {
            $(event.target).parents('.variable-row').addClass('collapsed');
            
            this._layoutRows();
        },

        /**
         * Shows whichever variable row the user wanted to show.
         */
        showRow: function(event) {
            $(event.target).parents('.variable-row').removeClass('collapsed');
            
            this._layoutRows();
        },

        /**
         * Applies special classes to rows after one was hidden/shown.
         */
        _layoutRows: function() {
            // Get the total height we have to work with
            var height = $(window).height() > 500 ? 480 : 340;

            // Clear previously set heights
            this.$('.variable-row').each(function(){
                $(this).css('height', '');
            });

            // Get lists of each kind of row
            var $visibleRows   = this.$('.variable-row').not('.collapsed');
            var $collapsedRows = this.$('.variable-row.collapsed');

            // Calculate the height of each visible row
            var totalCollapsedHeight = $collapsedRows.length * $collapsedRows.outerHeight();
            var visibleRowHeight = (height - totalCollapsedHeight) / $visibleRows.length;

            // Apply that height to each of the visible rows
            $visibleRows.each(function(){
                $(this).innerHeight(visibleRowHeight);
            });

            // Resize the graphs
            this.positionGraphView.resize();
            this.velocityGraphView.resize();
            this.accelerationGraphView.resize();
        }

    });

    return ChartsSimView;
});
