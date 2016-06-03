define(function (require) {

    'use strict';

    var SchroedingerModel = require('hydrogen-atom/models/atomic-model/schroedinger');

    var ExperimentModel = SchroedingerModel.extend();

    return ExperimentModel;
});