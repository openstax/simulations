define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var IsotopeSymbolGenerator    = require('views/isotope-symbol-generator');

    /**
     * 
     */
    var NucleusView = PixiView.extend({

        /**
         * Initializes the new NucleusView.
         */
        initialize: function(options) {
            options = _.extend({
                showSymbol: true,
                symbolSize: null
            }, options);

            this.mvt = options.mvt;
            this.showSymbol = options.showSymbol;
            this.symbolSize = options.symbolSize;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            if (this.nucleusSprite)
                this.displayObject.removeChild(this.nucleusSprite);

            this.nucleusSprite = ParticleGraphicsGenerator.generateNucleus(this.model, this.mvt);
            this.displayObject.addChild(this.nucleusSprite);

            if (this.showSymbol) {
                if (this.symbol)
                    this.displayObject.removeChild(this.symbol);

                var smallerDimension = (this.nucleusSprite.height > this.nucleusSprite.width) ? this.nucleusSprite.width : this.nucleusSprite.height;
                var fontSize = this.symbolSize ? this.symbolSize : Math.floor(smallerDimension * 0.75);
                this.symbol = IsotopeSymbolGenerator.generate(this.model, fontSize, 0.35);
                this.displayObject.addChild(this.symbol);
            }

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        }

    });


    return NucleusView;
});