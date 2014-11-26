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
	var PiecewiseCurve;

	before(function(done) {
		require([
			'common/math/model-view-transform', 
			'vector2-node', 
			'rectangle-node',
			'common/math/piecewise-curve'
		], function(modelViewTransform, vector2, rectangle, piecewiseCurve) {
			ModelViewTransform = modelViewTransform;
			Vector2 = vector2;
			Rectangle = rectangle;
			PiecewiseCurve = piecewiseCurve;

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

	it('should transform a point with offset', function(){
		var scale = 5; // scale
		var offsetX = 10;
		var offsetY = 10;
		var mvt = ModelViewTransform.createOffsetScaleMapping(new Vector2(offsetX, offsetY), scale, scale);
		var pointA = new Vector2(1, 1);
		var pointB = new Vector2(scale + offsetX, scale + offsetY);

		pointA = mvt.modelToView(pointA);

		chai.expect(pointA.x).to.almost.equal(pointB.x);
		chai.expect(pointA.y).to.almost.equal(pointB.y);
	});

	it('should transform a rectangle with no offset', function(){
		var s = 5; // scale
		var mvt = ModelViewTransform.createOffsetScaleMapping(new Vector2(0, 0), s, s);
		var w = 10;
		var h = 12;
		var rectA = new Rectangle(1, 1, w, h);
		var rectB = new Rectangle(s, s, w * s, h * s);

		rectA = mvt.modelToView(rectA);

		chai.expect(rectA.x).to.almost.equal(rectB.x);
		chai.expect(rectA.y).to.almost.equal(rectB.y);
		chai.expect(rectA.w).to.almost.equal(rectB.w);
		chai.expect(rectA.h).to.almost.equal(rectB.h);
	});

	it('should transform a rectangle with offset', function(){
		var s = 5; // scale
		var offsetX = 10;
		var offsetY = 10;
		var mvt = ModelViewTransform.createOffsetScaleMapping(new Vector2(offsetX, offsetY), s, s);
		var w = 10;
		var h = 12;
		var rectA = new Rectangle(1, 1, w, h);
		var rectB = new Rectangle(s + offsetX, s + offsetY, w * s, h * s);

		rectA = mvt.modelToView(rectA);

		chai.expect(rectA.x).to.almost.equal(rectB.x);
		chai.expect(rectA.y).to.almost.equal(rectB.y);
		chai.expect(rectA.w).to.almost.equal(rectB.w);
		chai.expect(rectA.h).to.almost.equal(rectB.h);
	});

	it('should transform a curve', function() {
		var s = 5;   // scale
		var ox = 10; // x offset
		var oy = 10; // y offset
		var mvt = ModelViewTransform.createOffsetScaleMapping(new Vector2(ox, oy), s, s);

		var curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 0);
		curve.lineTo(2, -1);

		var curve2 = mvt.modelToView(curve);

		chai.expect(curve2.xPoints).to.almost.eql([ox, s + ox, 2 * s + ox]);
		chai.expect(curve2.yPoints).to.almost.eql([oy, oy, -s + oy]);
	});

	it('#createSinglePointScaleInvertedYMapping should create the right transform matrix', function(){
		var scale = 1;
		var pointA = new Vector2(0, 0);
		var pointB = new Vector2(100, 100);

		var mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
			pointA.clone(), 
			pointB.clone(), 
			scale
		);
		
		pointA = mvt.modelToView(pointA);

		chai.expect(pointA.x).to.almost.equal(pointB.x);
		chai.expect(pointA.y).to.almost.equal(pointB.y);

		pointA.set(0, 0);
		pointB.set(100, 100);

		mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
			pointA,
			pointB,
			200
		);

		var rectA = new Rectangle(0, 1, 2, 2);
		var rectB = new Rectangle(100, -100, 400, 400);

		rectA = mvt.modelToView(rectA);

		chai.expect(rectA.x).to.almost.equal(rectB.x);
		chai.expect(rectA.y).to.almost.equal(rectB.y);
		chai.expect(rectA.w).to.almost.equal(rectB.w);
		chai.expect(rectA.h).to.almost.equal(rectB.h);
	});

});