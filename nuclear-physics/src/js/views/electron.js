define(function(require) {

    'use strict';

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SubatomicParticleView     = require('views/subatomic-particle');

    /**
     * 
     */
    var ElectronView = SubatomicParticleView.extend({

        createSprite: function() {
            return ParticleGraphicsGenerator.generateElectron(this.mvt);
        }

    });


    return ElectronView;
});