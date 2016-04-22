define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AnimatedDatableItem = require('radioactive-dating-game/models/datable-item/animated');

    var Constants = require('constants');

    /**
     * This class implements the behavior of a model element that represents a
     *   tree that can be dated by radiometric means, and that grows, dies, and
     *   falls over as time goes by.
     */
    var AgingTree = AnimatedDatableItem.extend({

        defaults: _.extend({}, AnimatedDatableItem.prototype.defaults, {
            isOrganic: true,
            dead: 0, // How dead it is from 0 to 1
            decomposed: 0 // How decomposed does it look
        }),

        initialize: function(attributes, options) {
            AnimatedDatableItem.prototype.initialize.apply(this, [attributes, options]);

            // Set animation parameters
            this.initAnimationParameters();
        },

        initAnimationParameters: function() {
            this._closurePossibleSent = false;
            this._dyingCounter = AgingTree.DEATH_COUNT;
            this._swayCounter = AgingTree.SWAY_COUNT;
            this._fallCounter = AgingTree.FALL_COUNT;
            this._bounceCounter = AgingTree.BOUNCE_COUNT;
            this._decomposeCounter = AgingTree.DECOMPOSE_COUNT;
            this._previousAngle = undefined;
        },

        animate: function(age, deltaTime) {
            if (!this._closurePossibleSent) {
                // At the moment of birth for the tree, closure is possible. 
                //   If we haven't set the state to indicate this, do it now.
                this.set('closureState', AgingTree.CLOSURE_POSSIBLE);
                this._closurePossibleSent = true;
            }
            
            // Handle growth.
            if (this.get('height') < AgingTree.FULL_GROWN_TREE_HEIGHT && this.get('closureState') !== AgingTree.CLOSED) {
                // Grow a little bit.
                this.set('width',  this.get('width') * AgingTree.GROWTH_RATE);
                
                // Shift up a bit so that it looks like the tree is growing up out of the ground.
                var center = this.getPosition();
                this.setPosition(center.x, center.y + this.get('height') * 0.012);
            }
            
            // Handle death by natural causes.
            if (this.get('closureState') !== AgingTree.CLOSED && age > AgingTree.AGE_OF_NATURAL_DEATH && this._dyingCounter > 0) {
                var fadeAmount = 1 / AgingTree.DEATH_COUNT;
                this.set('dead', Math.min(this.get('dead') + fadeAmount, 1));

                this._dyingCounter--;
                
                // Time to die, a.k.a. to radiometrically "close".
                if (this._dyingCounter === 0)
                    this.set('closureState', AgingTree.CLOSED);
            }

            // Handle the post-closure animation.
            if (this.get('closureState') === AgingTree.CLOSED) {
                // Make sure it's fully dead, not just mostly dead.
                this.set('dead', 1);
                
                if (this._swayCounter > 0) {
                    // Set the angle for the sway.
                    var swayPercent = -((this._swayCounter - AgingTree.SWAY_COUNT) / AgingTree.SWAY_COUNT);
                    var swayDeflection = Math.cos(-swayPercent * Math.PI * 2);
                    swayDeflection *= AgingTree.MAX_SWAY_DEFLECTION;
                    
                    this.rotateAboutBottomCenter(swayDeflection);
                    
                    // Move to the next step in the cycle.
                    this._swayCounter--;
                }
                else if (this._fallCounter > 0) {
                    this.rotateAboutBottomCenter(AgingTree.FALL_ANGLE_SCALE_FACTOR * (AgingTree.FALL_COUNT - this._fallCounter));
                    
                    // Move to the next step in the cycle.
                    this._fallCounter--;
                }
                else if (this._bounceCounter > 0) {
                    var bouncePercent = -((this._bounceCounter - AgingTree.BOUNCE_COUNT) / AgingTree.BOUNCE_COUNT);
                    var yTranslation = -Math.sin(-bouncePercent * Math.PI * 2);
                    yTranslation *= (AgingTree.BOUNCE_PROPORTION * this.get('width'));
                    this.translate(0, yTranslation);
                    
                    // Give it a little random rotation to make it look a bit
                    //   more like a real bounce.
                    if ((AgingTree.BOUNCE_COUNT - this._bounceCounter) % 4 === 0) {
                        this._previousAngle = this.get('rotation');
                        this.rotate(Math.random() * Math.PI / 24);
                    }
                    else if ((AgingTree.BOUNCE_COUNT - this._bounceCounter) % 2 === 0) {
                        this.set('rotation', this._previousAngle);
                    }
                    this._bounceCounter--;
                }

                if (this._bounceCounter === 0 && this._decomposeCounter > 0) {
                    var decomposeAmount = 1 / AgingTree.DECOMPOSE_COUNT;
                    this.set('decomposed', Math.min(this.get('decomposed') + decomposeAmount, 1));

                    this._decomposeCounter--;
                    
                    if (this._decomposeCounter === 0) {
                        this.set('decomposed', 1);
                        this.set('width', this.get('width') * (100 / 580), { silent: true });
                    }
                }
            }
        },

        rotateAboutBottomCenter: function(deltaTheta) {
            var totalTranslation = this.get('height') * 0.9 * Math.sin(deltaTheta / 2);
            var centerAngle = this.get('rotation') + (deltaTheta / 2);
            var xTranslation = totalTranslation * Math.cos(centerAngle);
            var yTranslation = -totalTranslation * Math.sin(centerAngle);
            this.rotate(deltaTheta);
            this.translate(xTranslation, yTranslation);
        }

    }, Constants.AgingTree);

    return AgingTree;
});
