define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
                   require('common/pixi/draw-arrow');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    var ExternalFieldView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.arrowColor = Colors.parseHex(ExternalFieldView.ARROW_COLOR);
            this.arrowAlpha = ExternalFieldView.ARROW_ALPHA;
            this.minComponentSize = 4;

            this.updateMVT(this.mvt);

            this.listenTo(this.simulation, 'change:fieldLatticeWidth', this.draw);
        },

        draw: function() {
            var x = Math.round(this.mvt.modelToViewX(this.simulation.minX));
            var y = Math.round(this.mvt.modelToViewY(this.simulation.minY));
            var w = Math.round(this.mvt.modelToViewDeltaX(this.simulation.width));
            var h = Math.round(this.mvt.modelToViewDeltaY(this.simulation.height));
            
            var tailWidth  = Math.round(this.mvt.modelToViewDeltaX(ExternalFieldView.ARROW_TAIL_WIDTH));
            var headWidth  = Math.round(this.mvt.modelToViewDeltaX(ExternalFieldView.ARROW_HEAD_WIDTH));
            var headLength = Math.round(this.mvt.modelToViewDeltaX(ExternalFieldView.ARROW_HEAD_LENGTH));

            var n = this.simulation.get('fieldLatticeWidth');
            var xStep = w / n;
            var yStep = h / n;
            var ox = x + xStep / 2; // Origin x
            var oy = y + yStep / 2; // Origin y
            var tx; // Target x
            var ty; // Target y
            var minSize = this.minComponentSize;

            var graphics = this.displayObject;
            graphics.clear();
            graphics.beginFill(this.arrowColor, this.arrowAlpha);

            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    var field = this.simulation.getFieldAt(this.mvt.viewToModelX(ox), this.mvt.viewToModelY(oy));
                    tx = this.mvt.modelToViewDeltaX(field.x);
                    ty = this.mvt.modelToViewDeltaY(field.y);

                    if (tx < minSize && ty < minSize) {
                        graphics.drawCircle(Math.floor(ox), Math.floor(oy), minSize / 2);
                    }
                    else {
                        graphics.drawArrow(
                            Math.floor(ox), Math.floor(oy),
                            Math.floor(tx), Math.floor(ty),
                            tailWidth, headWidth, headLength
                        );
                    }
                    
                    oy += yStep;
                }

                ox += xStep;
                oy = y + yStep / 2;
            }

            graphics.endFill();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        },

        update: function(time, deltaTime) {
            this.draw();
        }

    }, Constants.ExternalFieldView);

    return ExternalFieldView;
});