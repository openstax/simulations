define(function (require) {

    'use strict';

    var Molecule     = require('models/molecule');
    var NitrogenAtom = require('models/atom/nitrogen');
    var AtomicBond   = require('models/atomic-bond');

    var INITIAL_NITROGEN_NITROGEN_DISTANCE = 170; // In picometers

    /**
     * Class that represents N2 (nitrogen) in the model.
     */
    var N2 = Molecule.extend({

        initialize: function(attributes, options) {
            Molecule.prototype.initialize.apply(this, arguments);

            // Create and add atoms
            this.nitrogenAtom1 = this.addAtom(new NitrogenAtom());
            this.nitrogenAtom2 = this.addAtom(new NitrogenAtom());

            // Create and add bonds
            this.addAtomicBond(new AtomicBond(this.nitrogenAtom1, this.nitrogenAtom2, 3));

            // Set the initial offsets.
            this.initAtomOffsets();
        },

        /**
         * Initialize sthe offsets from the center of gravity for each atom
         *   within this molecule.  This should be in the "relaxed" (i.e.
         *   non-vibrating) state.
         */
        initAtomOffsets: function() {
            this.getInitialAtomCogOffset(this.nitrogenAtom1).set(-INITIAL_NITROGEN_NITROGEN_DISTANCE / 2, 0);
            this.getInitialAtomCogOffset(this.nitrogenAtom2).set( INITIAL_NITROGEN_NITROGEN_DISTANCE / 2, 0);

            this.updateAtomPositions();
        }

    });

    return N2;
});
