define(function (require) {

    'use strict';

    /**
     * Source ported from phet.common.phetcommon.math.Function.
     */
    var Functions = {};

    Functions.createLinearFunction = function(minInput, maxInput, minOutput, maxOutput) {
        var func = function(x) {
            var output = func.t1 + x;
            output *= func.scale;
            output += func.t2;
            return output;
        };

        func.update = function() {
            func.t1 = ( -func.minInput );
            func.scale = ( func.maxOutput - func.minOutput ) / ( func.maxInput - func.minInput );
            func.t2 = func.minOutput;
        };

        func.set = function(minInput, maxInput, minOutput, maxOutput) {
            func.minInput = minInput;
            func.maxInput = maxInput;
            func.minOutput = minOutput;
            func.maxOutput = maxOutput;
            func.update();
        };

        func.minInput = minInput;
        func.maxInput = maxInput;
        func.minOutput = minOutput;
        func.maxOutput = maxOutput;
        func.update();

        func.createInverse = function() {
            return Functions.createLinearFunction(minOutput, maxOutput, minInput, maxInput);
        };
        
        return func;
    };

    return Functions;

});