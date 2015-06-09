define(function(require) {

  'use strict';

  var PIXI = require('pixi');

  var PixiSceneView = require('common/pixi/view/scene');
  var GridView      = require('common/pixi/view/grid');
  var AppView       = require('common/app/app');
  var Vector2       = require('common/math/vector2');
  var Rectangle     = require('common/math/rectangle');
  
  var VectorBinView = require('views/vector-bin');
  //var GridView = require('views/grid');
  var TrashCanView  = require('views/trash-can');
  var SumVectorView = require('views/sum-vector');

  var Assets = require('assets');
  var Constants = require('constants');

  // CSS
  require('less!styles/scene');

  var VectorAdditionSceneView = PixiSceneView.extend({

    initialize: function(options) {
      PixiSceneView.prototype.initialize.apply(this, arguments);
      this.views = [];

      this.listenTo(this.simulation, 'change:showGrid', this.toggleGrid);
    },

    initGraphics: function() {
      var origin = new Vector2();

      if (AppView.windowIsShort()) {
        origin.x = Constants.SHORT_GRID_ORIGIN_X * Constants.GRID_SIZE - 1;
        origin.y = this.height - Constants.SHORT_GRID_ORIGIN_Y * Constants.GRID_SIZE;
      }
      else {
        origin.x = Constants.GRID_ORIGIN_X * Constants.GRID_SIZE;
        origin.y = this.height - Constants.GRID_ORIGIN_Y * Constants.GRID_SIZE - 1;
      }

      this.initGridView(origin);
      this.initAxes(origin);
      this.initVectorBin();
      this.initTrashCan();
      this.initSumVector();
    },

    initAxes: function(origin) {
      var line = new PIXI.Graphics();
      line.lineStyle(2, 0x676767);

      // X-axis
      line.moveTo(0,          origin.y);
      line.lineTo(this.width, origin.y);

      // Y-axis
      line.moveTo(origin.x, 0);
      line.lineTo(origin.x, this.height);
      this.stage.addChild(line);

      // Labels
      var textStyles = { font: '25px arial', color: 'black' };
      var textX = new PIXI.Text('x', textStyles);
      var textY = new PIXI.Text('y', textStyles);

      textX.x = 0.8 * this.width;
      textX.y = origin.y;

      textY.anchor.x = 1;
      textY.x = origin.x;
      textY.y = 5 * Constants.GRID_SIZE;

      this.stage.addChild(textX);
      this.stage.addChild(textY);
    },

    initGridView: function(origin) {
      this.gridView = new GridView({
          origin: origin,
          bounds: new Rectangle(0, 0, this.width, this.height),
          gridSize: Constants.GRID_SIZE * 5,
          smallGridSize: Constants.GRID_SIZE,
          smallGridEnabled: true,

          lineColor: Constants.GRID_COLOR,
          lineWidth: 3,
          lineAlpha: 1,

          smallLineColor: Constants.GRID_COLOR,
          smallLineWidth: 1,
          smallLineAlpha: 1
      });

      this.stage.addChild(this.gridView.displayObject);
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
    },

    initSumVector: function() {
      var sumVectorView = new SumVectorView({
        model: this.simulation
      });
      this.sumVectorView = sumVectorView;
      this.stage.addChild(sumVectorView.displayObject);
    },

    toggleGrid: function(simulation, showGrid) {
      if (showGrid)
        this.gridView.show();
      else
        this.gridView.hide();
    }

  });

  return VectorAdditionSceneView;
});
