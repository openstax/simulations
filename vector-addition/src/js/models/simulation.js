define(function (require) {

  'use strict';

  var Simulation = require('common/simulation/simulation');

  var VectorAdditionSimulation = Simulation.extend({

    defaults: {
      showGrid: false,
      sumVectorVisible: false,
      rText: '',
      thetaText: '',
      rXText: '',
      rYText: '',
      emptyStage: false,
      sumVectorRText: '',
      sumVectorThetaText: '',
      sumVectorRXText: '',
      sumVectorRYText: '',
      labelColor: 'red',
      deleteVector: false
    }

  });
  return VectorAdditionSimulation;
});
