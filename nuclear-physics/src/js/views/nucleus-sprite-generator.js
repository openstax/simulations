define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    var PROTON_COLOR       = Colors.parseHex(Constants.PROTON_COLOR);
    var NEUTRON_COLOR      = Colors.parseHex(Constants.NEUTRON_COLOR);
    var ELECTRON_COLOR     = Colors.parseHex(Constants.ELECTRON_COLOR);
    var ANTINEUTRINO_COLOR = Colors.parseHex(Constants.ANTINEUTRINO_COLOR);
    
    var CARBON_COLOR   = Colors.parseHex(Constants.CARBON_COLOR);
    var NITROGEN_COLOR = Colors.parseHex(Constants.NITROGEN_COLOR);
    var URANIUM_COLOR  = Colors.parseHex(Constants.URANIUM_COLOR);
    var LEAD_COLOR     = Colors.parseHex(Constants.LEAD_COLOR);

    var CUSTOM_NUCLEUS_PRE_DECAY_COLOR  = Colors.parseHex(Constants.CUSTOM_NUCLEUS_PRE_DECAY_COLOR);
    var CUSTOM_NUCLEUS_POST_DECAY_COLOR = Colors.parseHex(Constants.CUSTOM_NUCLEUS_POST_DECAY_COLOR);

    var Assets = require('assets');

    /**
     * A view that represents a circuit
     */
    var NucleusSpriteGenerator = {

        /**
         * Create the image that will be used to visually represent this nucleus.
         */
        generate: function(nucleus, mvt, hideNucleons) {
            var container;
            
            // Create a graphical image that will represent this nucleus in the view.
            if (hideNucleons) {
                // Show as a single sphere
                var sprite = this.createSphereSprite(nucleus.get('diameter'), mvt);
                sprite.tint = this.getColorForElement(nucleus);
                container = new PIXI.Container();
                container.addChild(sprite);
            }
            else {
                container = this._generateWithNucleons(nucleus.get('numProtons'), nucleus.get('numNeutrons'), mvt);

                // Scale the image to the appropriate size.  Note that this is tweaked
                // a little bit in order to make it look better.
                // newImage.scale( (nucleus.getDiameter()/1.2)/((newImage.getWidth() + newImage.getHeight()) / 2));
            }

            // Because this seems to snap it at a lower resolution (lower than the native density),
            //   maybe I should scale up the contents of these and then snap it and scale down afterward
            container.scale.x = container.scale.y = 2;
            var wrapper = new PIXI.Container();
            wrapper.addChild(container);
            wrapper.cacheAsBitmap = true;
            wrapper.scale.x = wrapper.scale.y = 0.5;
            
            return wrapper;
        },

        _generateWithNucleons: function(numProtons, numNeutrons, mvt) {
            var container = new PIXI.Container();

            // Determine the size of the nucleus in femtometers.
            var nucleusRadius = this.getDiameterFromAtomicWeight(numProtons + numNeutrons) / 2;
            var viewNucleusRadius = mvt.modelToViewDeltaX(nucleusRadius);
                    
            // Add sprites of individual nucleons together in order to create the
            //   overall image of the nucleus.
                    
            if (numProtons + numNeutrons === 3) {
                // This special case was added to handle H3 and He3.  It places
                //   the nucleons such that there is no overlap between them. 
                //   It may also be possible to generalize it somewhat to handle
                //   small numbers of nuclei.
                
                var protonsToAdd = numProtons;
                var neutronsToAdd = numNeutrons;
                var rotationOffset = Math.PI;  // In radians, arbitrary and just for looks.
                var distanceFromCenter = mvt.modelToViewDeltaX(Constants.NUCLEON_DIAMETER / 2 / Math.cos(Math.PI / 6));
                for (var i = 0; i < 3; i++) {
                    var nucleonSprite;
                    if (neutronsToAdd > 0) {
                        nucleonSprite = this.createNeutronSprite(mvt);
                        neutronsToAdd--;
                    }
                    else {
                        nucleonSprite = this.createProtonSprite(mvt);
                        protonsToAdd--;
                    }

                    var angle = (Math.PI * 2 / 3) * i + rotationOffset;
                    var xPos = Math.sin(angle) * distanceFromCenter;
                    var yPos = Math.cos(angle) * distanceFromCenter;
                    nucleonSprite.x = xPos;
                    nucleonSprite.y = yPos;

                    container.addChild(nucleonSprite);
                }
            }
            else { 
                // Decide on the proportion of free protons and neutrons versus those
                //   tied up in alpha particles.
                var numAlphas = ((numProtons + numNeutrons) / 2) / 4; // Assume half of all particles are tied up in alphas.
                var numFreeProtons = numProtons - (numAlphas * 2);
                var numFreeNeutrons = numNeutrons - (numAlphas * 2);
        
                // For the following loop to work, it is assumed that the number of
                //   neutrons equals or exceeds the number of protons, which is always
                //   true (I think) in the real world.  However, just in case the caller
                //   has not done this, we adjust the values here if necessary.
                if (numFreeProtons > numFreeNeutrons)
                    numFreeNeutrons = numFreeProtons;
        
                // Add the individual images.  We add the most abundant images (usually
                //   neutrons) first, since otherwise they end up dominating the image.
                var maxParticleType = Math.max(numAlphas, numFreeProtons);
                maxParticleType = Math.max(numFreeNeutrons, maxParticleType);
        
                var sprite;
                for (var i = 0; i < maxParticleType; i++) {
                    if (numAlphas === numFreeNeutrons) {
                        // Add an alpha particle.
                        sprite = this.createAlphaParticleSprite(mvt);
                        this.setParticlePosition(sprite, viewNucleusRadius);
                        numAlphas--;
                        container.addChild(sprite);
                    }

                    if (numFreeProtons === numFreeNeutrons) {
                        // Add a proton
                        sprite = this.createProtonSprite(mvt);
                        this.setParticlePosition(sprite, viewNucleusRadius);
                        numFreeProtons--;
                        container.addChild(sprite);
                    }
        
                    // Add a neutron
                    sprite = this.createNeutronSprite(mvt);
                    this.setParticlePosition(sprite, viewNucleusRadius);
                    numFreeNeutrons--;
                    container.addChild(sprite);
                }
            }

            return container;
        },

        generateAlphaParticle: function(mvt) {
            var container = this.createAlphaParticleSprite(mvt);
            container.cacheAsBitmap = true;
            return container;
        },

        createAlphaParticleSprite: function(mvt) {
            var proton1  = this.createProtonSprite(mvt);
            var proton2  = this.createProtonSprite(mvt);
            var neutron1 = this.createNeutronSprite(mvt);
            var neutron2 = this.createNeutronSprite(mvt);

            var diameter = mvt.modelToViewDeltaX(Constants.NUCLEON_DIAMETER);

            if (Math.random() < 0.5) {
                proton1.x  =  diameter / 4; proton1.y  = -diameter / 4;
                neutron1.x = -diameter / 3; neutron1.y = -diameter / 3;
                neutron2.x =  diameter / 3; neutron2.y =  diameter / 3;
                proton2.x  = -diameter / 4; proton2.y  =  diameter / 4;
                
            }
            else {
                proton1.x  = 0;             proton1.y = diameter / 3;
                neutron1.x = diameter / 2;  neutron1.y = 0;
                neutron2.x = -diameter / 2; neutron2.y = 0;
                proton2.x  = 0;             proton2.y = -diameter / 3;
            }

            var container = new PIXI.Container();
            container.addChild(proton1);
            container.addChild(neutron1);
            container.addChild(neutron2);
            container.addChild(proton2);

            return container;
        },

        createProtonSprite: function(mvt) {
            var sprite = this.createSphereSprite(Constants.NUCLEON_DIAMETER, mvt);
            sprite.tint = PROTON_COLOR;
            return sprite;
        },

        createNeutronSprite: function(mvt) {
            var sprite = this.createSphereSprite(Constants.NUCLEON_DIAMETER, mvt);
            sprite.tint = NEUTRON_COLOR;
            return sprite;
        },

        createSphereSprite: function(modelDiameter, mvt) {
            var sprite = new PIXI.Sprite(this.getSphereTexture());
            sprite.scale.x = sprite.scale.y = this.getSphereScale(modelDiameter, mvt);
            sprite.anchor.x = sprite.anchor.y = 0.5;

            return sprite;
        },

        getSphereTexture: function() {
            if (!this._sphereTexture)
                this._sphereTexture = Assets.Texture(Assets.Images.SPHERE);

            return this._sphereTexture;
        },

        getSphereScale: function(modelDiameter, mvt) {
            var targetWidth = mvt.modelToViewDeltaX(modelDiameter);
            return targetWidth / this.getSphereTexture().width;
        },

        /**
         * The elements that are represented as circles or spheres need to be some
         * color, and this function figures out what that color should be.
         * @param nucleus
         * @return
         */
        getColorForElement: function(nucleus) {
            switch (nucleus.get('numProtons')) {
                case 6:
                    // Carbon
                    return CARBON_COLOR;
                    
                case 7:
                    // Nitrogen
                    return NITROGEN_COLOR;
                    
                case 92:
                    // Uranium
                    return URANIUM_COLOR;
                    
                case 83:
                    // Bismuth, which by internal convention is the pre-decay custom nucleus.
                    return CUSTOM_NUCLEUS_PRE_DECAY_COLOR;
                    
                case 82:
                    // Lead
                    return LEAD_COLOR;
                    
                case 81:
                    // Thallium, which by internal convention is the post-decay custom nucleus.
                    return CUSTOM_NUCLEUS_POST_DECAY_COLOR;
                    
                default:
                    // Unknown
                    console.warn('Warning: Don\'t have a color assignment for this element.');
                    return 0x000000;
            }
        },

        getDiameterFromAtomicWeight: function(atomicWeight) {
            // This calculation is based on an empirically derived function that
            // seems to give pretty reasonable values.
            return (1.6 * Math.pow(atomicWeight, 0.362));
        },

        setParticlePosition: function(particleSprite, viewRadius) {
            var angle = Math.random() * Math.PI * 2;
            var multiplier = Math.random();
            if (multiplier > 0.8) {
                // Cause the distribution to tail off in the outer regions
                //   of the nucleus.  This makes the center of the nucleus
                //   look more concentrated, which is what we want.
                multiplier = multiplier * Math.random() / 2;
            }
            var radius = viewRadius * multiplier;
            var xPos = Math.sin(angle) * radius;
            var yPos = Math.cos(angle) * radius;
            particleSprite.x = xPos;
            particleSprite.y = yPos;
        }

    };

    return NucleusSpriteGenerator;
});