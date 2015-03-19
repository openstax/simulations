define(function (require) {

    'use strict';


    var Constants = {}; 

   	Constants.TILE_SIZE = 1; // meters
   	Constants.PARTICLE_RADIUS = 0.375; // meters

    Constants.TAB_BG_COLOR = '#CCCCCC';
    Constants.TAB_BG_ALPHA = 1;
    Constants.TAB_ACTIVE_BG_COLOR = '#EDEDED';
    Constants.TAB_ACTIVE_BG_ALPHA = 1;
    Constants.TAB_FONT = 'bold 14px Arial';
    Constants.TAB_WIDTH = 110;
    Constants.TAB_HEIGHT = 32;
    Constants.TABS = [{
        label: 'Position',
        color: '#2575BA',
    },{
        label: 'Velocity',
        color: '#CD2520',
    },{
        label: 'Acceleration',
        color: '#349E34',
    }];

    return Constants;
});
