define(function(require) {

    'use strict';

    var BohrEnergyDiagramView = require('hydrogen-atom/views/energy-diagram/bohr');

    /**
     * DeBroglieEnergyDiagram is the energy diagram for the deBroglie model.
     * It is identical to the diagram for the Bohr model.
     */
    var DeBroglieEnergyDiagramView = BohrEnergyDiagramView.extend();


    return DeBroglieEnergyDiagramView;
});
