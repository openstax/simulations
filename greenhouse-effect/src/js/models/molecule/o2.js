define(function (require) {

    'use strict';

    var Molecule   = require('models/molecule');
    var OxygenAtom = require('models/atom/oxygen');
    var AtomicBond = require('models/atomic-bond');

    var INITIAL_OXYGEN_OXYGEN_DISTANCE = 170; // In picometers

    /**
     * Class that represents O2 (oxygen) in the model.
     */
    var O2 = Molecule.extend({

        initialize: function(attributes, options) {
            Molecule.prototype.initialize.apply(this, arguments);

            // Create and add atoms
            this.oxygenAtom1 = this.addAtom(new OxygenAtom());
            this.oxygenAtom2 = this.addAtom(new OxygenAtom());

            // Create and add bonds
            this.addAtomicBond(new AtomicBond(this.atoms[this.oxygenAtom1], this.atoms[this.oxygenAtom2], 2));

            // Set the initial offsets.
            this.initAtomOffsets();
        },

        /**
         * Initialize sthe offsets from the center of gravity for each atom
         *   within this molecule.  This should be in the "relaxed" (i.e.
         *   non-vibrating) state.
         */
        initAtomOffsets: function() {
            this.getInitialAtomCogOffset(this.oxygenAtom1).set(-INITIAL_OXYGEN_OXYGEN_DISTANCE / 2, 0);
            this.getInitialAtomCogOffset(this.oxygenAtom2).set( INITIAL_OXYGEN_OXYGEN_DISTANCE / 2, 0);

            this.updateAtomPositions();
        }

    });

    return O2;
});
