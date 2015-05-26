define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Atom = require('models/atom');

    var Constants = require('constants');

    /**
     * Class that represents a carbon atom.
     */
    var OxygenAtom = Atom.extend({

        defaults: _.extend({}, Atom.prototype.defaults, {
            radius: Constants.OxygenAtom.RADIUS,
            mass:   Constants.OxygenAtom.MASS,
            color:  Constants.OxygenAtom.COLOR
        })

    }, Constants.OxygenAtom);

    return OxygenAtom;
});
