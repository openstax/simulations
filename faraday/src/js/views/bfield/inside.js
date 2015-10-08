define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AbstractBFieldView = require('views/bfield');

    var Constants = require('constants');

    /**
     * 
     */
    var BFieldInsideView = AbstractBFieldView.extend({

        /**
         * Initializes the new AbstractBFieldView.
         */
        initialize: function(options) {
            options = _.extend({
                xSpacing: BFieldInsideView.X_SPACING,
                ySpacing: BFieldInsideView.Y_SPACING
            }, options);

            AbstractBFieldView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.magnetModel, 'change:position', this.update);
        },

        /**
         * There are 2 rows and COLUMNS columns of points, with one column centered.
         */
        createNeedleSprites: function() {
            var rows = 2;
            var cols = BFieldInsideView.COLUMNS;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c <= (cols / 2); c++) {
                    // One to the left...
                    this.createNeedleSpriteAt(0, 0);
                    // ...and one to the right
                    this.createNeedleSpriteAt(0, 0);
                }
            }
        },

        updatePositions: function() {
            var xSpacing = this.mvt.modelToViewDeltaX(this.xSpacing);
            var ySpacing = this.mvt.modelToViewDeltaY(this.ySpacing);
            var bx = this.mvt.modelToViewX(this.magnetModel.get('position').x);
            var by = this.mvt.modelToViewY(this.magnetModel.get('position').y);
            var x, y;
            var i = 0;
            var cols = BFieldInsideView.COLUMNS;
            var needles = this.needleSprites.children;

            // Create grid point for magnet with zero rotation.
            for (var c = 0; c <= (cols / 2); c++) {
                // Above center
                y = by - (ySpacing / 2);
                x = bx + (c * xSpacing);
                this.positionNeedle(needles[i++], x, y, bx, by);

                x = bx - (c * xSpacing);
                this.positionNeedle(needles[i++], x, y, bx, by);

                // Below center
                y = by + (ySpacing / 2);
                x = bx + (c * xSpacing);
                this.positionNeedle(needles[i++], x, y, bx, by);

                x = bx - (c * xSpacing);
                this.positionNeedle(needles[i++], x, y, bx, by);
            }
        },

        positionNeedle: function(needle, x, y, bx, by) {
            // Transform by the bar magnet's rotation
            var point = this._point
                .set(x, y)
                .add(bx, by)
                .rotate(this.magnetModel.get('direction'))
                .sub(bx, by);

            needle.x = point.x;
            needle.y = point.y;
            needle.modelX = this.mvt.viewToModelX(point.x);
            needle.modelY = this.mvt.viewToModelY(point.y);
        },

        update: function() {
            if (!this.hidden) {
                this.updatePositions();
            }

            AbstractBFieldView.prototype.update.apply(this, arguments);
        },

    }, Constants.BFieldInsideView);


    return BFieldInsideView;
});