
describe('Utils', function(){

	var Utils;

	before(function(done) {
		require([
			'../../src/js/utils/utils.js'
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

	it('should determine the angle of a line in degrees from (1, 0) counter-clockwise', function(){
		var start = {
			x: 0,
			y: 0
		};
		var end90 = {
			x: 0,
			y: 1
		};
		var endNeg90 = {
			x: 0,
			y: -1
		};

		var result90 = Utils.angleFromLine(start.x, start.y, end90.x, end90.y);
		chai.expect(result90).to.be.below(90.01);
		chai.expect(result90).to.be.above(89.99);

		var resultNeg90 = Utils.angleFromLine(start.x, start.y, endNeg90.x, endNeg90.y);
		chai.expect(resultNeg90).to.be.below(-89.99);
		chai.expect(resultNeg90).to.be.above(-90.01);
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

	it('should convert various color formats to rgba', function(){
		var expected = 'rgba(255,0,0,0.5)';

		chai.expect(Utils.toRgba('#ff0000', 0.5)).to.equal(expected);
		chai.expect(Utils.toRgba( 'ff0000', 0.5)).to.equal(expected);
		chai.expect(Utils.toRgba('rgb(255, 0,0)', 0.5)).to.equal(expected);
		chai.expect(Utils.toRgba('rgba(255, 0, 0, 0.5)')).to.equal(expected);

		expected = 'rgba(0,0,255,1)';

		chai.expect(Utils.toRgba('#0000ff', 1)).to.equal(expected);
		chai.expect(Utils.toRgba('#0000ff')).to.equal(expected);
		chai.expect(Utils.toRgba('rgb(0,0,255,0.3)', 1)).to.equal(expected);
		chai.expect(Utils.toRgba('rgb(0,0,255,1)')).to.equal(expected);
	});
});