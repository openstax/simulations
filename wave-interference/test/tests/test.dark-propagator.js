var sinon = require('sinon');
var mocha = require('mocha');
var chai  = require('chai');

var WavePropagator = require('../../src/js/models/wave-propagator.js');
var Lattice2D      = require('../../src/js/models/lattice2d.js');

describe('Dark Propagator', function(){

	it('propagates as expected', function(){
		var lattice = new Lattice2D({
			width: 5,
			height: 5,
			initialValue: 0
		});
		var propagator = new WavePropagator({
			lattice: lattice,
			damping: {
				x: 2,
				y: 2
			},
		});

		/* Make it look like this: [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 4, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		] */
		propagator.setSourceValue(2, 2, 4);

		propagator.propagate();

		// So it can propagate to this:
		chai.expect(lattice.data).to.deep.equal([
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 0, 1, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 0, 0, 0]
		]);
	});
});