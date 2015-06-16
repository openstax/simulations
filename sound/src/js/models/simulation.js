define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Wavefront     = require('models/wavefront');
    var WaveMedium    = require('models/wave-medium');
    var WaveFunction  = require('models/wave-function');
    var Oscillator    = require('models/oscillator');
    var SoundListener = require('models/sound-listener');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var SoundSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            frequency: Constants.DEFAULT_FREQUENCY,
            amplitude: Constants.DEFAULT_AMPLITUDE,
            propagationSpeed: null
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:frequency',        this.frequencyChanged);
            this.on('change:amplitude',        this.amplitudeChanged);
            this.on('change:propagationSpeed', this.propagationSpeedChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.waveMedium = new WaveMedium();

            this.primaryWavefront = new Wavefront();
            this.primaryWavefront.set('waveFunction', WaveFunction.SineWaveFunction(this.primaryWavefront));
            this.waveMedium.addWavefront(this.primaryWavefront);

            this.octaveWavefront = new Wavefront();
            this.octaveWavefront.set('waveFunction', WaveFunction.SineWaveFunction(this.octaveWavefront));
            this.octaveWavefront.set('maxAmplitude', 0);
            this.octaveWavefront.set('enabled', false);
            this.waveMedium.addWavefront(this.octaveWavefront);

            this.primaryOscillator = new Oscillator();
            this.octaveOscillator = new Oscillator();

            this.soundListener = new SoundListener({ model: this });
            this.primaryOscillator.set('listener', this.soundListener);
            this.octaveOscillator.set('listener', this.soundListener);

            //this.octaveOscillator.setHarmonicFactor(2);
        },

        _update: function(time, deltaTime) {
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
        }

    });

    return SoundSimulation;
});
