define(function (require) {

  'use strict';

  var Simulation = require('common/simulation/simulation');
  var VectorsViewModel = require('models/vectors');
  var Constants = require('constants');

  var VectorAdditionSimulation = Simulation.extend({

    defaults: _.extend(Simulation.prototype.defaults, {
      showGrid: false,
      sumVectorVisible: false,
      rText: 0,
      thetaText: 0,
      rXText: 0,
      rYText: 0,
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
      green: '0x66CD00',
      lightGreen: '0x76EE00',
      darkOrange: '0xEE7600'

    }),

    initialize: function(attributes, options) {
        Simulation.prototype.initialize.apply(this, [attributes, options]);
    },

    initComponents: function() {
        this.initVectorsCollection();
        this.initVectors();
    },

    initVectorsCollection: function() {
      this.vectorCollection = new Backbone.Collection();
    },

    initVectors: function() {
      this.vectorViewModel = new VectorsViewModel();
    },

    updateReadouts: function(container, model, vectorModel, x, y, length) {
      var width = x;
      var height = y;

      if (vectorModel.get('targetX') < vectorModel.get('originX')) {
        width = -x;
      }
      else if (vectorModel.get('targetY') > vectorModel.get('originY')) {
        height = -y;
      }

      if (width == 20) {
        width = 0
      }
      else if (height == 20) {
        height = 0
      }

      var sizeX = vectorModel.get('targetX') - vectorModel.get('originX');
      var sizeY = vectorModel.get('originY') - vectorModel.get('targetY');

      vectorModel.set('degrees', this.calculateDegrees(width, height, vectorModel));
      this.set('rText', this.padZero(this.round1(length/Constants.GRID_SIZE)));
      this.set('thetaText', this.padZero(this.round1(vectorModel.get('degrees'))));
      this.set('rXText', this.round0(sizeX/Constants.GRID_SIZE));
      this.set('rYText', this.round0(sizeY/Constants.GRID_SIZE));
    },

    resetOrigins: function(vectorModel) {
      vectorModel.set('originX', vectorModel.get('oldOriginX'));
      vectorModel.set('originY', vectorModel.get('oldOriginY'));
    },

    clearComponentLines: function(lines) {
      if (lines !== undefined) {
        lines.clear();
      }
    },

    //PHET
    calculateLength: function(x, y) {
      return Math.sqrt(x * x + y * y);
    },

    calculateDegrees: function(x, y, vectorModel) {
      var degrees = (180/Math.PI) * Math.atan2(y, x);
      if (vectorModel !== undefined) {
      if (vectorModel.get('targetY') > vectorModel.get('originY') && vectorModel.get('targetX') < vectorModel.get('originX') || degrees == 180) {
        return -degrees;
        }
      }
      return degrees;
    },

    roundGrid: function(nbr) {
      var gridSize = Constants.GRID_SIZE;
      return (nbr/gridSize)*gridSize;
    },

    round0: function(nbr) {
      return Math.round(nbr);
    },

    round1: function(nbr) {
      var ans = (Math.round(nbr *100)) /100;
      return ans;
    },

    padZero: function(nbr) {
      var text = nbr;

      if (nbr % 1 == 0) {
        text = text + ".0"
        }

      return text;
    },

  });

  return VectorAdditionSimulation;
});
