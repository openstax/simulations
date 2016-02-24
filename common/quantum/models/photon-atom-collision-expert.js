define(function (require) {

    'use strict';

    var Photon = require('./photon');
    var Atom   = require('./atom');

    /**
     * Detects and handles collisions between two bodies if one is a photon and one is an atom
     */
    var PhotonAtomCollisionExpert = {

        detectAndDoCollision: function(body1, body2) {
            var photon;
            var atom;

            if (body1 instanceof Atom)
                atom = body1;
            else if (body1 instanceof Photon)
                photon = body1;

            if (body2 instanceof Atom)
                atom = body2;
            else if (body2 instanceof Photon)
                photon = body2;

            if (atom && photon) {
                if (photon.get('position').distanceSq(atom.get('position')) < atom.get('radius') * atom.get('radius'))
                    atom.collideWithPhoton(photon);
            }

            return false;
        }

    };


    return PhotonAtomCollisionExpert;
});