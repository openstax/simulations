define(function (require) {

    'use strict';

    var MNAElement = require('models/mna/elements/element');

    /**
     * CurrentSource model for the MNA circuit
     */
    var MNACurrentSource = MNAElement.extend();


    return MNACurrentSource;
});