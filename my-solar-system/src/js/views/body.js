define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    //var Vector2  = require('common/math/vector2');
    

    var BodyView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                color: '#ddd'
            }, options);

            this.color = Colors.parseHex(options.color);
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:x', this.updateX);
            this.listenTo(this.model, 'change:y', this.updateY);
            this.listenTo(this.model, 'change:vx', this.drawVelocity);
            this.listenTo(this.model, 'change:vy', this.drawVelocity);
            this.listenTo(this.model, 'change:mass', this.drawBody);

            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();

            this.drawBody();
            this.drawVelocity();

            this.displayObject.addChild(this.graphics);
        },

        drawBody: function() {
            var diameter = 2.5 * Math.pow(this.model.get('mass'), 1/3) + 6;
            var radius = diameter / 2;

            this.graphics.clear();
            this.graphics.beginFill(this.color, 1);
            this.graphics.drawCircle(0, 0, radius);
            this.graphics.endFill();
        },

        drawVelocity: function() {

        },

        updateX: function(model, x) {
            this.displayObject.x = this.mvt.modelToViewX(x);
        },

        updateY: function(model, y) {
            this.displayObject.y = this.mvt.modelToViewY(y);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawBody();
            this.updateX(this.model, this.model.get('x'));
            this.updateY(this.model, this.model.get('y'));
        }

    });

    return BodyView;
});