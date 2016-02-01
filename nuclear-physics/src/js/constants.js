define(function (require) {

    'use strict';

    var HalfLifeInfo = require('models/half-life-info');
    
    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 5;

    //----------------------------------------------------------------------------
    // Paints and Colors
    //----------------------------------------------------------------------------
    
    // Color for the label used for the Polonium nucleus.
    Constants.POLONIUM_LABEL_COLOR = '#ff0';
    
    // Color for label used for the Lead nucleus.
    Constants.LEAD_LABEL_COLOR = '#000';
    
    // Color for label used for the Custom nucleus (pre-decay).
    Constants.CUSTOM_NUCLEUS_LABEL_COLOR = new Color '#99ffff';
    
    // Color for label used for the Decayed Custom nucleus.
    Constants.CUSTOM_NUCLEUS_POST_DECAY_LABEL_COLOR = '#000';
    
    // Color for label used for the Hydrogen 3 nucleus.
    Constants.HYDROGEN_3_LABEL_COLOR = '#7FFF00';
    
    // Color for label used for the Helium 3 nucleus.
    Constants.HELIUM_3_LABEL_COLOR = '#FFC0CB';
    
    // Color for label used for the Carbon 14 nucleus.
    Constants.CARBON_14_LABEL_COLOR = '#ff0';
    
    // Color for label used for the Uranium 235 nucleus.
    Constants.NITROGEN_14_LABEL_COLOR = '#f80';
    
    // Color for label used for the Uranium 235 nucleus.
    Constants.URANIUM_235_LABEL_COLOR = '#0f0';
    
    // Color for label used for the Uranium 236 nucleus.
    Constants.URANIUM_236_LABEL_COLOR = '#f80';
    
    // Color for label used for the Uranium 238 nucleus.
    Constants.URANIUM_238_LABEL_COLOR = '#ff0';
    
    // Color for label used for the Uranium 239 nucleus.
    Constants.URANIUM_239_LABEL_COLOR = '#fff';
    
    // Color for hydrogen when represented as a circle or sphere.
    Constants.HYDROGEN_COLOR = '#FFC0DB';
    
    // Color for helium when represented as a circle or sphere.
    Constants.HELIUM_COLOR = '#0ff';
    
    // Color for carbon when represented as a circle or sphere.
    Constants.CARBON_COLOR = '#C80000';
    
    // Color for nitrogen when represented as a circle or sphere.
    Constants.NITROGEN_COLOR = '#0E56C8';
    
    // Color for Uranium when represented as a circle or sphere.
    Constants.URANIUM_COLOR = '#969600';
    
    // Color for Lead when represented as a circle or sphere.
    Constants.LEAD_COLOR = '#61757E';
    
    // Color for Polonium when represented as a circle or sphere.
    Constants.POLONIUM_COLOR = '#f80';
    
    // Color for pre-decay custom nucleus when represented as a circle or sphere.
    Constants.CUSTOM_NUCLEUS_PRE_DECAY_COLOR = '#9B612A';
    
    // Color for post-decay custom nucleus when represented as a circle or sphere.
    Constants.CUSTOM_NUCLEUS_POST_DECAY_COLOR = '#368237';
    
    // Color of the chart background for the alpha decay application.
    Constants.CHART_BACKGROUND_COLOR = '#F6F2AF';
    
    // Color of the reset button that appears on many of the canvases.
    Constants.CANVAS_RESET_BUTTON_COLOR = '#ff9900';
    
    // Colors for the strata in the Radioactive Dating Game, assumed to go
    // from top to bottom.
    // public static final ArrayList<Color> strataColors = new ArrayList<Color>();
    // static {
    //     strataColors.add( new Color( 111, 131, 151 ) );
    //     strataColors.add( new Color( 153, 185, 216 ) );
    //     strataColors.add( new Color( 216, 175, 208 ) );
    //     strataColors.add( new Color( 198, 218, 119 ) );
    //     strataColors.add( new Color( 179, 179, 179 ) );
    //     strataColors.add( Color.DARK_GRAY );
    // }

    //----------------------------------------------------------------------------
    // Misc Constants Shared within the Sim
    //----------------------------------------------------------------------------
    Constants.NUCLEON_DIAMETER        = 1.6; // In femtometers.
    Constants.ALPHA_PARTICLE_DIAMETER = 3.2; // In femtometers.
    Constants.ELECTRON_DIAMETER = 0.75; // In femtometers, not to scale, or even close.
    Constants.ANTINEUTRINO_DIAMETER = 0.3; // In femtometers, not to scale, or even close.

    Constants.PROTON_COLOR = '#f00';
    Constants.NEUTRON_COLOR = '#888';
    Constants.ELECTRON_COLOR = '#069EC7';
    Constants.ANTINEUTRINO_COLOR = '#00C800';
    
    Constants.DEFAULT_CUSTOM_NUCLEUS_HALF_LIFE = HalfLifeInfo.convertYearsToMs(100E3);


    /*************************************************************************
     **                                                                     **
     **                               NUCLEON                               **
     **                                                                     **
     *************************************************************************/

    var Nucleon = {};

    // Possible types of nucleons.  Not done as subclasses since they can
    //   change into one another.
    Nucleon.PROTON  = 1;
    Nucleon.NEUTRON = 2;

    // Distance used for jittering the nucleons.
    Nucleon.JITTER_DISTANCE = Constants.NUCLEON_DIAMETER * 0.1;

    Constants.Nucleon = Nucleon;


    return Constants;
});
