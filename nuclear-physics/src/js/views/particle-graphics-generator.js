define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors      = require('common/colors/colors');
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Vector2     = require('common/math/vector2');

    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');

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
     * A utility class for generating nucleus and subatomic-particle graphics
     */
    var ParticleGraphicsGenerator = {

        _vec2: new Vector2(),

        // TODO: It might be good at some point in the future when there are a lot of nuclei being
        //   rendered on the screen to check memory usage.  If memory usage keeps climbing, I would
        //   think that all the nucleus graphics with cacheAsBitmap=true are not clearing their
        //   textures when garbage collected.  If that's the case, maybe try explicitly setting
        //   cacheAsBitmap to null when we're done with them.
        _nucleusCache: {},
        _labeledNucleusCache: {},
        minCachedTextureCount: 5,

        getCachedNucleusTextures: function(cache, numProtons, numNeutrons, mvt) {
            var scale = mvt.getXScale();

            if (cache[scale] && 
                cache[scale][numProtons] && 
                cache[scale][numProtons][numNeutrons]
            ) {
                return cache[scale][numProtons][numNeutrons];
            }
                
            return null;
        },

        addCachedNucleusTexture: function(cache, numProtons, numNeutrons, mvt, texture) {
            var scale = mvt.getXScale();

            if (!cache[scale])
                cache[scale] = [];

            if (!cache[scale][numProtons])
                cache[scale][numProtons] = [];

            if (!cache[scale][numProtons][numNeutrons])
                cache[scale][numProtons][numNeutrons] = [];

            cache[scale][numProtons][numNeutrons].push(texture);
        },

        generateLabeledNucleus: function(nucleus, mvt, hideNucleons) {
            var sprite;
            var noCachingAsBitmap = false;
            
            // Create a graphical image that will represent this nucleus in the view.
            if (hideNucleons) {
                // Show as a single sphere
                var sprite = this.createSphereSprite(nucleus.get('diameter'), mvt);
                sprite.tint = this.getColorForElement(nucleus);
            }
            else {
                noCachingAsBitmap = true;

                var numProtons = nucleus.get('numProtons');
                var numNeutrons = nucleus.get('numNeutrons');

                var texture;

                // Either create a new texture or get a cached one
                var cachedTextures = this.getCachedNucleusTextures(this._labeledNucleusCache, numProtons, numNeutrons, mvt);
                if (cachedTextures === null || cachedTextures.length < this.minCachedTextureCount) {
                    // Create a nucleus sprite
                    var nucleusSprite = this.createNucleusSprite(numProtons, numNeutrons, mvt);
                    // Create its isotope symbol
                    var fontSize = mvt.modelToViewDeltaX(nucleus.get('diameter')) * 0.8;
                    var isotopeSymbol = IsotopeSymbolGenerator.generate(nucleus, fontSize, 1);
                    isotopeSymbol.x = isotopeSymbol.width / 2;
                    // Add them to a container
                    var container = new PIXI.Container();
                    container.addChild(nucleusSprite);
                    container.addChild(isotopeSymbol);
                    // Render the texture
                    texture = this.createTexture(container);
                    // Save the texture
                    this.addCachedNucleusTexture(this._labeledNucleusCache, numProtons, numNeutrons, mvt, texture);
                }
                else {
                    // Get a random texture from the cache
                    texture = _.sample(cachedTextures);
                }

                // Create a sprite with the texture
                sprite = new PIXI.Sprite(texture);
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
            }

            return this.wrapSprite(sprite, noCachingAsBitmap);
        },

        /**
         * Create the image that will be used to visually represent this nucleus.
         */
        generateNucleus: function(nucleus, mvt, hideNucleons) {
            // var sprite;
            // var noCachingAsBitmap = false;
            
            // // Create a graphical image that will represent this nucleus in the view.
            // if (hideNucleons) {
            //     // Show as a single sphere
            //     var sprite = this.createSphereSprite(nucleus.get('diameter'), mvt);
            //     sprite.tint = this.getColorForElement(nucleus);
            // }
            // else {
            //     noCachingAsBitmap = true;

            //     var numProtons = nucleus.get('numProtons');
            //     var numNeutrons = nucleus.get('numNeutrons');

            //     var texture;

            //     var cachedTextures = this.getCachedNucleusTextures(this._nucleusCache, numProtons, numNeutrons, mvt);
            //     if (cachedTextures === null || cachedTextures.length < this.minCachedTextureCount) {
            //         texture = this.createTexture(this.createNucleusSprite(numProtons, numNeutrons, mvt));
            //         this.addCachedNucleusTexture(this._nucleusCache, numProtons, numNeutrons, mvt, texture);
            //     }
            //     else {
            //         texture = _.sample(cachedTextures);
            //     }

            //     sprite = new PIXI.Sprite(texture);
            //     sprite.anchor.x = 0.5;
            //     sprite.anchor.y = 0.5;
            // }

            // return this.wrapSprite(sprite, noCachingAsBitmap);
            var sprite;
                        
            // Create a graphical image that will represent this nucleus in the view.
            if (hideNucleons) {
                // Show as a single sphere
                var sprite = this.createSphereSprite(nucleus.get('diameter'), mvt);
                sprite.tint = this.getColorForElement(nucleus);
            }
            else {
                sprite = this.createNucleusSprite(nucleus.get('numProtons'), nucleus.get('numNeutrons'), mvt);
            }

            return this.wrapSprite(sprite);
        },

        createNormalizedNucleusSprite: function(numProtons, numNeutrons, mvt) {
            var container = new PIXI.Container();

            // Determine the size of the nucleus in femtometers.
            var nucleusRadius = this.getDiameterFromAtomicWeight(numProtons + numNeutrons) / 2;
            var viewNucleusRadius = mvt.modelToViewDeltaX(nucleusRadius);

            // Populate an array with all the nucleon sprites
            var nucleons = [];
            var i;
            for (i = 0; i < numProtons; i++)
                nucleons.push(this.createProtonSprite(mvt));
            for (i = 0; i < numNeutrons; i++)
                nucleons.push(this.createNeutronSprite(mvt));

            // Shuffle it
            nucleons = _.shuffle(nucleons);

            // Now arrange them randomly so they all fit within the nucleus radius
            var rotationStep = (Math.PI * 2) / nucleons.length;
            var vec = this._vec2;
            for (i = 0; i < nucleons.length; i++) {
                vec.set(Math.random() * (viewNucleusRadius - nucleons[i].width / 2), 0);
                vec.rotate(i * rotationStep);
                nucleons[i].x = vec.x;
                nucleons[i].y = vec.y;
                container.addChild(nucleons[i]);
            }

            return container;
        },

        createNucleusSprite: function(numProtons, numNeutrons, mvt) {
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
            return this.wrapSprite(this.createAlphaParticleSprite(mvt));
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

        generateProton: function(mvt) {
            return this.wrapSprite(this.createProtonSprite(mvt));
        },

        createProtonSprite: function(mvt) {
            var sprite = this.createSphereSprite(Constants.NUCLEON_DIAMETER, mvt);
            sprite.tint = PROTON_COLOR;
            return sprite;
        },

        generateNeutron: function(mvt) {
            return this.wrapSprite(this.createNeutronSprite(mvt));
        },

        createNeutronSprite: function(mvt) {
            var sprite = this.createSphereSprite(Constants.NUCLEON_DIAMETER, mvt);
            sprite.tint = NEUTRON_COLOR;
            return sprite;
        },

        generateElectron: function(mvt) {
            return this.wrapSprite(this.createElectron(mvt));
        },

        createElectron: function(mvt) {
            var sprite = this.createSphereSprite(Constants.ELECTRON_DIAMETER, mvt);
            sprite.tint = ELECTRON_COLOR;
            return sprite;
        },

        generateAntineutrino: function(mvt) {
            return this.wrapSprite(this.createAntineutrino(mvt));
        },

        createAntineutrino: function(mvt) {
            var sprite = this.createSphereSprite(Constants.ANTINEUTRINO_DIAMETER, mvt);
            sprite.tint = ANTINEUTRINO_COLOR;
            return sprite;
        },

        createSphereSprite: function(modelDiameter, mvt) {
            var sprite = new PIXI.Sprite(this.getSphereTexture());
            sprite.scale.x = sprite.scale.y = this.getSphereScale(modelDiameter, mvt);
            sprite.anchor.x = sprite.anchor.y = 0.5;

            return sprite;
        },

        wrapSprite: function(sprite, noCachingAsBitmap) {
            var scaleUpWrapper   = new PIXI.Container();
            var scaleDownWrapper = new PIXI.Container();
            
            scaleUpWrapper.addChild(sprite);
            if (!noCachingAsBitmap)
                scaleUpWrapper.scale.x = scaleUpWrapper.scale.y = 2;

            scaleDownWrapper.addChild(scaleUpWrapper);
            if (!noCachingAsBitmap)
                scaleDownWrapper.cacheAsBitmap = true;
            scaleDownWrapper.scale.x = scaleDownWrapper.scale.y = 0.5;

            return scaleDownWrapper;
        },

        createTexture: function(sprite) {
            var scaleUpWrapper   = new PIXI.Container();
            
            scaleUpWrapper.addChild(sprite);
            scaleUpWrapper.scale.x = scaleUpWrapper.scale.y = 2;

            var texture = PixiToImage.displayObjectToTexture(scaleUpWrapper, 2);

            return texture;
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

    return ParticleGraphicsGenerator;
});