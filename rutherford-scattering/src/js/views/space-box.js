define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    require('common/v3/pixi/dash-to');
    
    var Assets = require('assets');
    var Constants = require('constants');
    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * A view that represents an electron
     */
    var SpaceBox = PixiView.extend({

        /**
         * Initializes the new SpaceBox.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.spaceBoxSize = options.spaceBoxSize;
            this.scale = options.scale;
            this.alphaParticles = options.alphaParticles;

            this.initGraphics();

            this.listenTo(this.alphaParticles, 'add', this.addAlphaParticle);
            this.listenTo(this.alphaParticles, 'remove', this.removeAlphaParticle);
            this.listenTo(this.alphaParticles, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.box = new PIXI.Graphics();
            this.drawBox();

            this.displayObject.addChild(this.box);
            this.sprites = {};

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            var center = SpaceBox.center;
            this.mvt = mvt;

            // var scale = this.spaceBoxSize/150;
            // this.displayObject.scale.x = scale;
            // this.displayObject.scale.y = scale;


            // this.displayObject.x = Math.floor(this.mvt.modelToViewX(center.x));
            // this.displayObject.y = Math.floor(this.mvt.modelToViewY(center.y));

            this.update();
        },

        drawBox: function() {
            var boxWidth = this.spaceBoxSize/this.scale;
            var boxCorner = this.mvt.modelToView({
                x: - boxWidth/2,
                y: - boxWidth/2
            });

            this.box.lineStyle(1, 0xFFFFFF, 1);
            this.box.drawRect(boxCorner.x, boxCorner.y, boxWidth * this.scale, boxWidth * this.scale);
        },

        updatePosition: function(particle, position){
            if(this.sprites[particle.cid]){
                this.sprites[particle.cid].x = this.mvt.modelToViewX(position.x);
                this.sprites[particle.cid].y = this.mvt.modelToViewY(position.y);
            }
        },

        addAlphaParticle: function(particle){
            var alphaParticle = ParticleGraphicsGenerator.generateAlphaParticle(this.mvt);
            alphaParticle.x = particle.get('position').x;
            alphaParticle.y = particle.get('position').y;
            this.sprites[particle.cid] = alphaParticle;

            this.displayObject.addChild(alphaParticle);
        },

        removeAlphaParticle: function(particle){
            var alphaParticle = this.sprites[particle.cid];

            this.displayObject.removeChild(alphaParticle);
            delete this.sprites[particle.cid];
        }

    }, {center: {x: 0, y: 0}});


    return SpaceBox;
});