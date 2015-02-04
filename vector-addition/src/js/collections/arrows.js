define(function(require) {

  'use strict';

  var Backbone = require('backbone');
  var Simulation = require('models/simulation');

  var ArrowsCollection = Backbone.Collection.extend({
    model: Simulation

  });

  return ArrowsCollection;

})
