define(function (require) {

    'use strict';


    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SIM_HEIGHT_IN_METERS = 6; // Meters

    // The k value in the original was 0.5 * 1E6, but that had been scaled to
    //   flash screen units, so we're scaling it by the factor that would have 
    //   converted their screen units to their meters according to the legend
    //   on their grid.
    Constants.K = 0.5e6 * (6 / 640);

    Constants.POSITIVE_CHARGE_VALUE =  1;
    Constants.NEGATIVE_CHARGE_VALUE = -1;


    // Found these in the flash project; they might come in handy
    Constants.EFAC = 0.2046;   //E-field conversion factor: E_true = E_model*EFAC
    Constants.VFAC = 1.917E-3; //Voltage conversion factor: V_true = V_model*VFAC

    Constants.colorFromVoltage = function(voltage) {
        if (voltage > 0) {
            // saturates at 20000
            //            green = blue = Math.max( 0, (1 - (voltage / 20000)) * 255 );
            var bright = Math.max(0, 255 - voltage * 0.01275);
            return 16711680 | (bright << 8) | bright; // 255,bright,bright color
        }
        else {
            // saturates at 20000
            //            red = green = Math.max( 0, (1 - (-voltage / 20000)) * 255 );
            var bright =  Math.max(0, 255 + voltage * 0.01275);
            return (bright << 16) | (bright << 8) | 255; // bright,bright,255 color
        }
    };


    /*************************************************************************
     **                                                                     **
     **                                SCENE                                **
     **                                                                     **
     *************************************************************************/

    var SceneView = {};

    SceneView.PANEL_BG = '#ededed';
    SceneView.PANEL_MARGIN = 20;
    SceneView.SHORT_SCREEN_PANEL_MARGIN = 13;

    SceneView.GRID_COLOR = '#000';
    SceneView.GRID_MAJOR_SIZE_IN_METERS = 0.5;
    SceneView.GRID_MINOR_SIZE_IN_METERS = 0.1;

    Constants.SceneView = SceneView;


    /*************************************************************************
     **                                                                     **
     **                         E-FIELD VANE MATRIX                         **
     **                                                                     **
     *************************************************************************/

    var EFieldVaneMatrix = {};

    EFieldVaneMatrix.ARROW_LENGTH      = 0.28; // Meters
    EFieldVaneMatrix.ARROW_WIDTH       = 0.06; // Meters
    EFieldVaneMatrix.ARROW_HEAD_WIDTH  = 0.12; // Meters
    EFieldVaneMatrix.ARROW_HEAD_LENGTH = 0.10; // Meters
    EFieldVaneMatrix.SPACING           = SceneView.GRID_MAJOR_SIZE_IN_METERS; // Meters

    var flashToMetersRatio = (6 / 640);
    EFieldVaneMatrix.eFieldVecLengthToAlpha = function(length) {
        return Math.min(1, (length * flashToMetersRatio) / 100);
    };

    Constants.EFieldVaneMatrix = EFieldVaneMatrix;


    return Constants;
});
