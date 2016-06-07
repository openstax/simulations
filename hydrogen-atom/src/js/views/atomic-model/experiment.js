define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AtomicModelView = require('hydrogen-atom/views/atomic-model');

    var Constants = require('constants');
    
    /**
     * Represents the scene for the ExperimentModel
     */
    var ExperimentModelView = AtomicModelView.extend({

        /**
         * Initializes the new ExperimentModelView.
         */
        initialize: function(options) {
            AtomicModelView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            AtomicModelView.prototype.initGraphics.apply(this, arguments);

            this.graphics = new PIXI.Graphics();

            this.questionMark = new PIXI.Text('?', {
                font: '90px Helvetica Neue',
                fill: '#fff'
            });
            this.questionMark.resolution = this.getResolution();
            this.questionMark.anchor.x = 0.5;
            this.questionMark.anchor.y = 0.5;

            this.displayObject.addChild(this.graphics);
            this.displayObject.addChild(this.questionMark);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            AtomicModelView.prototype.updateMVT.apply(this, arguments);

            var atomPosition = this.getViewPosition();
            this.graphics.x = atomPosition.x;
            this.graphics.y = atomPosition.y;
            this.questionMark.x = atomPosition.x;
            this.questionMark.y = atomPosition.y;

            var size = this.mvt.modelToViewDeltaX(130);
            this.graphics.clear();
            this.graphics.lineStyle(1, 0xFFFFFF, 1);
            this.graphics.beginFill(0x233C77, 1);
            this.graphics.drawRect(-size / 2, -size / 2, size, size);
            this.graphics.endFill();
        }

    });


    return ExperimentModelView;
});