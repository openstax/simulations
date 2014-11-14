define(function (require) {

    'use strict';

    /**
     * Source ported from phet.common.phetcommon.math.Function.
     */
    var Functions = {};

    Functions.createLinearFunction = function(minInput, maxInput, minOutput, maxOutput) {
        var func = function(x) {
            var output = this.t1 + x;
            output *= this.scale;
            output += t2;
            return output;
        };

        func.update = function() {
            this.t1 = ( -this.minInput );
            this.scale = ( this.maxOutput - this.minOutput ) / ( this.maxInput - this.minInput );
            this.t2 = this.minOutput;
        };

        func.minInput = minInput;
        func.maxInput = maxInput;
        func.minOutput = minOutput;
        func.maxOutput = maxOutput;
        func.update();

        func.createInverse = function() {
            return this(minOutput, maxOutput, minInput, maxInput);
        };
        
        return func;
    };

    return Functions;

});