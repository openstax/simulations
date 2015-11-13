define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var MNAElement   = require('models/mna/elements/element');
    var MNAResistor  = require('models/mna/elements/resistor');
    var MNABattery   = require('models/mna/elements/battery');
    var MNACapacitor = require('models/mna/elements/capacitor');
    var MNAInductor  = require('models/mna/elements/inductor');

    var Constants = require('constants');

    /**
     * Solves for unknowns in resistive circuits using the Modified Nodal Analysis (MNA) method.
     *   This method is outlined here: 
     *
     *   http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA3.html
     *
     * Other links that are helpful for understanding:
     *   
     *   http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA1.html
     *   http://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html
     *
     * To solve for a circuit's unknowns and apply the solution back for any given point in
     *   time, use the "apply" function.
     */
    var MNACircuitSolver = function() {
        
    };

    _.extend(MNACircuitSolver.prototype, {

        

    });

    return MNACircuitSolver;
});