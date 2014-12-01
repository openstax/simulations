
describe('Intro Simulation', function(){

	var IntroSimulation;
	var Vector2;
	var Rectangle;

	before(function(done) {
		require([
			'models/simulation/intro', 
			'common/math/vector2', 
			'common/math/rectangle'
		], function(introSimulation, vector2, rectangle) {
			IntroSimulation = introSimulation;
			Vector2 = vector2;
			Rectangle = rectangle;

			done();
		});
	});

	it('should #determineAllowedTranslation', function(){
		var sim = new IntroSimulation();

		/* ####    ####
		 * ####    ####
		 * ####    ####
		 * ####    ####
		 * . . . . . . 
		 * 0 2 4 6 8 10
		 */
		var rectA = new Rectangle(0, 0, 4, 4);
		var rectB = new Rectangle(8, 0, 4, 4);

		// This translation should be allowed because there's no overlap
		var proposedTranslation = new Vector2(1, 0);
		var allowedTranslation = sim.determineAllowedTranslation(rectA, rectB, proposedTranslation, false);

		chai.expect(allowedTranslation.x).to.almost.equal(proposedTranslation.x);
		chai.expect(allowedTranslation.y).to.almost.equal(proposedTranslation.y);

		// This translation will need to have 0.1 shaved off of the x component
		proposedTranslation.set(4.1, 0);
		allowedTranslation = sim.determineAllowedTranslation(rectA, rectB, proposedTranslation, false);

		chai.expect(allowedTranslation.x).to.almost.equal(4);
		chai.expect(allowedTranslation.y).to.almost.equal(0);
	});

});