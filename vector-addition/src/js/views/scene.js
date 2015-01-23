define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var Vector2 = require('common/math/vector2'); //AMW Not sure if I need this yet, may remove.
    var Rectangle = require('common/math/rectangle'); //AMW Not sure if I need this yet, may remove.
    var ModelViewTransform = require('common/math/model-view-transform'); //AMW Not sure if I need this yet, may remove.
    var PixiSceneView = require('common/pixi/view/scene');
    var Assets = require('assets');
    var Constants = require('constants');

    var VectorAdditionSceneView = PixiSceneView.extend({

        events: {

        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
            this.views = [];
            this.listenTo(this.simulation, 'change:showGrid', this.toggleGrid);
        },

        initGraphics: function() {
          this.drawGrid();
          this.drawXYLines();
          this.drawXYText();
          this.addSprite(Assets.createSprite(Assets.Images.Vector_Bin), 835, 10);
          this.addSprite(Assets.createSprite(Assets.Images.Trash_Can), 845, 510);
        },

        addSprite: function(asset, startX, startY) {
          asset.x = startX;
          asset.y = startY;
          this.stage.addChild(asset);
        },

        drawXYLines: function() {
          var canvas = $('.scene-view'),
          canWidth = canvas.width(),
          canHeight = canvas.height(),
          gridSize = Constants.GRID_SIZE,
          gridOffset = Constants.GRID_OFFSET,
          nbrYLines = Math.round(canWidth/gridSize),
          nbrXLines = Math.round(canHeight/gridSize),
          line = new PIXI.Graphics();
          line.lineStyle(2,0x666666);
          //x-axis
          line.moveTo(-gridOffset *gridSize, (nbrXLines- gridOffset) *gridSize);
          line.lineTo((nbrYLines+gridOffset) *gridSize, (nbrXLines - gridOffset) *gridSize);
          //y-axis
          line.moveTo(5 *gridSize, - gridOffset *gridSize);
          line.lineTo(5 *gridSize, (nbrXLines + gridOffset) *gridSize);
          this.stage.addChild(line);
        },

        drawXYText: function(displayedText, x, y) {
          var canvas = $('.scene-view'),
          canWidth = canvas.width(),
          canHeight = canvas.height(),
          gridSize = Constants.GRID_SIZE,
          textStyles = { font: '25px arial', color: 'black' },
          textX = new PIXI.Text('x', textStyles),
          textY = new PIXI.Text('y', textStyles);
          textX.x = 0.8 *canWidth;
          textX.y = canHeight - 9 *gridSize;
          textY.x = 3 *gridSize;
          textY.y = 5 *gridSize;

          this.stage.addChild(textX);
          this.stage.addChild(textY);
        },

        drawGrid: function() {
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
          this.stage.addChild(grid);
          this.grid = grid;
        },

        toggleGrid: function() {
          if (this.simulation.get('showGrid')) {
            this.grid.visible = true;
          }
          else {
            this.grid.visible = false;
          }
        }

    });

    return VectorAdditionSceneView;
});
