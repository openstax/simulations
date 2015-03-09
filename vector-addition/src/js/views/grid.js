define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Colors   = require('common/colors/colors');
  var Constants = require('constants');

  var GridView = PixiView.extend({

    initialize: function(options) {
      this.initGraphics();
      this.listenTo(this.model, 'change:showGrid', this.toggleGrid);
    },

    initGraphics: function() {
      this.drawGrid();
    },

    drawGrid: function() {
      this.gridContainer = new PIXI.DisplayObjectContainer();
      var canvas = $('.scene-view');
      var startX = 0;
      var startY = 0;
      var canWidth = canvas.width();
      var canHeight = canvas.height();
      var gridSize = Constants.GRID_SIZE;
      var gridOffset = Constants.GRID_OFFSET;
      var gridColor = Colors.parseHex(Constants.GRID_COLOR);
      var nbrYLines = Math.round(canWidth/gridSize);
      var nbrXLines = Math.round(canHeight/gridSize);
      var grid = new PIXI.Graphics();
      grid.lineStyle(1, gridColor);
      grid.moveTo(0,0);

      for (var i = -gridOffset; i < nbrXLines + gridOffset; i++) {
        if ((i+2)%5 == 0) {
          grid.lineStyle(3, gridColor);
        } else {
          grid.lineStyle(1, gridColor);
        }

        grid.moveTo((startX - gridOffset) *gridSize, i*gridSize);
        grid.lineTo((nbrYLines + gridOffset) *gridSize, i*gridSize);
      }

      for (var j = -gridOffset; j < nbrYLines + gridOffset; j++) {
        if (j%5 == 0) {
          grid.lineStyle(3, gridColor);
        } else {
          grid.lineStyle(1, gridColor);
        }

        grid.moveTo(j*gridSize, (startY - gridOffset) *gridSize);
        grid.lineTo(j*gridSize, (nbrXLines + gridOffset) *gridSize);
      }

      grid.visible = false;
      this.gridContainer.addChild(grid);
      this.displayObject.addChild(this.gridContainer);
      this.grid = grid;
    },

    toggleGrid: function() {
      if (this.model.get('showGrid')) {
        this.grid.visible = true;
      }
      else {
        this.grid.visible = false;
      }
    }

  });

  return GridView;
});
