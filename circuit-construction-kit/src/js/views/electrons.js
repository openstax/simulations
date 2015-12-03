define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');
    var COLOR = Colors.parseHex(Constants.ElectronsView.COLOR);

    /**
     * A view that represents a circuit
     */
    var ElectronsView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new ElectronsView.
         */
        initialize: function(options) {
            this.electronSet = options.electronSet;

            this.updateMVT(options.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        draw: function() {
            var graphics = this.displayObject;
            graphics.clear();
            graphics.beginFill(COLOR, 1);

            var mvt = this.mvt;
            var radius = mvt.modelToViewDeltaX(ElectronsView.RADIUS);

            var electrons = this.electronSet.particles.models;
            for (var i = 0; i < electrons.length; i++) {
                var pos = electrons[i].get('position');
                var x = mvt.modelToViewX(pos.x);
                var y = mvt.modelToViewY(pos.y);
                graphics.drawCircle(x, y, radius);
            }

            graphics.endFill();
        }

    }, Constants.ElectronsView);

    return ElectronsView;
});