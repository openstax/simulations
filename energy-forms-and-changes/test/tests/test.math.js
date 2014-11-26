// TODO: Move this test to common after configuring a tester for common files

describe('PiecewiseCurve', function(){

	var PiecewiseCurve;

	before(function(done) {
		require(['common/math/piecewise-curve'], function(piecewiseCurve) {
			PiecewiseCurve = piecewiseCurve;
			done();
		});
	});

	it('stores points through #moveTo, #lineTo, and #close', function(){
		var curve = new PiecewiseCurve();
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
		var curve = new PiecewiseCurve();
		curve.moveTo(2, 2);
		curve.lineTo(4, 4);
		curve.translate(1, -1);

		chai.expect(curve.xPoints).to.deep.equal([3, 5]);
		chai.expect(curve.yPoints).to.deep.equal([1, 3]);
	});

	it('should #rotate correctly', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 0);
		curve.lineTo(2, -1);
		curve.rotate(Math.PI / 2);

		chai.expect(curve.xPoints).to.almost.eql([0, 0, 1]);
		chai.expect(curve.yPoints).to.almost.eql([0, 1, 2]);
	});

});

describe('ModelViewTransform', function(){

	var ModelViewTransform;
	var Vector2;
	var Rectangle;

	before(function(done) {
		require(['common/math/model-view-transform', 'vector2-node', 'rectangle-node'], function(modelViewTransform, vector2, rectangle) {
			ModelViewTransform = modelViewTransform;
			Vector2 = vector2;
			Rectangle = rectangle;

			done();
		});
	});

	it('should transform a point with no offset', function(){
		var s = 5; // scale
		var mvt = ModelViewTransform.createOffsetScaleMapping(new Vector2(0, 0), s, s);
		var pointA = new Vector2(1, 1);
		var pointB = new Vector2(s, s);

		pointA = mvt.modelToView(pointA);

		chai.expect(pointA.x).to.almost.equal(pointB.x);
		chai.expect(pointA.y).to.almost.equal(pointB.y);
	});

});