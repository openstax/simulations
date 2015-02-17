define(function (require) {

  'use strict';

  var PIXI = require('pixi');
  var Vectors = require('vector-addition');

  var ComponentVectors = {

    showVectors: function(theta, vectorXContainer, vectorYContainer) {

      if (vectorYContainer !== undefined) {
        if (theta == 0 || theta == 180) {
          vectorYContainer.visible = false;
        }
        else {
          vectorYContainer.visible = true;
        }
      }

      if (vectorXContainer !== undefined) {
        if (theta == 90 || theta == -90 ) {
          vectorXContainer.visible = false;
        }
        else {
          vectorXContainer.visible = true;
        }
      }

    },

    showComponentStyles: function(vectorYModel, vectorXModel, arrowModel, model, vectorXContainer, vectorYContainer, vectorYView, vectorXView) {
      var vectorYModel = vectorYModel;
      var vectorXModel = vectorXModel;
      var arrowViewModel = arrowModel;
      var oldOriginX = vectorYModel.get('oldOriginX');

      if (model.get('componentStyles') == 0) {
        vectorXContainer.visible = false;
        vectorYContainer.visible = false;
      }
      else {
        vectorXContainer.visible = true;
        vectorYContainer.visible = true;
      }

      if (model.get('componentStyles') == 1) {
        vectorYModel.set('originX', oldOriginX);
        vectorYView.transformFrame.rotation = vectorYModel.get('rotation');
        vectorXView.transformFrame.rotation = vectorXModel.get('rotation');

      }

      if (model.get('componentStyles') == 2) {
        vectorYModel.set('originX', arrowModel.get('targetX'));
        vectorXView.transformFrame.rotation = vectorXModel.get('rotation');
      }

      if (model.get('componentStyles') == 3) {

      }
    }
  }

 return ComponentVectors;

});
