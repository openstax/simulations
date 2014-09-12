/**
 * From: http://www.cgrats.com/javascript-2d-vector-library.html
 */
/*
       Common vector2 operations
       Ugly as hell but no GC headaches
       Author: Tudor Nita | cgrats.com
       Version: 0.6 

*/
/* vector 2D structure */
function Vec2(x_,y_) {
    this.x = x_;
    this.y = y_;
}

/* vector math */
vMath = new function() {
    /* vector * scalar */
    this.mulS = function(v, value)  { v.x*=value;  v.y*=value;      }
    /* vector * vector */
    this.mulV = function(v1,v2)     { v1.x*= v2.x;v1.y*=v2.y;       }
    /* vector / scalar */
    this.divS = function(v, value)  { v.x/=value; v.y/=value;       }
    /* vector + scalar */
    this.addS = function(v, value)  { v.x+=value; v.y+=value;       }
    /* vector + vector */
    this.addV  = function(v1,v2)    { v1.x+=v2.x; v1.y+=v2.y;       }
    /* vector - scalar */
    this.subS = function(v, value)  { v.x-=value;  v.y-=value;      }
    /* vector - vector */
    this.subV = function(v1, v2)    { v1.x-=v2.x; v1.y-=v2.y;       }
    /*  vector absolute */
    this.abs = function(v)          { Math.abs(v.x); Math.abs(v.y); }
    /* dot product */
    this.dot = function(v1,v2)      { return (v1.x*vec_.x+v2.y*vec_.y); }
    /* vector length */
    this.length = function(v)       { return Math.sqrt(v.dot(v));       }
    /* distance between vectors */
    this.dist = function(v1,v2)     { return (v2.subV(v1)).length();    }
    /* vector length, squared */
    this.lengthSqr = function(v)    { return v.dot(v);                  }
    /* 
        vector linear interpolation 
        interpolate between two vectors.
        value should be in 0.0f - 1.0f space ( just to skip a clamp operation )
    */
    this.lerp = function(targetV2, v1,v2, value) {  
        targetV2.x = v1.x+(v2.x-v1.x)*value;
        targetV2.y = v1.y+(v2.y-v1.y)*value;
    }
    /* normalize a vector */
    this.normalize  = function(v) {
        var vlen   = v.length();
        v.x = v.x/ vlen;
        v.y = v.y/ vlen;
    }
}