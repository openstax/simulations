define(function (require) {

    'use strict';

    var range = require('common/math/range');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.DISCRETENESS_RANGE = range({ min: 1, max: 30, defaultValue: 10 });

    Constants.SYSTEM_WIDTH = 300; // Arbitrary units


    /*************************************************************************
     **                                                                     **
     **                         REMOTE CONTROL VIEW                         **
     **                                                                     **
     *************************************************************************/

    var ExternalFieldControlView = {};

    ExternalFieldControlView.RIGHT = 20;
    ExternalFieldControlView.BOTTOM = 62 + 20;
    ExternalFieldControlView.PANEL_PADDING = 15;
    ExternalFieldControlView.PANEL_WIDTH  = 200; // pixels
    ExternalFieldControlView.PANEL_HEIGHT = 240; // pixels
    ExternalFieldControlView.PANEL_COLOR = '#fff';
    ExternalFieldControlView.PANEL_ALPHA = 0.5;
    ExternalFieldControlView.AREA_WIDTH  = ExternalFieldControlView.PANEL_WIDTH - 2 * ExternalFieldControlView.PANEL_PADDING;
    ExternalFieldControlView.AREA_HEIGHT = ExternalFieldControlView.PANEL_WIDTH - 2 * ExternalFieldControlView.PANEL_PADDING;
    ExternalFieldControlView.ARROW_AREA_COLOR = '#fff';
    ExternalFieldControlView.ARROW_AREA_ALPHA = 0.5;
    ExternalFieldControlView.ARROW_COLOR = '#21366b';

    Constants.ExternalFieldControlView = ExternalFieldControlView;


    return Constants;
});
