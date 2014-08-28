
describe('Utils', function(){

	var Utils;

	before(function(done) {
		require([
			'utils/utils'
		], function(utils) {
			Utils = utils;

			done();
		});
	});

	it('should correctly calculate distance between point and line segment', function(){
		var start = {
			x: 0,
			y: 1
		};
		var end = {
			x: 10,
			y: 1
		};

		var zero = Utils.distanceFromSegment(5, 1, start.x, start.y, end.x, end.y);
		chai.expect(zero).to.be.below(0.01);
		chai.expect(zero).to.be.above(-.01);

		var twoA = Utils.distanceFromSegment(-2, 1, start.x, start.y, end.x, end.y);
		chai.expect(twoA).to.be.below(2.01);
		chai.expect(twoA).to.be.above(1.99);

		var twoB = Utils.distanceFromSegment(5, 3, start.x, start.y, end.x, end.y);
		chai.expect(twoB).to.be.below(2.01);
		chai.expect(twoB).to.be.above(1.99);

		var three = Utils.distanceFromSegment(5, -2, start.x, start.y, end.x, end.y);
		chai.expect(three).to.be.below(3.01);
		chai.expect(three).to.be.above(2.99);
	});

	it('should calculate a unitized normal vector to a line', function(){
		var start = {
			x: 0,
			y: 1
		};
		var end = {
			x: 10,
			y: 1
		};

		var expected = {
			x: 0,
			y: 1
		};

		var result = Utils.normalVectorFromLine(start.x, start.y, end.x, end.y);
		chai.expect(result.x).to.be.below(expected.x + 0.01);
		chai.expect(result.x).to.be.above(expected.x - 0.01);
		chai.expect(result.y).to.be.below(expected.y + 0.01);
		chai.expect(result.y).to.be.above(expected.y - 0.01);
	});
});