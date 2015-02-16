define(function (require) {

  'use strict';

  var Simulation = require('common/simulation/simulation');
  var ArrowViewModel = require('models/arrows');
  var VectorXViewModel = require('models/vector-x');
  var VectorYViewModel = require('models/vector-y');
  var SumVectorViewModel = require('models/sum-vector');

  var VectorAdditionSimulation = Simulation.extend({

    defaults: _.extend(Simulation.prototype.defaults, {
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
      deleteVector: false,
      componentStyles: 0,
      red: '0xFF0000',
      pink: '0xFFB4D9',
      green: '0x76EE00'

    }),

    initialize: function(attributes, options) {
        Simulation.prototype.initialize.apply(this, [attributes, options]);
    },

    initComponents: function() {
        this.initArrowsCollection();
        this.initArrows();
        this.initVectorX();
        this.initVectorY();
        this.initSumVector();
    },

    initArrowsCollection: function() {
      this.arrowCollection = new Backbone.Collection();
    },

    initArrows: function() {
      this.arrowViewModel = new ArrowViewModel();
    },

    initVectorX: function() {
      this.vectorXViewModel = new VectorXViewModel();
    },

    initVectorY: function() {
      this.vectorYViewModel = new VectorYViewModel();
    },

    initSumVector: function() {
      this.sumVectorViewModel = new SumVectorViewModel();
    }

  });

  return VectorAdditionSimulation;
});
