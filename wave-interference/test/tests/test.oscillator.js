
describe('Oscillator', function(){

	var WaveSimulation;
	var Oscillator;

	before(function(done) {
		require(['models/wave-sim', 'models/oscillator'], function(wavesim, oscillator) {
			WaveSimulation = wavesim;
			Oscillator = oscillator;
			done();
		});
	});

	it('should give correct time-based output of oscillation values', function(){
		var waveSimulation = new WaveSimulation();
		var oscillator = waveSimulation.oscillators[0];

		chai.expect(oscillator.oscillatingValue(0)).to.equal(oscillator.amplitude);

		oscillator.frequency = 1;
		oscillator.amplitude = 1;
		oscillator.pulsePhase = 0;
		chai.expect(oscillator.oscillatingValue(1)).to.equal(1);
	});

	it('should write values to propagator\'s source lattices', function(){
		var waveSimulation = new WaveSimulation();
		var oscillator = waveSimulation.oscillators[0];
		var propagator = waveSimulation.propagator;
		var x = oscillator.x = 0;
		var y = oscillator.y = 0;
		var r = oscillator.radius = 0;

		oscillator.update(0);

		chai.expect(propagator.getSourceValue(x, y)).to.equal(oscillator.amplitude);
		chai.expect(propagator.getSourceValue(x, y + 1)).to.equal(0);
	});

	it('should correctly calculate the next peak time', function(){
		var waveSimulation = new WaveSimulation();
		var oscillator = waveSimulation.oscillators[0];

		oscillator.frequency = 1;

		oscillator.time = 0;
		chai.expect(oscillator.getNextPeakTime()).to.equal(1);
		oscillator.time = 1;
		chai.expect(oscillator.getNextPeakTime()).to.equal(2);
		oscillator.time = 2;
		chai.expect(oscillator.getNextPeakTime()).to.equal(3);
	});

	it('should correctly calculate the next trough time', function(){
		var waveSimulation = new WaveSimulation();
		var oscillator = waveSimulation.oscillators[0];

		oscillator.frequency = 0.5;
		
		oscillator.time = 0;
		chai.expect(oscillator.getNextTroughTime()).to.equal(1);
		oscillator.time = 2;
		chai.expect(oscillator.getNextTroughTime()).to.equal(3);
		oscillator.time = 3;
		chai.expect(oscillator.getNextTroughTime()).to.equal(5);
	});
});