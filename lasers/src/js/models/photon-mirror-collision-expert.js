define(function (require) {

    'use strict';

    require('common/math/polyfills');
    var LineIntersection = require('common/math/line-intersection');
    var Photon           = require('common/quantum/models/photon-vanilla');

    var Mirror = require('./mirror');

    var Constants = require('../constants');

    /**
     * Detects and handles collisions between two bodies if one is a photon and one is an atom
     */
    var PhotonMirrorCollisonExpert = {

        detectAndDoCollision: function(body1, body2) {
            var photon;
            var mirror;

            if (body1 instanceof Mirror)
                mirror = body1;
            else if (body1 instanceof Photon)
                photon = body1;

            if (body2 instanceof Mirror)
                mirror = body2;
            else if (body2 instanceof Photon)
                photon = body2;

            if (mirror && photon) {
                var photonPathIntersectsMirror = LineIntersection.linesIntersect(
                    photon.getPreviousPosition().x, photon.getPreviousPosition().y,
                    photon.getPosition().x, photon.getPosition().y,
                    mirror.getPosition().x, mirror.getBounds().bottom(),
                    mirror.getPosition().x, mirror.getBounds().top()
                );

                if (photonPathIntersectsMirror && mirror.reflects(photon)) {
                    this.doCollision(photon, mirror);
                }
            }

            return false;
        },

        /**
         * This collision implementation "cheats" to make photons reflect horizontally if they
         *   are close to horizontal
         *
         * @param photon
         * @param mirror
         */
        doCollision: function(photon, mirror) {
            var cheatFactor = Constants.PHOTON_CHEAT_ANGLE;
            var dx = photon.getX() - mirror.getX();
            photon.setPosition(mirror.getX() - dx, photon.getY());

            var vx;
            var vy;
            if (Math.abs(photon.getVelocity().angle() % Math.PI) < cheatFactor) {
                vx = -photon.getVelocity().length() * Math.sign(photon.getVelocity().x);
                vy = 0;
            }
            else {
                vx = -photon.getVelocity().x;
                vy =  photon.getVelocity().y;
            }

            photon.setVelocity(vx, vy);
        }

    };


    return PhotonMirrorCollisonExpert;
});