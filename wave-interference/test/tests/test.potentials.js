
describe('Potentials', function(){

	var Potential;
	var SegmentPotential;
	var BoxPotential;
	var CompositePotential;

	before(function(done) {
		require([
			'models/potential',
			'models/potential/segment',
			'models/potential/box',
			'models/potential/composite'
		], function(potential, segment, box, composite) {
			Potential          = potential;
			SegmentPotential   = segment;
			BoxPotential       = box;
			CompositePotential = composite;

			done();
		});
	});

	it('should calculate correct bounds on a segment potential', function(){
		var start = {
			x: 0,
			y: 1
		};
		var end = {
			x: 10,
			y: 1
		};

		var potential = new SegmentPotential({
			start: start,
			end: end,
			thickness: 2
		});

		// Should be within the bounds
		chai.expect(potential.getPotential(5, 0, 0)).to.be.ok;

		// Should be within the bounds
		chai.expect(potential.getPotential(5, 2, 0)).to.be.ok;
		
		// Should be too far below
		chai.expect(potential.getPotential(5, -1, 0)).to.not.be.ok;

		// Should be too far to the left
		chai.expect(potential.getPotential(-2, 1, 0)).to.not.be.ok;
	});

	it('should calculate correct bounds on a box potential', function(){
		var potential = new BoxPotential({
			x: 5,
			y: 5,
			width: 10,
			height: 10
		});

		// Should be right on the corner
		chai.expect(potential.getPotential(5, 5, 0)).to.be.ok;

		// Should be in the center of the box
		chai.expect(potential.getPotential(10, 10, 0)).to.be.ok;
		
		// Should be too far below the lower left corner
		chai.expect(potential.getPotential(2, 3, 0)).to.not.be.ok;

		// Should be too far to the left
		chai.expect(potential.getPotential(4, 10, 0)).to.not.be.ok;

		// Should be too far to the right
		chai.expect(potential.getPotential(16, 10, 0)).to.not.be.ok;

		// Should be too far above
		chai.expect(potential.getPotential(10, 16, 0)).to.not.be.ok;

		// Should be too far below
		chai.expect(potential.getPotential(10, 4, 0)).to.not.be.ok;
	});
});