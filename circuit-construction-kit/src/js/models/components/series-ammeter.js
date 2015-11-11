define(function (require) {

    'use strict';

    var CircuitComponent = require('models/components/circuit-component');

    /**
     * A series ammeter
     */
    var SeriesAmmeter = CircuitComponent.extend();

    return SeriesAmmeter;
});