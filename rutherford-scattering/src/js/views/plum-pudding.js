define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var insidePolygon = require('point-in-polygon');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');
    var Constants = require('constants');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var PUDDING_FOOTPRINT = [[-86.25, 78.75], [88.75, 78.75], [121.25, -6.875], [137.5, -92.5], [-137.5, -92.5], [-121.25, -6.875]];

    /**
     * A view that represents an electron
     */
    var PlumPudding = PixiView.extend({

        /**
         * Initializes the new PlumPudding.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.scale = options.scale;
            this.particleMVT = options.particleMVT;
            this.boundWidth = options.simulation.boundWidth;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.pudding = Assets.createSprite(Assets.Images.PLUM_PUDDING);
            this.pudding.anchor.x = 0.5;
            this.pudding.anchor.y = 0.5;

            this.electrons = new PIXI.Graphics();
            this.drawElectrons();

            this.displayObject.addChild(this.pudding);
            this.displayObject.addChild(this.electrons);

            this.updateMVT(this.mvt);
        },

        drawElectrons: function() {
            while(this.electrons.children.length < PlumPudding.ELECTRON_COUNT){
                this.drawElectron();
            }
        },

        drawElectron: function(){
            var randomPt = this.makeRandomPointInBounds(PUDDING_FOOTPRINT);

            if(insidePolygon([randomPt.x, randomPt.y], PUDDING_FOOTPRINT)){
                var electron = ParticleGraphicsGenerator.generateElectron(this.particleMVT);
                electron.x = this.mvt.modelToViewX(randomPt.x);
                electron.y = this.mvt.modelToViewY(randomPt.y);

                this.electrons.addChild(electron);
            }
        },

        makeRandomPointInBounds: function(bounds){
            var xValues = _.pluck(bounds, '0');
            var yValues = _.pluck(bounds, '1');

            var x = _.random(_.min(xValues), _.max(xValues));
            var y = _.random(_.min(yValues), _.max(yValues));

            return {x: x, y: y};
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(this.boundWidth));
            var scale = targetWidth / this.pudding.texture.width;

            this.pudding.scale.x = scale;
            this.pudding.scale.y = scale;
            this.pudding.x = this.mvt.modelToViewX(PlumPudding.center.x);
            this.pudding.y = this.mvt.modelToViewY(PlumPudding.center.y);

        }

    }, _.extend({center: {x: 0, y: 0}}, Constants.PuddingView));


    return PlumPudding;
});