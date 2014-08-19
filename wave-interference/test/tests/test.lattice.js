
describe('Lattice2D', function(){

	var Lattice2D;

	before(function(done) {
		require(['models/lattice2d'], function(model) {
			Lattice2D = model;
			done();
		});
	});

	it('should create a new lattice with initial values', function(){
		var height = 3;
		var width = 3;
		var val = -2;

		var data = [
			[-2, -2, -2],
			[-2, -2, -2],
			[-2, -2, -2]
		];

		var lattice = new Lattice2D({
			width: width,
			height: height,
			initialValue: val
		});

		chai.expect(lattice.height).to.equal(height);
		chai.expect(lattice.width).to.equal(width);
		chai.expect(lattice.data).to.deep.equal(data);
	});

	it('should clone a lattice', function(){
		var lattice1 = new Lattice2D();
		var lattice2 = lattice1.clone();

		chai.expect(lattice1).to.deep.equal(lattice2);
	});

	it('should copy a lattice', function(){
		var lattice1 = new Lattice2D({
			data: [
				[2, 0, 1],
				[0, 5, 4],
				[3, 0, 9]
			]
		});
		var lattice2 = new Lattice2D();

		lattice2.copy(lattice1);

		chai.expect(lattice1).to.deep.equal(lattice2);
	});

	it('should copy a lattice area', function(){
		// Check copying from smaller to larger
		var lattice1 = new Lattice2D({
			data: [
				[2, 8, 1],
				[8, 5, 4],
				[3, 8, 9]
			]
		});
		var lattice2 = new Lattice2D({
			width: 5,
			height: 5,
			initialValue: 0
		});
		var expectedResult = [
			[0, 0, 0, 0, 0],
			[0, 2, 8, 1, 0],
			[0, 8, 5, 4, 0],
			[0, 3, 8, 9, 0],
			[0, 0, 0, 0, 0]
		];
		lattice2.copyArea(lattice1, 3, 3, 0, 0, 1, 1);
		chai.expect(lattice2.data).to.deep.equal(expectedResult);

		// Check copying from larger to smaller
		lattice1 = new Lattice2D({
			data: expectedResult
		})
		lattice2 = new Lattice2D({
			width: 3,
			height: 3,
			initialValue: 0
		});
		expectedResult = [
			[2, 8, 1],
			[8, 5, 4],
			[3, 8, 9]
		];
		lattice2.copyArea(lattice1, 3, 3, 1, 1, 0, 0);console.log(lattice2.data); console.log(expectedResult);
		chai.expect(lattice2.data).to.deep.equal(expectedResult);
	});
});