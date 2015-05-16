define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Atom = require('common/models/atom');

    var Constants = require('constants');

    /**
     * Class that represents a carbon atom.
     */
    var CarbonAtom = Atom.extend({

        defaults: _.extend({}, Atom.prototype.defaults, {
            radius: Constants.CarbonAtom.RADIUS,
            mass:   Constants.CarbonAtom.MASS,
            color:  Constants.CarbonAtom.COLOR
        })

    }, Constants.CarbonAtom);

    return CarbonAtom;
});
