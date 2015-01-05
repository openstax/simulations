// TODO: Move this test to common after configuring a tester for common files

describe('PiecewiseCurve', function(){

	var PiecewiseCurve;
	var Rectangle;
	var Vector2;
	var _;

	before(function(done) {
		require(['common/math/piecewise-curve', 'common/math/rectangle', 'common/math/vector2', 'underscore'], function(piecewiseCurve, rectangle, vector2, underscore) {
			PiecewiseCurve = piecewiseCurve;
			Rectangle = rectangle;
			Vector2 = vector2;
			_ = underscore;
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

	it('#translate should translate points', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(2, 2);
		curve.lineTo(4, 4);
		curve.translate(1, -1);

		chai.expect(curve.xPoints).to.deep.equal([3, 5]);
		chai.expect(curve.yPoints).to.deep.equal([1, 3]);
	});

	it('#rotate should rotate points', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 0);
		curve.lineTo(2, -1);
		curve.rotate(Math.PI / 2);

		chai.expect(curve.xPoints).to.almost.eql([0, 0, 1]);
		chai.expect(curve.yPoints).to.almost.eql([0, 1, 2]);
	});

	it('#scale should scale points', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 0);
		curve.lineTo(3, 3);
		curve.scale(100);

		chai.expect(curve.xPoints).to.almost.eql([0, 100, 300]);
		chai.expect(curve.yPoints).to.almost.eql([0,   0, 300]);
	});

	it('should be able to chain #translate, #rotate and #scale', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 0);
		curve.lineTo(3, 3);
		curve
			.scale(100)
			.translate(-50, -50)
			.rotate(Math.PI / 2);

		chai.expect(curve.xPoints).to.almost.eql([ 50, 50, -250]);
		chai.expect(curve.yPoints).to.almost.eql([-50, 50,  250]);

		curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(1, 1);
		curve
			.translate(0, 2)
			.scale(2, 1)
			.rotate(Math.PI / 2);

		chai.expect(curve.xPoints).to.almost.eql([-2, -3]);
		chai.expect(curve.yPoints).to.almost.eql([ 0,  2]);
	});

	it('#getBounds should calculate bounds', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(4, 4);
		curve.lineTo(5, 4);
		curve.lineTo(5, 5);
		curve.lineTo(4, 5);
		curve.lineTo(4, 4);

		var bounds = curve.getBounds();

		chai.expect(bounds.x).to.almost.equal(4);
		chai.expect(bounds.y).to.almost.equal(4);
		chai.expect(bounds.w).to.almost.equal(1);
		chai.expect(bounds.h).to.almost.equal(1);
	});

	it('#evaluateCrossings should calculate number of axis intersections', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(2, 2);
		curve.lineTo(2, 4);
		curve.lineTo(4, 4);
		curve.lineTo(4, 2);
		curve.lineTo(2, 2);

		var pointInside = new Vector2(3, 3);

		var xIntersections = curve.evaluateCrossings(pointInside.x, pointInside.y, false, false, 99);
		var yIntersections = curve.evaluateCrossings(pointInside.x, pointInside.y, false, true,  99);

		chai.expect(xIntersections % 2).to.equal(1);
		chai.expect(yIntersections % 2).to.equal(1);

		var pointOutside = new Vector2(0, 3);

		xIntersections = curve.evaluateCrossings(pointOutside.x, pointOutside.y, false, false, 99);
		yIntersections = curve.evaluateCrossings(pointOutside.x, pointOutside.y, false, true,  99);

		chai.expect(xIntersections % 2).to.equal(0);
		chai.expect(yIntersections % 2).to.equal(0);
	});

	it('#contains should determine whether a point is inside the curve', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(2, 2);
		curve.lineTo(2, 4);
		curve.lineTo(4, 4);
		curve.lineTo(4, 2);
		curve.lineTo(2, 2);

		var pointInside  = new Vector2(3, 3);
		var pointOutside = new Vector2(0, 3);

		chai.expect(curve.contains(pointInside)).to.be.true;
		chai.expect(curve.contains(pointOutside)).to.not.be.true;

		curve = new PiecewiseCurve();
		curve
			.moveTo(0, 0)
			.curveTo(0, -2, 4, -2, 4, 0)
			.lineTo(4, 4)
			.curveTo(4, 6, 0, 6, 0, 4)
			.close();

		pointInside  = new Vector2(3, 3);
		pointOutside = new Vector2(8, 8);

		chai.expect(curve.contains(pointInside)).to.be.true;
		chai.expect(curve.contains(pointOutside)).to.not.be.true;
	});

	it('#intersects should correctly calculate intersection', function(){
		var curve = new PiecewiseCurve();
		curve.moveTo(0, 0);
		curve.lineTo(0, 4);
		curve.lineTo(4, 4);
		curve.lineTo(4, 0);
		curve.lineTo(0, 0);

		var boxRight  = new Rectangle( 5,  0, 4, 4);
		var boxLeft   = new Rectangle(-5,  0, 4, 4);
		var boxTop    = new Rectangle( 0,  5, 4, 4);
		var boxBottom = new Rectangle( 0, -5, 4, 4);

		chai.expect(curve.intersects(boxRight )).to.not.be.true;
		chai.expect(curve.intersects(boxLeft  )).to.not.be.true;
		chai.expect(curve.intersects(boxTop   )).to.not.be.true;
		chai.expect(curve.intersects(boxBottom)).to.not.be.true;

		boxRight.translate(-2, 0);
		boxLeft.translate(2, 0);
		boxTop.translate(0, -2);
		boxBottom.translate(0, 2);

		chai.expect(curve.intersects(boxRight )).to.be.true;
		chai.expect(curve.intersects(boxLeft  )).to.be.true;
		chai.expect(curve.intersects(boxTop   )).to.be.true;
		chai.expect(curve.intersects(boxBottom)).to.be.true;
	});

	it('can be used to calculate lines intersecting with a rectangle', function(){
		var line = new PiecewiseCurve();
		line.moveTo(-2, -2);
		line.lineTo( 6,  6);
		line.close(); // Note: it must be closed in order for this to work

		var rectA = new Rectangle( 0,  0, 4, 4);
		var rectB = new Rectangle(-6,  0, 4, 4); // Should miss it
		var rectC = new Rectangle( 0, -5, 4, 4); // Should miss it
		var rectD = new Rectangle( 0, -2, 4, 4);

		chai.expect(line.intersects(rectA)).to.be.true;
		chai.expect(line.intersects(rectB)).to.not.be.true;
		chai.expect(line.intersects(rectC)).to.not.be.true;
		chai.expect(line.intersects(rectD)).to.be.true;
	});

	it('can be used to calculate the bounding box of a line segment', function(){
		var line = new PiecewiseCurve();
		line.moveTo(0, 0);
		line.lineTo(4, 4);
		line.close(); // Note: it must be closed in order for this to work

		var bounds = line.getBounds();

		chai.expect(bounds.x).to.almost.equal(0);
		chai.expect(bounds.y).to.almost.equal(0);
		chai.expect(bounds.w).to.almost.equal(4);
		chai.expect(bounds.h).to.almost.equal(4);

		line = new PiecewiseCurve();
		line.moveTo( 0,  0);
		line.lineTo(-4, -4);
		line.close(); // Note: it must be closed in order for this to work

		bounds = line.getBounds();

		chai.expect(bounds.x).to.almost.equal(-4);
		chai.expect(bounds.y).to.almost.equal(-4);
		chai.expect(bounds.w).to.almost.equal( 4);
		chai.expect(bounds.h).to.almost.equal( 4);
	});

	it('#lineIntersectionPoints should calculate points of intersection with a line', function(){
		var rect = new Rectangle(0, 0, 5, 5);

		// Test a horizontal line running through the middle
		var intersections = rect.lineIntersectionPoints(-5, 3, 10, 3);

		var foundLeftIntersection = (_.findWhere(intersections, {
			x: 0,
			y: 3
		}) !== undefined);

		var foundRightIntersection = (_.findWhere(intersections, {
			x: 5,
			y: 3
		}) !== undefined);

		chai.expect(foundLeftIntersection).to.be.true;
		chai.expect(foundRightIntersection).to.be.true;

		// Test a vertical line running down the center
		intersections = rect.lineIntersectionPoints(new Vector2(3, 10), new Vector2(3, -5));

		var foundTopIntersection = (_.findWhere(intersections, {
			x: 3,
			y: 5
		}) !== undefined);

		var foundBottomIntersection = (_.findWhere(intersections, {
			x: 3,
			y: 0
		}) !== undefined);

		chai.expect(foundTopIntersection).to.be.true;
		chai.expect(foundBottomIntersection).to.be.true;

		// Test a diagonal line bisecting it from bottom left to top right
		intersections = rect.lineIntersectionPoints(-2, -2, 7, 7);

		var foundBottomLeftIntersection = (_.findWhere(intersections, {
			x: 0,
			y: 0
		}) !== undefined);

		var foundTopRightIntersection = (_.findWhere(intersections, {
			x: 5,
			y: 5
		}) !== undefined);

		chai.expect(foundBottomLeftIntersection).to.be.true;
		chai.expect(foundTopRightIntersection).to.be.true;
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
			'common/math/vector2', 
			'common/math/rectangle',
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