describe('Models', function(){

	var Vector2;
	var VanillaPositionableObject;
	var VanillaMotionObject;

	before(function(done) {
		require([
			'math/vector2', 
			'models/positionable-object-vanilla',
			'models/motion-object-vanilla'
		], function(vector2, vanillaPositionableObject, vanillaMotionObject) {
			Vector2 = vector2;
			VanillaPositionableObject = vanillaPositionableObject;
			VanillaMotionObject = vanillaMotionObject;
			done();
		});
	});

	it('#create creates unique objects', function(){
		var position = new Vector2(1, 2);
		var object1 = VanillaPositionableObject.create({ position: position });
		var object2 = VanillaPositionableObject.create({ position: position });

		chai.expect(object1.get('position')).to.not.equal(object2.get('position'));
	});

	it('subclass #create creates unique objects', function(){
		var velocity = new Vector2(2, 4);
		var acceleration = new Vector2();
		var motionObj1 = VanillaMotionObject.create({ velocity: velocity, acceleration: acceleration });
		var motionObj2 = VanillaMotionObject.create({ velocity: velocity, acceleration: acceleration });

		chai.expect(motionObj1.get('velocity')).to.not.equal(motionObj2.get('velocity'));
		chai.expect(motionObj1.get('acceleration')).to.not.equal(motionObj2.get('acceleration'));
	});

});