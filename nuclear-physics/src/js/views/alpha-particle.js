define(function(require) {

    'use strict';

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SubatomicParticleView     = require('views/subatomic-particle');

    /**
     * 
     */
    var AlphaParticleView = SubatomicParticleView.extend({

        createSprite: function() {
            return ParticleGraphicsGenerator.generateAlphaParticle(this.mvt);
        }

    });


    return AlphaParticleView;
});