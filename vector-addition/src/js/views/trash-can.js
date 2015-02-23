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
      this.listenTo(this.model, 'change:deleteVector', this.openTrashCan);
      this.listenTo(this.model, 'change:deleteVector', this.closeTrashCan);
    },

    initGraphics: function() {
      this.trashCan();
    },

    trashCan: function() {
      this.canContainer = new PIXI.DisplayObjectContainer();
      var can = Assets.createSprite(Assets.Images.Trash_Can),
       can_open = Assets.createSprite(Assets.Images.Trash_Can_Open),
       canvas = $('.scene-view');

      this.canContainer.buttonMode = true;
      this.canContainer.addChild(can);
      this.can = can;

      this.can.position.x = 0.88 * canvas.width();
      this.can.position.y = 0.70 * canvas.height();

      this.canContainer.addChild(can_open);
      this.can_open = can_open;
      this.can_open.position.x = 0.88 * canvas.width();
      this.can_open.position.y = 0.70 * canvas.height();

      this.displayObject.addChild(this.canContainer);

      this.can_open.alpha = 0;

      this.model.set('trashCanPositionX', this.can.position.x);
      this.model.set('trashCanPositionY', this.can.position.y);
      this.model.set('trashCanWidth', this.can.width);
      this.model.set('trashCanHeight', this.can.height);
    },

    openTrashCan: function() {
      if (this.model.get('deleteVector')) {
        this.can_open.alpha = 1;
        this.can.alpha = 0;
      }
    },

    closeTrashCan: function() {
      var self = this;
      if (this.model.get('deleteVector') == false) {
        setTimeout(function() {
          self.can_open.alpha = 0;
          self.can.alpha = 1;
        }, 1000)
      }
    }

  });

  return TrashCanView;
});
