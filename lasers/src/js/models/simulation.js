define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var QuantumSimulation = require('common/quantum/models/simulation');
    var Rectangle         = require('common/math/rectangle');

    // Local dependencies need to be referenced by relative paths
    //   so we can use this in other projects.
    

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var LasersSimulation = QuantumSimulation.extend({

        // Properties for two and three level atoms
        twoLevelProperties:   new TwoLevelElementProperties(),
        threeLevelProperties: new ThreeLevelElementProperties(),

        defaults: _.extend(QuantumSimulation.prototype.defaults, {
            originX: 100, 
            originY: 300,
            width:   800,
            height:  800
        }),
        
        initialize: function(attributes, options) {
            QuantumSimulation.prototype.initialize.apply(this, [attributes, options]);

            var minX = Math.floor(this.get('originX') - 50);
            var minY = Math.floor(this.get('originY') - this.get('height') / 2);
            this.boundingRectangle = new Rectangle(minX, minY, this.get('width'), this.get('height'));

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.models = [];

            this.stimulatingBeam = null;
            this.pumpingBeam = null;
            this.tube = null;

            this.bodies = [];
            this.photons = new Backbone.Collection();
            this.atoms = new Backbone.Collection();
            this.mirrors = [];
            this.lasingPhotons = [];
            
            // Set up the system of collision experts
            this.collisionMechanism = new CollisionMechanism();
            this.collisionMechanism.addCollisionExpert( new SphereSphereExpert() );
            this.collisionMechanism.addCollisionExpert( new PhotonAtomCollisonExpert() );
            this.collisionMechanism.addCollisionExpert( new SphereBoxExpert() );
            this.collisionMechanism.addCollisionExpert( new PhotonMirrorCollisonExpert() );

            
            this.angleWindow = LasersConfig.PHOTON_CHEAT_ANGLE;

            private int numPhotons;

            // Counters for the number of atoms in each state
            private int numGroundStateAtoms;
            private int numMiddleStateAtoms;
            private int numHighStateAtoms;

            this.set('currentElementProperties', this.twoLevelProperties);


        },

        _update: function(time, deltaTime) {
            
        },

        addModel: function(model) {
            this.models.push(model);

            if (model.collidable) 
                this.bodies.push(model);
            
            if (model instanceof Photon)
                this.addPhoton(model);

            if (model instanceof Atom)
                this.addAtom(model);
            
            if (model instanceof Mirror)
                this.mirrors.push(model);
            
            if (model instanceof Tube)
                this.tube = model;
        },

        removeModel: function(model) {
            for (var i = this.models.length - 1; i >= 0; i--) {
                if (this.models[i] === models) {
                    this.models.splice(i, 1);
                    return true;
                }
            }

            return false;
        },

        addPhoton: function(photon) {

        },

        addAtom: function(atom) {

        }

    });

    return LasersSimulation;
});
