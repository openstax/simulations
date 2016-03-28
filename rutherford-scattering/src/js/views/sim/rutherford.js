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

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
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