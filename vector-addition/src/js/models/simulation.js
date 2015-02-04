define(function (require) {

  'use strict';

  var Simulation = require('common/simulation/simulation');

  var VectorAdditionSimulation = Simulation.extend({

    defaults: {
      showGrid: false,
      rText: '',
      thetaText: '',
      rXText: '',
      rYText: '',
      emptyStage: false
    }

  });

  return VectorAdditionSimulation;
});
