define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    var Wavefront           = require('models/wavefront');
    var WaveMedium          = require('models/wave-medium');
    var WaveFunction        = require('models/wave-function');
    var WavefrontOscillator = require('models/wavefront-oscillator');
    var SoundListener       = require('models/sound-listener');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var SoundSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {
            frequency: Constants.DEFAULT_FREQUENCY,
            amplitude: Constants.DEFAULT_AMPLITUDE,
            propagationSpeed: Constants.PROPAGATION_SPEED,
            audioEnabled: false,
            //timeScale: Constants.CLOCK_SCALE_FACTOR
        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                frameDuration: Constants.WAIT_TIME,
                deltaTimePerFrame: Constants.TIME_STEP
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:frequency',        this.frequencyChanged);
            this.on('change:amplitude',        this.amplitudeChanged);
            this.on('change:propagationSpeed', this.propagationSpeedChanged);
            this.on('change:paused',           this.pausedChanged);
            this.on('change:audioEnabled',     this.audioEnabledChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.waveMedium = new WaveMedium();

            this.primaryWavefront = new Wavefront({ propagationSpeed: this.get('propagationSpeed') });
            this.primaryWavefront.set('waveFunction', WaveFunction.SineWaveFunction(this.primaryWavefront));
            this.waveMedium.addWavefront(this.primaryWavefront);

            this.octaveWavefront = new Wavefront({ propagationSpeed: this.get('propagationSpeed') });
            this.octaveWavefront.set('waveFunction', WaveFunction.SineWaveFunction(this.octaveWavefront));
            this.octaveWavefront.set('maxAmplitude', 0);
            this.octaveWavefront.set('enabled', false);
            this.waveMedium.addWavefront(this.octaveWavefront);

            this.primaryOscillator = new WavefrontOscillator();
            this.octaveOscillator = new WavefrontOscillator();

            this.speakerListener = new SoundListener({ simulation: this });

            this.personListener = this.createPersonListener();
            this.personListener.setPosition(Constants.DEFAULT_LISTENER_X, Constants.DEFAULT_LISTENER_Y);
            
            this.setListenerToSpeaker();

            //this.octaveOscillator.setHarmonicFactor(2);
        },

        /**
         * Returns a new instance of SoundListener to be used as the person
         *   listener.  The intent is to override this in child classes.
         */
        createPersonListener: function() {
            return new SoundListener({ simulation: this });
        },

        _update: function(time, deltaTime) {
            this.waveMedium.update(time, deltaTime);

            this.speakerListener.update(time, deltaTime);
            this.personListener.update(time, deltaTime);

            // Update oscillators
            this.primaryOscillator.update(time, deltaTime);
            this.octaveOscillator.update(time, deltaTime);
        },

        frequencyChanged: function(simulation, frequency) {
            this.primaryWavefront.set('frequency', frequency / Constants.FREQUENCY_DISPLAY_FACTOR);
            this.octaveWavefront.set('frequency', 2 * frequency / Constants.FREQUENCY_DISPLAY_FACTOR);
        },

        amplitudeChanged: function(simulation, amplitude) {
            this.primaryWavefront.set('maxAmplitude', amplitude);
        },

        propagationSpeedChanged: function(simulation, propagationSpeed) {
            for (var i = 0; i < this.wavefronts.length; i++)
                this.wavefronts[i].set('propagationSpeed', propagationSpeed);
        },

        pausedChanged: function(simulation, paused) {
            if (paused)
                this.primaryOscillator.pause();
            else
                this.primaryOscillator.play();
        },

        audioEnabledChanged: function(simulation, audioEnabled) {
            this.primaryOscillator.set('enabled', audioEnabled);
        },

        clearWave: function() {
            this.waveMedium.clear();
        },

        setListenerToSpeaker: function() {
            this.primaryOscillator.set('listener', this.speakerListener);
            this.octaveOscillator.set('listener', this.speakerListener);
        },

        setListenerToPerson: function() {
            this.primaryOscillator.set('listener', this.personListener);
            this.octaveOscillator.set('listener', this.personListener);
        }

    });

    return SoundSimulation;
});
