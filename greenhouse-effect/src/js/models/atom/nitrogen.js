define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Atom = require('common/models/atom');

    var Constants = require('constants');

    /**
     * Class that represents a carbon atom.
     */
    var NitrogenAtom = Atom.extend({

        defaults: _.extend({}, Atom.prototype.defaults, {
            radius: Constants.NitrogenAtom.RADIUS,
            mass:   Constants.NitrogenAtom.MASS,
            color:  Constants.NitrogenAtom.COLOR
        })

    }, Constants.NitrogenAtom);

    return NitrogenAtom;
});
