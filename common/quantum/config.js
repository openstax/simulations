define(function (require) {

    'use strict';

    var WavelengthColors = require('common/colors/wavelength');

    var QuantumConfig = {};

    QuantumConfig.STIMULATION_LIKELIHOOD = 0.2;
    QuantumConfig.ENABLE_ALL_STIMULATED_EMISSIONS = true;

    // Tolerances used to determine if a photon matches with an atomic state energy
    QuantumConfig.ENERGY_TOLERANCE = 0.05;

    QuantumConfig.MIN_WAVELENGTH = WavelengthColors.MIN_WAVELENGTH;
    QuantumConfig.MAX_WAVELENGTH = WavelengthColors.MAX_WAVELENGTH;

    QuantumConfig.PIXELS_PER_NM = 1E6;

    return QuantumConfig;
});
