define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Assets = require('assets');
  var Constants = require('constants');

  var TrashCanView = PixiView.extend({

    events: {
      'mouseover .can': 'openTrashCan',
      'mouseout .can': 'closeTrashCan'
    },

    initialize: function(options) {
      this.initGraphics();
      this.listenTo(this.model, 'change:deleteVector', this.openCloseTrashCan);
    },

    initGraphics: function() {
      this.trashCan();
    },

    trashCan: function() {
      this.canContainer = new PIXI.DisplayObjectContainer();
      var can      = Assets.createSprite(Assets.Images.TRASH_CAN);
      var can_open = Assets.createSprite(Assets.Images.TRASH_CAN_OPEN);
      var canvas = $('.scene-view');

      this.canContainer.buttonMode = true;
      this.canContainer.addChild(can);
      this.can = can;

      var targetSpriteWidth = 126; // in pixels
      var scale = targetSpriteWidth / this.can.texture.width;

      this.can.scale.x = this.can.scale.y = scale;

      this.can.x = canvas.width() - this.can.width - 20;
      this.can.y = 0.70 * canvas.height();

      this.canContainer.addChild(can_open);
      this.can_open = can_open;
      this.can_open.x = this.can.x;
      this.can_open.y = 0.70 * canvas.height();
      this.can_open.scale.x = this.can_open.scale.y = scale;

      this.displayObject.addChild(this.canContainer);

      this.can_open.alpha = 0;

      this.model.set('trashCanPositionX', this.can.x);
      this.model.set('trashCanPositionY', this.can.y);
      this.model.set('trashCanWidth', this.can.width);
      this.model.set('trashCanHeight', this.can.height);
    },

    openCloseTrashCan: function() {
      if (this.model.get('deleteVector')) {
        this.can_open.alpha = 1;
        this.can.alpha = 0;
      }
      else {
        this.can_open.alpha = 0;
        this.can.alpha = 1;
      }
    }

  });

  return TrashCanView;
});
