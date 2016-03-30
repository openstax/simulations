define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var insidePolygon = require('point-in-polygon');

    var PixiView = require('common/v3/pixi/view');

    var Assets = require('assets');
    var Constants = require('constants');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

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
            var polygon = [[292, 136], [572, 136], [624, 273], [650, 410], [210, 410], [236, 273]];
            var randomPt = this.makeRandomPointInBounds();

            if(insidePolygon([randomPt.x, randomPt.y], polygon)){
                var electron = ParticleGraphicsGenerator.generateElectron(this.particleMVT);
                electron.x = randomPt.x;
                electron.y = randomPt.y;

                this.electrons.addChild(electron);
            }
        },

        makeRandomPointInBounds: function(){
            var randomY = [136, 410];
            var randomX = [210, 650];

            var x = _.random(randomX[0], randomX[1]);
            var y = _.random(randomY[0], randomY[1]);

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