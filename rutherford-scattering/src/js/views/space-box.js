define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var _ = require('underscore');


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
            this.particleMVT = options.particleMVT;
            this.spaceBoxSize = options.spaceBoxSize;
            this.scale = options.scale;
            this.simulation = options.simulation
            this.alphaParticles = options.simulation.alphaParticles;

            this.initGraphics();

            this.listenTo(this.alphaParticles, 'reset', this.resetAlphaParticles);

            this.listenTo(this.simulation, 'change:trace', this.clearTraces);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.box = new PIXI.Graphics();
            this.box.lineStyle(1, 0xFFFFFF, 1);
            this.drawBox(this.box);

            this.maskBox = new PIXI.Graphics();
            this.maskBox.beginFill(0x000000, 1);
            this.drawBox(this.maskBox);
            this.maskBox.endFill();

            this.particlesLayer = new PIXI.Container();
            this.particlesLayer.mask = this.maskBox;

            this.displayObject.addChild(this.particlesLayer);
            this.displayObject.addChild(this.box);

            this.sprites = {};
            this.traces = {};

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            var center = SpaceBox.center;
            this.mvt = mvt;

            this.update();
        },

        drawBox: function(box) {
            var boxWidth = this.simulation.boundWidth;

            var boxCorner = this.mvt.modelToView({
                x: - boxWidth/2,
                y: boxWidth/2
            });

            box.drawRect(boxCorner.x, boxCorner.y, boxWidth * this.scale, boxWidth * this.scale);
        },

        updatePosition: function(particle){
            var previous;
            var position = particle.get('position');

            if(this.sprites[particle.cid]){
                this.sprites[particle.cid].x = this.mvt.modelToViewX(position.x);
                this.sprites[particle.cid].y = this.mvt.modelToViewY(position.y);
            }

            if(this.traces[particle.cid]){
                previous = this.getLastTracePoint(particle);

                this.traces[particle.cid].moveTo(previous.x, previous.y);
                this.traces[particle.cid].lineTo(this.sprites[particle.cid].x, this.sprites[particle.cid].y);
            }
        },

        addAlphaParticle: function(particle){
            var alphaParticle = ParticleGraphicsGenerator.generateAlphaParticle(this.particleMVT);
            alphaParticle.x = this.mvt.modelToViewX(particle.get('position').x);
            alphaParticle.y = this.mvt.modelToViewY(particle.get('position').y);
            this.sprites[particle.cid] = alphaParticle;

            if(this.simulation.get('trace')){
                this.traces[particle.cid] =  new PIXI.Graphics();
                this.traces[particle.cid].lineStyle(1, 0xFFFFFF, 0.5);
                this.traces[particle.cid].moveTo(alphaParticle.x, alphaParticle.y);
                this.particlesLayer.addChild(this.traces[particle.cid]);
            }

            this.particlesLayer.addChild(alphaParticle);
        },

        removeAlphaParticle: function(sprite, particleCId){
            this.particlesLayer.removeChild(this.sprites[particleCId]);
            delete this.sprites[particleCId];

            if(this.traces[particleCId]){
                this.particlesLayer.removeChild(this.traces[particleCId]);
                delete this.traces[particleCId];
            }
        },

        resetAlphaParticles: function(){
            this.traces = {};
            this.sprites = {};

            this.displayObject.removeChild(this.particlesLayer);
            this.particlesLayer.destroy();

            this.particlesLayer = new PIXI.Container();
            this.particlesLayer.mask = this.maskBox;

            this.displayObject.addChildAt(this.particlesLayer, 0);
        },

        getLastTracePoint: function(particle){
            var previous = _.last(this.traces[particle.cid].graphicsData).shape.points;

            var previousX = previous[2] || previous[0];
            var previousY = previous[3] || previous[1];

            return {x: previousX, y: previousY};
        },

        clearTraces: function(simulation, trace){
            if(!trace){
                _.each(this.traces, this.particlesLayer.removeChild, this.particlesLayer);
                this.traces = {};
            }
        },

        isDrawn: function(particle) {
            return !_.isUndefined(this.sprites[particle.cid]);
        },

        getOldAlphaParticles: function() {
            var oldSprites = _.pick(this.sprites, function(sprite, cid){
                var particle = this.alphaParticles.models.find(function(particle){
                    return particle.cid === cid;
                });
                return _.isUndefined(particle);
            }, this);

            return _.chain(oldSprites);
        },

        getNewAlphaParticles: function() {
            var newParticles = this.alphaParticles.models.reject(this.isDrawn, this);
            return _.chain(newParticles);
        },

        getAlphaParticles: function() {
            return this.alphaParticles.models;
        },

        _update: function(time, deltaTime, paused, timeScale) {

            // add new particles entering the scene
            this.getNewAlphaParticles().each(this.addAlphaParticle, this);

            // update particles in scene
            this.getAlphaParticles().each(this.updatePosition, this);

            // clear old particles in scene
            this.getOldAlphaParticles().each(this.removeAlphaParticle, this);
        }

    }, {center: {x: 0, y: 0}});


    return SpaceBox;
});