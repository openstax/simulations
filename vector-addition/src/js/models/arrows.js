define(function(require) {

  'use strict';

  var Backbone = require('backbone');

  var ArrowsModel = Backbone.Model.extend({

    defaults: {
      x: 0,
      y: 0,
      height: 0,
      width: 0
    }

  });

  return ArrowsModel;
})
