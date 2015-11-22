
describe('Modified Nodal Analysis - Object Pooling', function(){

    var resetPool = function(pooledObjectClass) {
        if (pooledObjectClass._pool)
            pooledObjectClass._pool = undefined;
        if (pooledObjectClass._ownedObjects)
            pooledObjectClass._ownedObjects = undefined;
    };

    var MNACircuitSolver;
    var MNACircuit;
    var MNASolution;
    var MNACompanionBattery;
    var MNACompanionResistor;
    var MNACurrentSource;
    var Term;
    var UnknownCurrent;
    var UnknownVoltage;
    var Equation;

    before(function(done) {
        require([
            'models/mna/circuit-solver', 
            'models/mna/mna-circuit', 
            'models/mna/mna-solution',
            'models/mna/elements/companion-battery',
            'models/mna/elements/companion-resistor',
            'models/mna/elements/current-source',
            'models/mna/term',
            'models/mna/unknown-current',
            'models/mna/unknown-voltage',
            'models/mna/equation'
        ], function(
            mnaCircuitSolver, 
            mnaCircuit, 
            mnaSolution, 
            mnaCompanionBattery, 
            mnaCompanionResistor, 
            mnaCurrentSource, 
            term,
            unknownCurrent,
            unknownVoltage,
            equation
        ) {
            MNACircuitSolver = mnaCircuitSolver;
            MNACircuit = mnaCircuit;
            MNASolution = mnaSolution;
            MNACompanionBattery = mnaCompanionBattery;
            MNACompanionResistor = mnaCompanionResistor;
            MNACurrentSource = mnaCurrentSource;
            Term = term;
            UnknownCurrent = unknownCurrent;
            UnknownVoltage = unknownVoltage;
            Equation = equation;

            done();
        });
    });

    it('Term objects extend PooledObject functionality', function(){
        resetPool(Term);

        var owner = {};
        var obj = Term.createWithOwner(owner, 3, 'x');

        chai.expect(Term._ownedObjects.length).to.equal(1);
        chai.expect(obj.coefficient).to.equal(3);
        chai.expect(obj.variable).to.equal('x');
        chai.expect(Term._pool.list.length).to.equal(1);

        Term.destroyAllOwnedBy(owner);

        chai.expect(Term._ownedObjects[Term._getOwnerId(owner)].length).to.equal(0);
        chai.expect(Term._pool.reserve.length).to.equal(1);
        chai.expect(Term._pool.list.length).to.equal(0);
    });

    it('MNACircuit destroys all objects it creates', function() {
        resetPool(Term);
        resetPool(Equation);
        resetPool(UnknownCurrent);
        resetPool(UnknownVoltage);

        var battery   = MNACompanionBattery.create( 0, 1, 4);
        var resistor1 = MNACompanionResistor.create(1, 0, 4);
        var resistor2 = MNACompanionResistor.create(2, 3, 1);
        var currentSource = MNACurrentSource.create(0, 1, 1);

        var circuit = MNACircuit.create([ battery ], [ resistor1, resistor2 ], [ currentSource ]);
        var solution = circuit.solve();

        chai.expect(Term._pool.list.length).to.above(0);
        chai.expect(Equation._pool.list.length).to.above(0);
        chai.expect(UnknownCurrent._pool.list.length).to.above(0);
        chai.expect(UnknownVoltage._pool.list.length).to.above(0);
        
        circuit.destroy();

        chai.expect(Term._pool.list.length).to.equal(0);
        chai.expect(Equation._pool.list.length).to.equal(0);
        chai.expect(UnknownCurrent._pool.list.length).to.equal(0);
        chai.expect(UnknownVoltage._pool.list.length).to.equal(0);
    });

});