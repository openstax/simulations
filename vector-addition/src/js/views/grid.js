define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
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
      var canvas = $('.scene-view'),
      startX = 0,
      startY = 0,
      canWidth = canvas.width(),
      canHeight = canvas.height(),
      gridSize = Constants.GRID_SIZE,
      gridOffset = Constants.GRID_OFFSET,
      nbrYLines = Math.round(canWidth/gridSize),
      nbrXLines = Math.round(canHeight/gridSize),
      grid = new PIXI.Graphics();
      grid.lineStyle(1, 0xFFDD00);
      grid.moveTo(0,0);

      for (var i = -gridOffset; i < nbrXLines + gridOffset; i++) {
        if ((i+2)%5 == 0) {
          grid.lineStyle(3, 0xFFDD00);
        } else {
          grid.lineStyle(1, 0xFFDD00);
        }

        grid.moveTo((startX - gridOffset) *gridSize, i*gridSize);
        grid.lineTo((nbrYLines + gridOffset) *gridSize, i*gridSize);
      }

      for (var j = -gridOffset; j < nbrYLines + gridOffset; j++) {
        if (j%5 == 0) {
          grid.lineStyle(3, 0xFFDD00);
        } else {
          grid.lineStyle(1, 0xFFDD00);
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
