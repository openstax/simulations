define(function(require) {

    'use strict';

    var PixiSceneView = require('common/v3/pixi/view/scene');

    // CSS
    require('less!nuclear-fission/styles/scene');

    /**
     *
     */
    var NuclearFissionSceneView = PixiSceneView.extend();

    return NuclearFissionSceneView;
});
