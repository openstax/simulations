define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that represents an atom
     */
    var AtomView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new AtomView.
         */
        initialize: function(options) {
            this.color = Colors.parseHex(this.model.get('color'));
            this.updateMVT(options.mvt);
        },

        /**
         * Draws the atom
         */
        drawAtom: function() {
            var graphics = this.displayObject;
            graphics.beginFill(this.color, 1);
            graphics.drawCircle(
                this.mvt.modelToViewX(this.model.get('position').x),
                this.mvt.modelToViewY(this.model.get('position').y),
                this.mvt.modelToViewDeltaX(this.model.get('radius'))
            );
            graphics.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawAtom();
        }

    });

    return AtomView;
});