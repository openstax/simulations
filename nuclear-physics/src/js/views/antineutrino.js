define(function(require) {

    'use strict';

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SubatomicParticleView     = require('views/subatomic-particle');

    /**
     * 
     */
    var AntineutrinoView = SubatomicParticleView.extend({

        createSprite: function() {
            return ParticleGraphicsGenerator.generateAntineutrino(this.mvt);
        }

    });


    return AntineutrinoView;
});