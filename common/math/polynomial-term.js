define(function (require) {

    'use strict';

    /**
     * Polynomial term
     */
    var PolynomialTerm = function(power, coeff) {
        if (coeff === undefined) {
            this.power = 0;
            this.coeff = power;
        }
        else {
            this.power = power;
            this.coeff = coeff;
        }
    };

    PolynomialTerm.prototype.getPower = function() {
        return this.power;
    };

    PolynomialTerm.prototype.getCoeff = function() {
        return this.coeff;
    };

    PolynomialTerm.prototype.derive = function(numDerivations) {
        if (numDerivations === undefined) {
            return this._derive();
        }
        else {
            var term = this;
            for (var i = 0; i < numDerivations; i++)
                term = term.derive();
            return term;
        }
    };

    PolynomialTerm.prototype._derive = function() {
        if (this.power === 0)
            return PolynomialTerm.ZERO;
        else
            return new PolynomialTerm(power - 1, coeff * power);
    };

    PolynomialTerm.prototype.eval = function(x) {
        return Math.pow(x, this.power) * this.coeff;
    };

    PolynomialTerm.prototype.times = function(that) {
        return new PolynomialTerm(this.power + that.power, this.coeff * that.coeff);
    };

    PolynomialTerm.prototype.plus = function(that) {
        if (this.power === that.power)
            return new PolynomialTerm(this.power, this.coeff + that.coeff);
        else
            throw 'Illegal argument';
    };

    PolynomialTerm.prototype.equals = function(that) {
        if (this === that)
            return true;
        if (that === null)
            return false;

        if (this.coeff !== that.coeff)
            return false;
        if (this.power !== that.power)
            return false;

        return true;
    };

    PolynomialTerm.ZERO = new PolynomialTerm(0, 0);

    return PolynomialTerm;

});