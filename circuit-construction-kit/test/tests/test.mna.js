
describe('Modified Nodal Analysis', function(){

	var Term;
	var MNACircuit;
	var MNASolution;
	var MNACompanionBattery;
	var MNACompanionResistor;

	var THRESHOLD = 1E-6;

	before(function(done) {
		require([
			'models/mna/term', 
			'models/mna/mna-circuit', 
			'models/mna/mna-solution',
			'models/mna/elements/companion-battery',
			'models/mna/elements/companion-resistor'
		], function(term, mnaCircuit, mnaSolution, mnaCompanionBattery, mnaCompanionResistor) {
			Term = term;
			MNACircuit = mnaCircuit;
			MNASolution = mnaSolution;
			MNACompanionBattery = mnaCompanionBattery
			MNACompanionResistor = mnaCompanionResistor
			done();
		});
	});

	it('Term objects extend PooledObject functionality', function(){
		var owner = {};
		var obj = Term.createWithOwner(owner, 3, 'x');

		chai.expect(Term._ownedObjects.length).to.equal(1);
		chai.expect(obj.coefficient).to.equal(3);
		chai.expect(obj.variable).to.equal('x');
		chai.expect(Term._pool.list.length).to.equal(1);

		Term.destroyAllOwnedBy(owner);

		chai.expect(Term._ownedObjects[owner.__ownerId].length).to.equal(0);
		chai.expect(Term._pool.reserve.length).to.equal(1);
		chai.expect(Term._pool.list.length).to.equal(0);
	});

	it('MNACircuit should give correct solution for simple circuits', function(){
		var battery = MNACompanionBattery.create(0, 1, 4.0);
		var resistor = MNACompanionResistor.create(1, 0, 4.0);
		var circuit = MNACircuit.create([ battery ], [ resistor ], []);

		var voltageMap = [];
		voltageMap[0] = 0.0;
		voltageMap[1] = 4.0;

		var desiredSolution = new MNASolution.create(voltageMap, [ battery ]);
		var solution = circuit.solve();

		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;

		var currentThroughResistor = solution.getCurrent(resistor);
		chai.expect(currentThroughResistor).almost.eql(1.0, THRESHOLD) // Should be flowing forward through resistor
	});

	it('MNACircuit should give correct solution for simple circuits (2)', function(){
		var battery = MNACompanionBattery.create(0, 1, 4.0);
		var resistor = MNACompanionResistor.create(1, 0, 2.0);
		var circuit = MNACircuit.create([ battery ], [ resistor ], []);

		var voltageMap = [];
		voltageMap[0] = 0.0;
		voltageMap[1] = 4.0;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = 2.0;
		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		var solution = circuit.solve();

		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});
	
});