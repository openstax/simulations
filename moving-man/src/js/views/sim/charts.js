define(function(require) {

	'use strict';

	var _ = require('underscore');

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
	 *
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

			'change .playback-mode' : 'changePlaybackMode'
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
			this.positionGraphView = new MovingManGraphView({
				title: '',
				x: null,
				y: {
					start: -10,
					end:    10,
					step:    5,
					label:  '',
					showNumbers: true
				},
				lineColor: '#2575BA',
				latitudinalGridLines: 3,
				longitudinalGridLines: 9,
				graphSeries: this.simulation.movingMan.positionGraphSeries,
				timeSpan: this.simulation.get('maxTime')
			});

			this.velocityGraphView = new MovingManGraphView({
				title: '',
				x: null,
				y: {
					start: -12,
					end:    12,
					step:    6,
					label:  '',
					showNumbers: true
				},
				lineColor: '#CD2520',
				latitudinalGridLines: 3,
				longitudinalGridLines: 9,
				graphSeries: this.simulation.movingMan.velocityGraphSeries,
				timeSpan: this.simulation.get('maxTime')
			});

			this.accelerationGraphView = new MovingManGraphView({
				title: '',
				x: {
					start: 0,
					end:  20,
					step:  2,
					label: 'time (sec)',
					showNumbers: true
				},
				y: {
					start: -60,
					end:    60,
					step:   30,
					label:  '',
					showNumbers: true
				},
				lineColor: '#349E34',
				latitudinalGridLines: 3,
				longitudinalGridLines: 9,
				graphSeries: this.simulation.movingMan.accelerationGraphSeries,
				timeSpan: this.simulation.get('maxTime')
			});

			this.positionGraphView.render();
			this.velocityGraphView.render();
			this.accelerationGraphView.render();

			this.$('.position-row').append(this.positionGraphView.el);
			this.$('.velocity-row').append(this.velocityGraphView.el);
			this.$('.acceleration-row').append(this.accelerationGraphView.el);

			this.positionGraphView.postRender();
			this.velocityGraphView.postRender();
			this.accelerationGraphView.postRender();
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
		 *
		 */
		postRender: function() {
			MovingManSimView.prototype.postRender.apply(this);

			this.positionGraphView.postRender();
			this.velocityGraphView.postRender();
			this.accelerationGraphView.postRender();
		},

		/**
		 *
		 */
		update: function(time, delta) {
			MovingManSimView.prototype.update.apply(this, [time, delta]);

			this.positionGraphView.update(time, delta);
			this.velocityGraphView.update(time, delta);
			this.accelerationGraphView.update(time, delta);
		},

		/**
		 *
		 */
		rewind: function(event) {
			this.pause();
			this.simulation.rewind();
		},

		/**
		 *
		 */
		clear: function(event) {
			this.pause();
			this.simulation.resetTimeAndHistory();
		},

		/**
		 *
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
		 *
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
			if (this.simulation.get('recording'))
				this.$el.addClass('record-mode');
			else
				this.$el.removeClass('record-mode');
		},

		/**
		 * The simulation changed its paused state.
		 */
		pausedChanged: function() {
			if (this.simulation.get('paused'))
				this.$el.removeClass('playing');
			else
				this.$el.addClass('playing');
		},

	});

	return ChartsSimView;
});
