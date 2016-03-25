define(function(require) {

    'use strict';

    var _ = require('underscore');

    var RutherfordScatteringSimView    = require('rutherford-scattering/views/sim');
    var PlumPuddingSceneView    = require('rutherford-scattering/views/scene/plum-pudding');

    var PlumPuddingSimulation = require('rutherford-scattering/models/simulation/plum-pudding');

    /**
     * Extends the functionality of the RutherfordScattering to create
     *   the Rutherford Atom tab.
     */
    var PlumPuddingView = RutherfordScatteringSimView.extend({

        events: _.extend(RutherfordScatteringSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Plum Pudding Atom',
                name:  'plum-pudding-atom'
            }, options);

            this.showAtomProperties = false;
            
            RutherfordScatteringSimView.prototype.initialize.apply(this, [ options ]);

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PlumPuddingSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PlumPuddingSimulation();
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

    return PlumPuddingView;
});