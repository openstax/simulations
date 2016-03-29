define(function(require) {

    'use strict';

    var _ = require('underscore');

    var RutherfordScatteringSimView    = require('rutherford-scattering/views/sim');
    var RutherfordAtomSceneView    = require('rutherford-scattering/views/scene/rutherford');

    var RutherfordAtomSimulation = require('rutherford-scattering/models/simulation/rutherford-atom');

    /**
     * Extends the functionality of the RutherfordScattering to create
     *   the Rutherford Atom tab.
     */
    var RutherfordAtomView = RutherfordScatteringSimView.extend({

        events: _.extend(RutherfordScatteringSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Rutherford Atom',
                name:  'rutherford-atom'
            }, options);

            this.showAtomProperties = true;

            RutherfordScatteringSimView.prototype.initialize.apply(this, [ options ]);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new RutherfordAtomSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new RutherfordAtomSimulation();
        },

        slideProtons: function(event) {
            RutherfordScatteringSimView.prototype.slideProtons.call(this, event);

            this.simulation.pauseAtomDraw();
        },

        slideNeutrons: function(event) {
            RutherfordScatteringSimView.prototype.slideNeutrons.call(this, event);

            // clear atoms
            this.simulation.pauseAtomDraw();
        },

        changeProtons: function(event) {
            RutherfordScatteringSimView.prototype.changeProtons.call(this, event);

            this.simulation.restartAtomDraw();
        },

        changeNeutrons: function(event) {
            RutherfordScatteringSimView.prototype.changeNeutrons.call(this, event);

            this.simulation.restartAtomDraw();
        }

        // /**
        //  * Renders everything
        //  */
        // render: function() {
        //     RutherfordScatteringSimView.prototype.render.apply(this);

        //     this.renderPlaybackControls();

        //     this.simulation.trigger('change:paused');

        //     return this;
        // }

    });

    return RutherfordAtomView;
});