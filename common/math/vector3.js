define(function (require) {

    'use strict';

    /** 
     * This is a fork of the Vector3 class by Auxolust at 
	 *   https://github.com/Auxolust/Node-Vec3, which was 
	 *   released under an MIT license.
	 * 
	 * The original version had an option in each function
	 *   for immediately appying changes to the object or
	 *   returning a new object with those changes,
	 *   defaulting to return a new object every time.  I
	 *   wanted it to be just like the Vector2 class we
	 *   are using, so I took out that functionality. I've
	 *   also defined some function aliases.
	 *
	 *                                      - Patrick
     */

    function Vector3(x, y, z) {
         this.x = x||0;
         this.y = y||0;
         this.z = z||0;
    }
    var p = Vector3.prototype;

    p.toString = function() {
    	return "x: " + this.x + " y: " + this.y + " z: " + this.z;
    };

    p.clone = function() {
        return new Vector3(this.x, this.y, this.z);
    };

    p.toArr = function() {
    	return [this.x, this.y, this.z];
    };

    p.set = function(x, y, z){
        if (typeof x==='object') {
            z = x.z;
            y = x.y;
            x = x.x;
        }
        typeof x !== 'undefined' && (this.x = x);
        typeof y !== 'undefined' && (this.y = y);
        typeof z !== 'undefined' && (this.z = z);
        return this;
    };

    p.add = function(o, i) {
    	return this.set(this.x + o.x, this.y + o.y, this.z + (o.z||0));
    };

    p.sub = function(o, i) {
    	return this.set(this.x - o.x, this.y - o.y, this.z - (o.z||0));
    };

    p.mul = function(m, i) {
    	return this.set(this.x*m, this.y*m, this.z*m);
    };

    p.div = function(m, i) {
    	// Avoid div zero errors
    	return this.set(this.x/m||0, this.y/m||0, this.z/m)||0;
    };

    p.dot = function(o, i) {
    	// Avoid div zero errors
    	return this.x*o.x + this.y*o.y + this.z*(o.z||0);
    };

    p.sqmag = function() {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    };

    p.mag = function() {
        return Math.sqrt(this.sqmag());
    };

    p.norm = function() {
        return this.div(this.mag());
    };

    p.cross = function(o, i) {
    	var a = this.y * (o.z||0) - this.z * o.y;
        var b = this.z * o.x - this.x * (o.z||0);
        var c = this.y * this.x - this.x * o.y;
     	return this.set(a, b, c);
    };

    p.eq = function(o) {
        return this.x == o.x && this.y == o.y && this.z == o.z;
    };

    // Function aliases
    p.subtract = p.sub;
    p.scale    = p.mul;
    p.length   = p.mag;
    p.lengthSq = p.sqmag;
    p.normal   = p.norm;


    return Vector3;

});