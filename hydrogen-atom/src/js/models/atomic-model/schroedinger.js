define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2                       = require('common/math/vector2');
    var RandomUtils                   = require('common/math/random-utils');
    var ProbabilisticChooser          = require('common/math/probabilistic-chooser');
    var AssociatedLegendrePolynomials = require('common/math/associated-legendre-polynomials');

    var DeBroglieModel     = require('hydrogen-atom/models/atomic-model/debroglie');
    var DeBroglieViewModes = require('hydrogen-atom/models/debroglie-view-modes');
    var MetastableHandler  = require('hydrogen-atom/models/metastable-handler');
    
    var Constants = require('constants');

    /**
     * SchrodingerModel is the Schrodinger model of the hydrogen atom.
     * 
     * Physical representation:
     *   Electron is a probability density field.
     *   Proton is at the center, visible only when the probability density 
     *   field strength is below a threshold value.
     *   The atom's state has 3 components (n,l,m). See transition rules below.
     * 
     * Wavefunction:
     *   This implementation solves the 3D Schrodinger wavefunction,
     *   used to compute probability density values in 3D space.
     * 
     * Collision behavior:
     *   Identical to the "brightness" views of deBroglie, which is why this
     *   class is an extension of DeBroglieModel.
     * 
     * Absorption behavior:
     *   Identical to Borh and deBroglie.
     * 
     * Emission behavior:
     *   Both spontaneous and stimulated emission are similar to Bohr and 
     *   deBroglie, but the rules for transitions (see below) are more 
     *   complicated.
     * 
     * Transition rules:
     *   All of the following rules must be obeyed when choosing a transition.
     *     n = [1...6] as in Bohr and deBroglie
     *     l = [0...n-1]
     *     m = [-l...+l]
     *     abs(l-l') = 1
     *     abs(m-m') < 1
     *     n transitions have varying transition strengths
     *     valid l and m transitions have equal probability
     * 
     * Note that transitions from state nlm=(2,0,0) are a special case.
     * The lower state (1,0,0) is not possible since it violates the abs(l-l')=1 rule.
     * The only way to get out of this state (2,0,0) is by going to a higher state.
     */
    var SchroedingerModel = DeBroglieModel.extend({

        defaults: _.extend({}, DeBroglieModel.prototype.defaults, {
            viewMode: DeBroglieViewModes.BRIGHTNESS_MAGNITUDE
        }),

        initialize: function(attributes, options) {
            DeBroglieModel.prototype.initialize.apply(this, [attributes, options]);

            // Secondary state component, l = 0,...n-1 (n=electron state)
            this.l = 0;
            // Tertiary state component, m = -l,...+l
            this.m = 0;
            
            this.spontaneousEmissionPoint = new Vector2();
            this.metastableHandler = new MetastableHandler({
                gun: options.gun, 
                atom: this, 
                SchroedingerModel: SchroedingerModel
            });

            this.probabilisticChooser = new ProbabilisticChooser();
        },

        cleanup: function() {
            this.metastableHandler.cleanup();
        },

        update: function(time, deltaTime) {
            DeBroglieModel.prototype.update.apply(this, arguments);

            this.metastableHandler.update(time, deltaTime);
        },
        
        /**
         * Gets the electron's secondary state (l).
         * @return int
         */
        getSecondaryElectronState: function() {
            return this.l;
        },
        
        /**
         * Gets the electron's tertiary state (m).
         * @return int
         */
        getTertiaryElectronState: function() {
            return this.m;
        },

        /**
         * Does the atom's state match a specified state?
         */
        stateEquals: function(n, l, m) {
            return (this.getElectronState() === n) && (l == this.l) && (m == this.m);
        },

        /**
         * Probabilistically determines whether to absorb a photon.
         *   Typically we defer to the superclass implementation.
         *   But if we're in state (2,0,0), the probability is 100%. 
         *   This is not physically correct, but we want to make it easier
         *   to get out of state (2,0,0).
         */
        absorptionIsCertain: function() {
            if (this.getElectronState() === 2 && this.l === 0)
                return true;
            
            return DeBroglieModel.prototype.absorptionIsCertain.apply(this, arguments);
        },
        
        /**
         * Determines if a proposed state transition caused by stimulated emission is allowed.
         */
        stimulatedEmissionIsAllowed: function(nOld, nNew) {
            var legal = true;
            if (nNew === nOld) {
                legal = false;
            }
            else if (nNew === 1 && this.l === 0) {
                // transition from (n,0,0) to (1,?,?) cannot satisfy the abs(l-l')=1 rule
                legal = false;
            }
            else if (nNew === 1 && this.l !== 1) {
                // the only way to get to (1,0,0) is from (n,1,?)
                legal = false;
            }
            
            if (SchroedingerModel.DEBUG_REJECTED_TRANSITIONS && !legal)
                console.log('Schrodinger.stimulatedEmissionIsAllowed: rejecting ' + SchroedingerModel.stateToString(nOld, this.l, this.m) + ' -> (' + nNew + ',?,?)');
            
            return legal;
        },
        
        /**
         * Chooses a new primary state (n) for the electron.
         */
        chooseLowerElectronState: function() {
            var nOld = this.getElectronState();
            return this.getLowerPrimaryState(nOld);
        },
        
        /**
         * Sets the electron's primary state.
         * Randomly chooses the values for the secondary and tertiary states,
         * according to state transition rules.
         */
        setElectronState: function(nNew) {
            var lNew = this.getNewSecondaryState(nNew, this.l);
            var mNew = this.getNewTertiaryState(lNew, this.m);
            
            if (SchroedingerModel.DEBUG_STATE_TRANSITIONS) {
                console.log('SchroedingerModel.setElectronState ' + 
                    SchroedingerModel.stateToString( this.getElectronState(), this.l, this.m ) + 
                    ' -> ' + 
                    SchroedingerModel.stateToString( nNew, lNew, mNew )
                );
            }
            
            // Verify that no transition rules have been broken.
            var valid = SchroedingerModel.isAValidTransition(this.getElectronState(), this.l, this.m, nNew, lNew, mNew);
            if (valid) {
                this.l = lNew;
                this.m = mNew;
                DeBroglieModel.prototype.setElectronState.apply(this, [nNew])
            }
            else {
                // There's a bug in the implementation of the transition rules.
                // Print a warning and (as a last resort) transition to (1,0,0).
                SchroedingerModel.warnBadTransition(this.getElectronState(), this.l, this.m, nNew, lNew, mNew);
                this.l = 0;
                this.m = 0;
                DeBroglieModel.prototype.setElectronState.apply(this, [1])
            }
        },
        
        /**
         * Our Schrodinger model emits photons from a random point on the first Bohr orbit.
         * This returns a reference to a Point2D -- be careful not to modify the value returned!
         */
        getSpontaneousEmissionPosition: function() {
            // random point on the orbit
            var radius = DeBroglieModel.getOrbitRadius(SchroedingerModel.GROUND_STATE);
            var angle = RandomUtils.randomAngle();
            // convert to Cartesian coordinates, adjust for atom's position
            var x = (radius * Math.cos(angle)) + this.getX();
            var y = (radius * Math.sin(angle)) + this.getY();
            this.spontaneousEmissionPoint.set(x, y);
            return this.spontaneousEmissionPoint;
        },
        
        /**
         * Chooses a new lower value for the primary state (n).
         * The possible values of n are limited by the current value of l, since abs(l-l') must be 1.
         * The probability of each possible n transition is determined by its transition strength.
         */
        getLowerPrimaryState: function(nOld) {
            var nNew = -1;

            if (nOld < 2) {
                // no state is lower than (1,0,0)
                return -1;
            }
            else if (nOld === 2) {
                if (this.l === 0) {
                    // transition from (2,0,?) to (1,0,?) cannot satisfy the abs(l-l')=1 rule
                    return -1;
                }
                else {
                    // the only transition from (2,1,?) is (1,0,0)
                    nNew = 1;
                }
            }
            else if (nOld > 2) {
                
                // determine the possible range of n
                var nMax = nOld - 1;
                var nMin = Math.max(this.l, 1);
                if (this.l === 0) {
                    // transition from (n,0,0) to (1,?,?) cannot satisfy the abs(l-l')=1 rule
                    nMin = 2;
                }
                
                // get the strengths for each possible transition
                this.probabilisticChooser.clear();
                var numEntries = nMax - nMin + 1;
                var strengthSum = 0;
                for (var i = 0; i < numEntries; i++) {
                    var state = nMin + i;
                    var transitionStrength = SchroedingerModel.TRANSITION_STRENGTH[nOld-1][state-1];
                    this.probabilisticChooser.add(transitionStrength, state);
                    strengthSum += transitionStrength;
                }
                if (strengthSum === 0) {
                    // all transitions had zero strength, none are possible
                    return -1;
                }
                
                // choose a transition
                var value = this.probabilisticChooser.get();
                if (value === null)
                    return -1;
                
                nNew = value;
            }
            
            return nNew;
        },
        
        /*
         * Chooses a value for the secondary state (l) based on the primary state (n).
         * The new value l' must be in [0,...n-1], and l-l' must be in [-1,1].
         */
        getNewSecondaryState: function(nNew, lOld) {
            var lNew = 0;
            
            if (lOld === 0) {
                lNew = 1;
            }
            else if (lOld === nNew) {
                lNew = lOld - 1;
            }
            else if (lOld == nNew - 1) {
                lNew = lOld - 1;
            }
            else {
                if (RandomUtils.randomBoolean())
                    lNew = lOld + 1;
                else
                    lNew = lOld - 1;
            }
            
            return lNew;
        },
        
        /*
         * Chooses a value for the tertiary state (m) based on the primary state (l).
         * The new value m' must be in [-l,...,+l], and m-m' must be in [-1,0,1].
         */
        getNewTertiaryState: function(lNew, mOld) {
            var mNew = 0;
            
            if (lNew === 0) {
                mNew = 0;
            }
            else if (mOld > lNew) {
                mNew = lNew;
            }
            else if (mOld < -lNew) {
                mNew = -lNew;
            }
            else if (mOld === lNew) {
                var a = RandomUtils.randomInteger(2);
                if (a === 0)
                    mNew = mOld;
                else
                    mNew = mOld - 1;
            }
            else if (mOld === -lNew) {
                var a = RandomUtils.randomInteger(2);
                if (a === 0)
                    mNew = mOld;
                else
                    mNew = mOld + 1;
            }
            else {
                var a = RandomUtils.randomInteger(3);
                if (a === 0)
                    mNew = mOld + 1;
                else if (a === 1)
                    mNew = mOld - 1;
                else
                    mNew = mOld;
            }
            
            return mNew;
        },

        getStateAsString: function() {
            return SchroedingerModel.stateToString(this.getElectronState(), this.l, this.m);
        },

        fireOneAbsorbablePhoton: function() {
            this.metastableHandler.fireObviousAbsorbablePhoton();
        },

        isMonochromaticLightType: function() {
            return this.metastableHandler.isMonochromaticLightType();
        }

    }, _.extend({}, Constants.SchroedingerModel, {

        /**
         * Checks state transition rules to see if a proposed transition is valid. 
         */
        isAValidTransition: function(nOld, lOld, mOld, nNew, lNew, mNew) {
            var valid = true;

            if (nOld === nNew)
                valid = false;
            else if (!(nNew >= 1 && nNew <= SchroedingerModel.getNumberOfStates()))
                valid = false;
            else if (!(lNew >= 0 && lNew <= nNew - 1))
                valid = false;
            else if (!(Math.abs(lOld - lNew) === 1))
                valid = false;
            else if (!(mNew >= -lNew && mNew <= +lNew))
                valid = false;
            else if (!(Math.abs(mOld - mNew) <= 1))
                valid = false;
            
            return valid;
        },
        
        /**
         * Probability Density.
         * This algorithm is undefined for (x,y,z) = (0,0,0).
         */
        getProbabilityDensity: function(n, l, m, x, y, z) {
            if (n < 1)
                throw 'violated 1 <= n';
            if (l < 0 || l >= n)
                throw 'violated 0 <= l <= n-1';
            if (m < -l || m > l)
                throw 'violated -l <= m <= +l';
            if (x === 0 && y === 0 && z === 0)
                throw 'undefined for (x,y,z)=(0,0,0)';

            // convert to Polar coordinates
            var r = Math.sqrt(( x * x ) + ( y * y ) + ( z * z ));
            var cosTheta = Math.abs(z) / r;
            // calculate wave function
            var w = SchroedingerModel.getWaveFunction(n, l, m, r, cosTheta);
            // square the wave function
            return (w * w);
        },

        /*
         * Wavefunction.
         */
        getWaveFunction: function(n, l, m, r, cosTheta) {
            var t1 = SchroedingerModel.getGeneralizedLaguerrePolynomial(n, l, r);
            var t2 = AssociatedLegendrePolynomials.solve(l, Math.abs(m), cosTheta);
            return (t1 * t2);
        },
        
        /*
         * Generalized Laguerre Polynomial.
         * Codified from design document.
         */
        getGeneralizedLaguerrePolynomial: function(n, l, r) {
            var a = DeBroglieModel.getOrbitRadius(n) / (n * n);
            var multiplier = Math.pow(r, l) * Math.exp(-r / (n * a));
            var b0 = 2 * Math.pow((n * a), (-1.5)); // b0
            var limit = n - l - 1;
            var bj = b0;
            var sum = b0; // j==0
            for (var j = 1; j <= limit; j++) {
                bj = (2 / (n * a)) * ((j + l - n) / (j * (j + (2 * l) + 1))) * bj;
                sum += (bj * Math.pow(r, j));
            }
            return (multiplier * sum);
        },

        warnBadTransition: function(nOld, lOld, mOld, nNew, lNew, mNew) {
            console.warn('WARNING! SchrodingerModel: bad transition ' + 
                SchroedingerModel.stateToString(nOld, lOld, mOld) + 
                ' -> ' + 
                SchroedingerModel.stateToString(nNew, lNew, mNew)
            );
        },
        
        stateToString: function(n, l, m) {
            return '(' + n + ',' + l + ',' + m + ')';
        }

    }));

    return SchroedingerModel;
});