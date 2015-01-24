define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiSceneView = require('common/pixi/view/scene');
  var VectorBinView = require('views/vector-bin');
  var GridView = require('views/grid');
  var TrashCanView = require('views/trash-can');
  var Assets = require('assets');
  var Constants = require('constants');

  var VectorAdditionSceneView = PixiSceneView.extend({

    initialize: function(options) {
      PixiSceneView.prototype.initialize.apply(this, arguments);
      this.views = [];
    },

    initGraphics: function() {
      this.initGridView();
      this.drawXY();
      this.initVectorBin();
      this.initTrashCan();
    },

    drawXY: function() {
      var canvas = $('.scene-view'),
      canWidth = canvas.width(),
      canHeight = canvas.height(),
      gridSize = Constants.GRID_SIZE,
      gridOffset = Constants.GRID_OFFSET,
      nbrYLines = Math.round(canWidth/gridSize),
      nbrXLines = Math.round(canHeight/gridSize),
      textStyles = { font: '25px arial', color: 'black' },
      textX = new PIXI.Text('x', textStyles),
      textY = new PIXI.Text('y', textStyles),
      line = new PIXI.Graphics();
      
      line.lineStyle(2,0x666666);
      //x-axis
      line.moveTo(-gridOffset *gridSize, (nbrXLines- gridOffset) *gridSize);
      line.lineTo((nbrYLines+gridOffset) *gridSize, (nbrXLines - gridOffset) *gridSize);
      //y-axis
      line.moveTo(5 *gridSize, - gridOffset *gridSize);
      line.lineTo(5 *gridSize, (nbrXLines + gridOffset) *gridSize);
      this.stage.addChild(line);

      textX = new PIXI.Text('x', textStyles),
      textY = new PIXI.Text('y', textStyles);
      textX.x = 0.8 *canWidth;
      textX.y = canHeight - 9 *gridSize;
      textY.x = 3 *gridSize;
      textY.y = 5 *gridSize;

      this.stage.addChild(textX);
      this.stage.addChild(textY);
    },

    initGridView: function() {
      var gridView = new GridView({
        model: this.simulation
      });
      this.gridView = gridView;
      this.stage.addChild(gridView.displayObject);
    },

    initVectorBin: function() {
      var binView = new VectorBinView({
        model: this.simulation
      });
      this.binView = binView;
      this.stage.addChild(binView.displayObject);
    },

    initTrashCan: function() {
      var trashCanView = new TrashCanView({
        model: this.simulation
      });
      this.trashCanView = trashCanView;
      this.stage.addChild(trashCanView.displayObject);
    }

  });

  return VectorAdditionSceneView;
});
