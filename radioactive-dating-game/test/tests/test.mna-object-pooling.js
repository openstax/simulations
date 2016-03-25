
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
    var DynamicCircuit;

    var MNACapacitor;
    var MNAInductor;
    var MNAResistiveBattery;
    var MNAResistor;
    var MNACompanionBattery;
    var MNACompanionResistor;
    var MNACurrentSource;

    var Term;
    var UnknownCurrent;
    var UnknownVoltage;
    var Equation;

    var Battery;
    var Capacitor;
    var Wire;
    var Switch;
    var Junction;
    var Circuit;

    var Vector2;

    before(function(done) {
        require([
            'models/mna/circuit-solver', 
            'models/mna/mna-circuit', 
            'models/mna/mna-solution',
            'models/mna/dynamic-circuit',

            'models/mna/elements/capacitor',
            'models/mna/elements/inductor',
            'models/mna/elements/resistive-battery',
            'models/mna/elements/resistor',
            'models/mna/elements/companion-battery',
            'models/mna/elements/companion-resistor',
            'models/mna/elements/current-source',

            'models/mna/term',
            'models/mna/unknown-current',
            'models/mna/unknown-voltage',
            'models/mna/equation',

            'models/components/battery',
            'models/components/capacitor',
            'models/components/wire',
            'models/components/switch',
            'models/junction',
            'models/circuit',

            'common/math/vector2'
        ], function(
            mnaCircuitSolver, 
            mnaCircuit, 
            mnaSolution, 
            dynamicCircuit,
            mnaCapacitor,
            mnaInductor,
            mnaResistiveBattery,
            mnaResistor,
            mnaCompanionBattery, 
            mnaCompanionResistor, 
            mnaCurrentSource, 
            term,
            unknownCurrent,
            unknownVoltage,
            equation,
            battery,
            capacitor,
            wire,
            swtch,
            junction,
            circuit,
            vector2
        ) {
            MNACircuitSolver = mnaCircuitSolver;
            MNACircuit = mnaCircuit;
            MNASolution = mnaSolution;
            DynamicCircuit = dynamicCircuit;

            MNACapacitor = mnaCapacitor;
            MNAInductor = mnaInductor;
            MNAResistiveBattery = mnaResistiveBattery;
            MNAResistor = mnaResistor;
            MNACompanionBattery = mnaCompanionBattery;
            MNACompanionResistor = mnaCompanionResistor;
            MNACurrentSource = mnaCurrentSource;

            Term = term;
            UnknownCurrent = unknownCurrent;
            UnknownVoltage = unknownVoltage;
            Equation = equation;

            Battery = battery;
            Capacitor = capacitor;
            Wire = wire;
            Switch = swtch;
            Junction = junction;
            Circuit = circuit;

            Vector2 = vector2;

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

    it('DynamicCircuit destroys all objects it creates', function() {
        resetPool(MNAResistiveBattery);
        resetPool(MNAResistor);

        var j = [
            new Junction({ position: new Vector2(0, 0) }), 
            new Junction({ position: new Vector2(1, 1) }), 
            new Junction({ position: new Vector2(2, 2) }), 
            new Junction({ position: new Vector2(3, 3) }), 
            new Junction({ position: new Vector2(4, 4) })
        ];

        var circuit = new Circuit();

        var battery = new Battery({ 
            voltage: 9.0, 
            internalResistance: 1E-9,
            startJunction: j[0],
            endJunction:   j[1]
        });

        var capacitor = new Capacitor({
            resistance: 1E-6,
            capacitance: 1.0,
            startJunction: j[1],
            endJunction: j[2]
        });

        var myswitch = new Switch({ 
            position: j[2].get('position'), 
            length: 1,
            height: 1,
            startJunction: j[2],
            endJunction:   j[3]
        }, {
            direction: new Vector2(0, 1)
        });

        var wire = new Wire({
            startJunction: j[3],
            endJunction:   j[4]
        });

        circuit.addBranch(battery);
        circuit.addBranch(capacitor);
        circuit.addBranch(myswitch);
        circuit.addBranch(wire);

        var dynamicCircuit = DynamicCircuit.fromCircuit(circuit);

        chai.expect(MNACapacitor._pool.list.length).to.above(0);
        chai.expect(MNAResistiveBattery._pool.list.length).to.above(0);
        chai.expect(MNAResistor._pool.list.length).to.above(0);
        
        dynamicCircuit.destroy();

        chai.expect(MNACapacitor._pool.list.length).to.equal(0);
        chai.expect(MNAResistiveBattery._pool.list.length).to.equal(0);
        chai.expect(MNAResistor._pool.list.length).to.equal(0);
    });

});