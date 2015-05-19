define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Atom = require('models/atom');

    var Constants = require('constants');

    /**
     * Class that represents a carbon atom.
     */
    var HydrogenAtom = Atom.extend({

        defaults: _.extend({}, Atom.prototype.defaults, {
            radius: Constants.HydrogenAtom.RADIUS,
            mass:   Constants.HydrogenAtom.MASS,
            color:  Constants.HydrogenAtom.COLOR
        })

    }, Constants.HydrogenAtom);

    return HydrogenAtom;
});
