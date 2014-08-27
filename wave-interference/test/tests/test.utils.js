
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

		chai.expect(Utils.distanceFromSegment(5, 1, start.x, start.y, end.x, end.y)).to.be.below(0.1);
	});
});