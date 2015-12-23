define(function (require) {

    'use strict';

    var XML = require('pixl-xml');

    var Vector2 = require('common/math/vector2');

    var Circuit  = require('models/circuit');
    var Branch   = require('models/branch');
    var Junction = require('models/junction');

    /**
     * Parses an XML string and creates and returns a circuit object.
     */
    var parseXML = function(xml) {
        var circuit = new Circuit();
        console.log(XML.parse(xml));
        // for (var i = 0; i < xml.getChildrenCount(); i++ ) {
        //     IXMLElement child = xml.getChildAtIndex( i );
        //     if ( child.getName().equals( "junction" ) ) {
        //         String xStr = child.getAttribute( "x", "0.0" );
        //         String yStr = child.getAttribute( "y", "0.0" );
        //         double x = Double.parseDouble( xStr );
        //         double y = Double.parseDouble( yStr );
        //         Junction j = new Junction( x, y );
        //         circuit.addJunction( j );
        //     }
        //     else if ( child.getName().equals( "branch" ) ) {
        //         var startIndex = child.getAttribute( "startJunction", -1 );
        //         var endIndex = child.getAttribute( "endJunction", -1 );
        //         Junction startJunction = circuit.junctionAt( startIndex ); //this only works if everything stays in order.
        //         Junction endJunction = circuit.junctionAt( endIndex );
        //         Branch branch = toBranch( module, kl, startJunction, endJunction, child );
        //         circuit.addBranch( branch );
        //     }
        // }
        return circuit;
    };

    /**
     * Converts a circuit object into an XML string and returns it.
     */
    var toXML = function(circuit) {

    };


    var Persistence = {
        parseXML: parseXML,
        toXML: toXML
    };

    return Persistence;
});
