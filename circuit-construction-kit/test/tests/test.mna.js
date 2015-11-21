
describe('Modified Nodal Analysis', function(){

	var Term;
	var MNACircuit;
	var MNASolution;
	var MNACompanionBattery;
	var MNACompanionResistor;
	var MNACurrentSource;

	var THRESHOLD = 1E-6;
	var FUDGE = THRESHOLD - 8E-7;

	before(function(done) {
		require([
			'models/mna/term', 
			'models/mna/mna-circuit', 
			'models/mna/mna-solution',
			'models/mna/elements/companion-battery',
			'models/mna/elements/companion-resistor',
			'models/mna/elements/current-source'
		], function(term, mnaCircuit, mnaSolution, mnaCompanionBattery, mnaCompanionResistor, mnaCurrentSource) {
			Term = term;
			MNACircuit = mnaCircuit;
			MNASolution = mnaSolution;
			MNACompanionBattery = mnaCompanionBattery;
			MNACompanionResistor = mnaCompanionResistor;
			MNACurrentSource = mnaCurrentSource;
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

	/**
	 * Circuit-solving unit tests beyond this point are from PhET's newest version of
	 *   the sim which is currently under development.
	 *   https://github.com/phetsims/circuit-construction-kit-basics/
	 */

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

	it('returned MNASolution should be able to obtain the current of a given resistor', function(){
		var battery = MNACompanionBattery.create(0, 1, 4.0);
		var resistor = MNACompanionResistor.create(1, 0, 2.0);
		var solution = MNACircuit.create([ battery ], [ resistor ], []).solve();

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = 4;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = 2;
		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);

		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;

		var currentThroughResistor = solution.getCurrent(resistor);
		// Same magnitude as battery: positive because current flows from node 1 to 0
		chai.expect(currentThroughResistor).almost.eql(2.0, THRESHOLD)
	});

	it('an unconnected resistor should not cause problems for MNACircuit', function(){
		var battery   = MNACompanionBattery.create( 0, 1, 4.0);
		var resistor1 = MNACompanionResistor.create(1, 0, 4.0);
		var resistor2 = MNACompanionResistor.create(2, 3, 100);

		var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], []);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = 4;
		voltageMap[2] = 0;
		voltageMap[3] = 0;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = 1;

		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('current sources given to MNACircuit\'s constructor should provide current', function(){
		var currentSource = MNACurrentSource.create(0, 1, 10);
		var resistor  = MNACompanionResistor.create(1, 0, 4.0);

		var circuit = MNACircuit.create([], [ resistor ], [ currentSource ]);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = -40 // This is negative since traversing across the resistor should yield a negative voltage, see http://en.wikipedia.org/wiki/Current_source;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, []);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('current should be reversed when voltage is reversed', function(){
		var battery  = MNACompanionBattery.create( 0, 1, -4.0);
		var resistor = MNACompanionResistor.create(1, 0,  2.0);
		var solution = MNACircuit.create([ battery ], [ resistor ], []).solve();

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = -4;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = -2;
		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);

		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('two batteries in series should have voltage added', function(){
		var battery1 = MNACompanionBattery.create( 0, 1, -4);
		var battery2 = MNACompanionBattery.create( 1, 2, -4);
		var resistor = MNACompanionResistor.create(2, 0,  2);

		var solution = MNACircuit.create([ battery1, battery2 ], [ resistor ], []).solve();

		var voltageMap = [];
		voltageMap[0] =  0 + FUDGE;
		voltageMap[1] = -4 + FUDGE;
		voltageMap[2] = -8 + FUDGE;

		var solutionBattery1 = MNACompanionBattery.create(battery1.node0, battery1.node1, battery1.voltage);
		var solutionBattery2 = MNACompanionBattery.create(battery2.node0, battery2.node1, battery2.voltage);
		solutionBattery1.currentSolution = -4;
		solutionBattery2.currentSolution = -4;
		var branchCurrents = [];
		branchCurrents[solutionBattery1.id] = solutionBattery1;
		branchCurrents[solutionBattery2.id] = solutionBattery2;

		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);

		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('two resistors in series should have resistance added', function(){
		var battery   = MNACompanionBattery.create( 0, 1,  5);
		var resistor1 = MNACompanionResistor.create(1, 2, 10);
		var resistor2 = MNACompanionResistor.create(2, 0, 10);

		var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], []);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = 5;
		voltageMap[2] = 2.5 + FUDGE;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = 5 / 20;

		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('a resistor with one node unconnected shouldn\'t cause problems', function(){
		var battery   = MNACompanionBattery.create( 0, 1,   4);
		var resistor1 = MNACompanionResistor.create(1, 0,   4);
		var resistor2 = MNACompanionResistor.create(0, 2, 100);

		var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], []);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = 4;
		voltageMap[2] = 0 - FUDGE;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = 1;

		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('an unconnected resistor shouldn\'t cause problems', function(){
		var battery   = MNACompanionBattery.create( 0, 1,   4);
		var resistor1 = MNACompanionResistor.create(1, 0,   4);
		var resistor2 = MNACompanionResistor.create(2, 3, 100);

		var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], []);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = 4;
		voltageMap[2] = 0;
		voltageMap[3] = 0;

		var solutionBattery = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = 1;

		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('should handle resistor with no resistance', function(){
		var battery   = MNACompanionBattery.create( 0, 1,  5);
		var resistor1 = MNACompanionResistor.create(1, 2, 10);
		var resistor2 = MNACompanionResistor.create(2, 0,  0);

		var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], []);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = 5;
		voltageMap[2] = 0;

		var solutionBattery  = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		var solutionResistor = MNACompanionBattery.create(resistor2.node0, resistor2.node1, resistor2.voltage);
		solutionBattery.currentSolution  = 5 / 10;
		solutionResistor.currentSolution = 5 / 10;

		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;
		branchCurrents[solutionResistor.id] = solutionResistor;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

	it('resistors in parallel should have harmonic mean of resistance', function(){
		var V = 9.0;
		var R1 = 5.0;
		var R2 = 5.0;
		var Req = 1 / ( 1 / R1 + 1 / R2 );

		var battery   = MNACompanionBattery.create( 0, 1, V);
		var resistor1 = MNACompanionResistor.create(1, 0, R1);
		var resistor2 = MNACompanionResistor.create(1, 0, R2);

		var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], []);

		var voltageMap = [];
		voltageMap[0] = 0;
		voltageMap[1] = V - FUDGE;

		var solutionBattery  = MNACompanionBattery.create(battery.node0, battery.node1, battery.voltage);
		solutionBattery.currentSolution = V / Req;

		var branchCurrents = [];
		branchCurrents[solutionBattery.id] = solutionBattery;

		var solution = circuit.solve();
		var desiredSolution = new MNASolution.create(voltageMap, branchCurrents);
		chai.expect(solution.approxEquals(desiredSolution, THRESHOLD)).to.be.true;
	});

});