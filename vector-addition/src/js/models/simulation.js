define(function (require, exports, module) {

    'use strict';
    
    var Simulation = require('common/simulation/simulation');

    var VectorAdditionSimulation = Simulation.extend({

      defaults: {
        showGrid: false
      }

    });

    return VectorAdditionSimulation;
});
