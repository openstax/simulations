define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * There would be too much overhead to make each atom a Backbone
     *   model that gets updated individually, so we're going to
     *   keep it pretty simple here.
     */
    var Atom = function(x, y, radius, mass) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.acceleration = new Vector2();
        this.radius = radius;
        this.mass = mass;

        if (mass < 0)
            throw 'Mass is out of range.';
        if (radius < 0)
            throw 'Radius is out of range.';
    };

    /**
     * Instance functions/properties
     */
    _.extend(Atom.prototype, {

        clone: function() {
            return _.clone(this);
        }

        // The original atom model had listeners, but it's only
        //   necessary in the advanced and developer modes.

    });


    /*************************************************************************
     **                                                                     **
     **                       GENERATE ATOM SUB-CLASSES                     **
     **                                                                     **
     *************************************************************************/

    /**
     * Generates sub-classes that take the form Atom.OxygenAtom. To create a
     *   new instance of one of these specific atoms, just do something like
     *
     *   var atom = new Atom.OxygenAtom(0, 2);
     */
    _.each(Constants.Atoms, function(key) {
        // Define a generic constructor that uses constants for radius and mass
        Atom[key] = function(x, y) {
            Atom.apply(this, [x, y, Constants.Atoms[key].RADIUS, Constants.Atoms[key].MASS]);
        };

        // Apply instance functions/properties
        _.extend(Atom[key].prototype, Atom.prototype);

        // Apply static functions/properties
        _.extend(Atom[key], Constants.Atoms[key]);
    });


    return Atom;
});
