
describe('Potentials', function(){

	var Potential;
	var BarrierPotential;
	var CompositePotential;

	before(function(done) {
		require([
			'models/potential',
			'models/barrier-potential',
			'models/composite-potential'
		], function(potential, barrierPotential, compositePotential) {
			Potential          = potential;
			BarrierPotential   = barrierPotential;
			CompositePotential = compositePotential;

			done();
		});
	});

	it('should calculate correct bounds on a barrier potential', function(){
		var start = {
			x: 0,
			y: 1
		};
		var end = {
			x: 10,
			y: 1
		};

		var barrier = new BarrierPotential({
			start: start,
			end: end,
			thickness: 2
		});

		// Should be within the bounds
		chai.expect(barrier.getPotential(5, 0, 0)).to.be.ok;

		// Should be within the bounds
		var p = barrier.getPotential(-5, 2, 0)
		
		// Should not be within the bounds
		chai.expect(barrier.getPotential(5, -1, 0)).to.not.be.ok;
	});
});