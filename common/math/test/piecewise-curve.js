
describe('PiecewiseCurve', function(){

	var PiecewiseCurve;

	before(function(done) {
		require(['../piecewise-curve'], function(piecewiseCurve) {
			PiecewiseCurve = piecewiseCurve;
			done();
		});
	});

	it('stores points through #moveTo, #lineTo, and #close', function(){
		var curve = PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(5, 2);
		curve.lineTo(9, 4);
		curve.close();

		chai.expect(curve.xPoints).to.deep.equal([0, 5, 9, 0]);
		chai.expect(curve.yPoints).to.deep.equal([0, 2, 4, 0]);

		chai.expect(curve.index).to.equal(4);
		chai.expect(curve.subcurve).to.equal(0);
	});

	it('should #translate correctly', function(){
		var curve = PiecewiseCurve();
		curve.moveTo(2, 2);
		curve.lineTo(4, 4);
		curve.translate(1, -1);

		chai.expect(curve.xPoints).to.deep.equal([3, 5]);
		chai.expect(curve.yPoints).to.deep.equal([1, 3]);
	});

	it('should #rotate correctly', function(){
		var curve = PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 0);
		curve.lineTo(2, -1);
		curve.rotate(Math.PI / 2);

		chai.expect(curve.xPoints).to.almost.eql([0, 0, 1]);
		chai.expect(curve.yPoints).to.almost.eql([0, 1, 2]);
	});

});