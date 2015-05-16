define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * Represents an atomic bond between two atoms.
     */
    var AtomicBond = function(atom1, atom2, bondCount) {
        this.atom1 = atom1;
        this.atom2 = atom2;
        this.bondCount = bondCount;
    };

    /**
     * Instance functions/properties
     */
    _.extend(AtomicBond.prototype, {

        getAtom1: function() {
            return this.atom1;
        },

        getAtom2: function() {
            return this.atom2;
        },

        getBondCount: function() {
            return this.bondCount;
        }

    });

    return AtomicBond;
});
