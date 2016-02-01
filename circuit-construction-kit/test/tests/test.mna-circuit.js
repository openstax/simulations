
describe('Modified Nodal Analysis - MNACircuit', function(){

    var MNACircuitSolver;
    var MNACircuit;
    var MNASolution;
    var MNACompanionBattery;
    var MNACompanionResistor;
    var MNACurrentSource;

    var Junction;
    var Battery;
    var Resistor;
    var Circuit;

    var Vector2;
    var luqr;

    var THRESHOLD = 1E-6;
    var FUDGE = THRESHOLD - 8E-7;

    before(function(done) {
        require([
            'models/mna/circuit-solver',
            'models/mna/mna-circuit', 
            'models/mna/mna-solution',
            'models/mna/elements/companion-battery',
            'models/mna/elements/companion-resistor',
            'models/mna/elements/current-source',
            'models/junction',
            'models/components/battery',
            'models/components/resistor',
            'models/circuit',
            'common/math/vector2',
            'common/math/luqr'
        ], function(mnaCircuitSolver, mnaCircuit, mnaSolution, mnaCompanionBattery, mnaCompanionResistor, mnaCurrentSource, junction, battery, resistor, circuit, vector2, _luqr) {
            MNACircuitSolver = mnaCircuitSolver;
            MNACircuit = mnaCircuit;
            MNASolution = mnaSolution;
            MNACompanionBattery = mnaCompanionBattery;
            MNACompanionResistor = mnaCompanionResistor;
            MNACurrentSource = mnaCurrentSource;

            Junction = junction;
            Battery = battery;
            Resistor = resistor;
            Circuit = circuit;

            Vector2 = vector2;
            luqr = _luqr.luqr;
            
            done();
        });
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

    it('wacky node order won\'t break things', function(){
        var battery   = MNACompanionBattery.create( 0, 3, 10);
        var resistor1 = MNACompanionResistor.create(1, 2, 10);
        var resistor2 = MNACompanionResistor.create(2, 0, 10);
        var resistor3 = MNACompanionResistor.create(3, 1,  5);

        var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2, resistor3 ], []);

        var solution = circuit.solve();

        var batterySolutionCurrent = 10 / 25;

        chai.expect(solution.branchCurrents[battery.id].currentSolution).to.almost.equal(batterySolutionCurrent);
    });

    it('wacky node order won\'t break things - control', function(){
        var battery   = MNACompanionBattery.create( 0, 1, 10);
        var resistor1 = MNACompanionResistor.create(1, 2, 10);
        var resistor2 = MNACompanionResistor.create(2, 3, 10);
        var resistor3 = MNACompanionResistor.create(3, 0,  5);

        var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2, resistor3 ], []);

        var solution = circuit.solve();

        var batterySolutionCurrent = 10 / 25;

        chai.expect(solution.branchCurrents[battery.id].currentSolution).to.almost.equal(batterySolutionCurrent);
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

    it('MNACircuitSolver should convert and solve simple core circuits', function(){
        var junction0 = new Junction({ position: new Vector2(0, 0) });
        var junction1 = new Junction({ position: new Vector2(1, 0) });
        var junction2 = new Junction({ position: new Vector2(0, 1) });

        var battery = new Battery({
            startJunction: junction0,
            endJunction: junction1,
            voltageDrop: 5,
            internalResistance: 0,
            internalResistanceOn: true
        });

        var resistor1 = new Resistor({
            startJunction: junction1,
            endJunction: junction2,
            resistance: 10
        });

        var resistor2 = new Resistor({
            startJunction: junction2,
            endJunction: junction0,
            resistance: 10
        });

        var circuit = new Circuit();
        circuit.addBranch(battery);
        circuit.addBranch(resistor1);
        circuit.addBranch(resistor2);

        var solver = new MNACircuitSolver();
        solver.solve(circuit, 1 / 30);

        var batterySolutionCurrent = 5 / 20;

        chai.expect(battery.get('current')).to.almost.equal(batterySolutionCurrent);
    });

    it('MNACircuitSolver should convert and solve core circuits with resistive batteries', function(){
        var junction0 = new Junction({ position: new Vector2(0, 0) });
        var junction1 = new Junction({ position: new Vector2(1, 0) });
        var junction2 = new Junction({ position: new Vector2(0, 1) });
        var junction3 = new Junction({ position: new Vector2(1, 1) });

        var battery = new Battery({
            startJunction: junction0,
            endJunction: junction3,
            voltageDrop: 10,
            internalResistance: 0,
            internalResistanceOn: true
        });

        var resistor1 = new Resistor({
            startJunction: junction1,
            endJunction: junction2,
            resistance: 10
        });

        var resistor2 = new Resistor({
            startJunction: junction2,
            endJunction: junction0,
            resistance: 10
        });

        var resistor3 = new Resistor({
            startJunction: junction3,
            endJunction: junction1,
            resistance: 5
        });

        var circuit = new Circuit();
        circuit.addBranch(battery);
        circuit.addBranch(resistor1);
        circuit.addBranch(resistor2);
        circuit.addBranch(resistor3);

        // Works -------------------
        // var junction0 = new Junction({ position: new Vector2(0, 0) });
        // var junction1 = new Junction({ position: new Vector2(1, 0) });
        // var junction2 = new Junction({ position: new Vector2(0, 1) });
        // var junction3 = new Junction({ position: new Vector2(1, 1) });

        // var battery = new Battery({
        //     startJunction: junction0,
        //     endJunction: junction1,
        //     voltageDrop: 10,
        //     internalResistance: 0,
        //     internalResistanceOn: true
        // });

        // var resistor1 = new Resistor({
        //     startJunction: junction1,
        //     endJunction: junction2,
        //     resistance: 10
        // });

        // var resistor2 = new Resistor({
        //     startJunction: junction2,
        //     endJunction: junction3,
        //     resistance: 10
        // });

        // var resistor3 = new Resistor({
        //     startJunction: junction3,
        //     endJunction: junction0,
        //     resistance: 5
        // });

        // var circuit = new Circuit();
        // circuit.addBranch(battery);
        // circuit.addBranch(resistor1);
        // circuit.addBranch(resistor2);
        // circuit.addBranch(resistor3);

        var solver = new MNACircuitSolver();
        solver.solve(circuit, 1 / 30);

        var batterySolutionCurrent = 10 / 25;

        chai.expect(battery.get('current')).to.almost.equal(batterySolutionCurrent);
    });

    it('LU decomposition works', function() {

        var A = [
            [ 0.00,     1.00,     0.00,     0.00,     0.00],
            [ 1.00,     0.10,     0.00,    -0.10,     0.00],
            [ 0.00,     0.00,     0.30,    -0.10,    -0.20],
            [ 0.00,    -0.10,    -0.10,     0.20,     0.00],
            [-1.00,     0.00,    -0.20,     0.00,     0.20],
            [ 0.00,    -1.00,     0.00,     0.00,     1.00]
        ];

        var B = [
             0,
             0,
             0,
             0,
             0,
            10
        ];

        var X = luqr.solve(A, B);

        chai.expect(X).to.almost.eql([
            0.4,
            0,
            8,
            4,
            10,
            0
        ]);
    });

});