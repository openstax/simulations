// m4th v0.1.0 | (c) 2013-2014 Hendrik Helwich | MIT License
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var index;

module.exports = index = {
  matrix: require("./matrix"),
  lu: require("./lu"),
  ud: require("./ud")
};

if (typeof window !== "undefined" && window !== null) {
  window.m4th = index;
}

},{"./lu":2,"./matrix":3,"./ud":4}],2:[function(require,module,exports){
var M, T, creator, fail, luDecompConstructor, luDecompPrototype;

M = require("./matrix");

creator = require("ut1l/create/object");

T = require("ut1l/create/throwable");

fail = T("MatrixException");


/*
  A very basic LU decomposition implementation without pivoting. Decomposition is done in place. Given buffer must
  be square and regular. The values of L below the diagonal are stored. The ones on the diagonal and the zeros
  above the diagonal are not stored. The values of U on and above the diagonal are stored. The zero values below
  the diagonal are not stored.
 */

luDecompConstructor = function(A, T) {
  var i, j, k, _i, _j, _k, _l, _m, _ref, _ref1, _ref2, _ref3;
  if (T == null) {
    T = A.clone();
  }
  for (i = _i = 0, _ref = T.columns; _i < _ref; i = _i += 1) {
    for (j = _j = i, _ref1 = T.columns; _j < _ref1; j = _j += 1) {
      for (k = _k = 0; _k < i; k = _k += 1) {
        T.set(i, j, (T.get(i, j)) - (T.get(i, k)) * (T.get(k, j)));
      }
    }
    for (j = _l = _ref2 = i + 1, _ref3 = T.columns; _l < _ref3; j = _l += 1) {
      for (k = _m = 0; _m < i; k = _m += 1) {
        T.set(j, i, (T.get(j, i)) - (T.get(j, k)) * (T.get(k, i)));
      }
      T.set(j, i, (T.get(j, i)) / (T.get(i, i)));
    }
  }
  this.lu = T;
};

luDecompPrototype = {

  /* Calculate X = A^-1 * B in place or not in place */
  solve: function(B, T) {
    var A, i, j, k, _i, _j, _k, _l, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (T == null) {
      T = B.clone();
    }
    A = this.lu;
    if (B.rows !== A.columns || !B.isSize(T)) {
      fail("unmatching matrix dimension");
    }
    for (k = _i = 0, _ref = A.columns; _i < _ref; k = _i += 1) {
      for (i = _j = _ref1 = k + 1, _ref2 = A.columns; _j < _ref2; i = _j += 1) {
        for (j = _k = 0, _ref3 = T.columns; _k < _ref3; j = _k += 1) {
          T.set(i, j, (T.get(i, j)) - (T.get(k, j)) * (A.get(i, k)));
        }
      }
    }
    for (k = _l = _ref4 = A.columns - 1; _l >= 0; k = _l += -1) {
      for (j = _m = 0, _ref5 = T.columns; _m < _ref5; j = _m += 1) {
        T.set(k, j, (T.get(k, j)) / (A.get(k, k)));
      }
      for (i = _n = 0; _n < k; i = _n += 1) {
        for (j = _o = 0, _ref6 = T.columns; _o < _ref6; j = _o += 1) {
          T.set(i, j, (T.get(i, j)) - (T.get(k, j)) * (A.get(i, k)));
        }
      }
    }
    return T;
  },
  getInverse: function() {
    var I;
    I = M.I(this.lu.columns);
    return this.solve(I, I);
  }
};

module.exports = creator(luDecompConstructor, luDecompPrototype);

},{"./matrix":3,"ut1l/create/object":5,"ut1l/create/throwable":6}],3:[function(require,module,exports){
var T, add, ceil, createMatrix, creator, each, eachDiagonal, eachInRow, fail, failUnmatchingDimensions, floor, id, isNumber, makeReduce, matrixConstructor, matrixProto, matrixStatic, min, minus, sqrt;

creator = require("ut1l/create/object");

T = require("ut1l/create/throwable");

fail = T("MatrixException");

failUnmatchingDimensions = function() {
  return fail("invalid dimension");
};

floor = Math.floor, ceil = Math.ceil, sqrt = Math.sqrt, min = Math.min;

id = function(x) {
  return x;
};

add = function(a, b) {
  return a + b;
};

minus = function(a, b) {
  return a - b;
};

isNumber = function(n) {
  return typeof n === "number";
};

matrixConstructor = function(arrayOrRows, arrayOrColumns, arrayOpt) {
  var array, cols, rows;
  if (!isNumber(arrayOrRows)) {
    array = arrayOrRows;
  } else {
    rows = arrayOrRows;
    if (!isNumber(arrayOrColumns)) {
      array = arrayOrColumns;
    } else {
      cols = arrayOrColumns;
      array = arrayOpt;
    }
  }
  if (rows == null) {
    rows = ceil(sqrt(array.length));
  }
  if (cols == null) {
    cols = rows === 0 ? 0 : array != null ? ceil(array.length / rows) : rows;
  }
  if (array == null) {
    array = [];
  }
  this.columns = cols;
  this.rows = rows;
  this.array = array;
};

matrixStatic = {
  I: function(rows, columns) {
    var i, _i, _ref;
    if (columns == null) {
      columns = rows;
    }
    T = createMatrix(rows, columns);
    T.fill(0, T);
    for (i = _i = 0, _ref = min(rows, columns); _i < _ref; i = _i += 1) {
      T.set(i, i, 1);
    }
    return T;
  },
  diag: function(x, T) {
    if (T == null) {
      T = createMatrix(x.length, x.length);
    } else if (!T.isSize(x.length)) {
      failUnmatchingDimensions();
    }
    T.each(function(val, r, c) {
      return T.set(r, c, r === c ? x[r] : 0);
    });
    return T;
  }
};

eachInRow = function(row, handler) {
  var j, _i, _ref;
  for (j = _i = 0, _ref = this.columns; _i < _ref; j = _i += 1) {
    handler.call(this, this.get(row, j), row, j);
  }
  return this;
};

each = function(handler) {
  var i, _i, _ref;
  for (i = _i = 0, _ref = this.rows; _i < _ref; i = _i += 1) {
    eachInRow.call(this, i, handler);
  }
  return this;
};

eachDiagonal = function(handler) {
  var ij, _i, _ref;
  for (ij = _i = 0, _ref = min(this.rows, this.columns); _i < _ref; ij = _i += 1) {
    handler.call(this, this.get(ij, ij), ij, ij);
  }
  return this;
};

makeReduce = function(eachFunc) {
  return function(callback, initialValue) {
    var value;
    value = initialValue;
    eachFunc.call(this, function(val, i, j) {
      if (value != null) {
        value = callback.call(this, value, val, i, j);
      } else {
        value = val;
      }
    });
    return value;
  };
};

matrixProto = {
  get: function(row, col) {
    if (col == null) {
      col = 0;
    }
    return this.array[row * this.columns + col];
  },
  set: function(row, col, val) {
    this.array[row * this.columns + col] = val;
    return this;
  },
  isSize: function(rowsOrM, columns) {
    if (isNumber(rowsOrM)) {
      if (columns == null) {
        columns = rowsOrM;
      }
      return this.rows === rowsOrM && this.columns === columns;
    } else {
      return this.isSize(rowsOrM.rows, rowsOrM.columns);
    }
  },
  isSquare: function() {
    return this.rows === this.columns;
  },
  each: each,
  eachDiagonal: eachDiagonal,
  reduce: makeReduce(each),
  reduceDiagonal: makeReduce(eachDiagonal),
  reduceRows: function(callback, initialValue) {
    var i, j, rdcRows, val, value, _i, _j, _ref, _ref1;
    rdcRows = [];
    for (i = _i = 0, _ref = this.rows; _i < _ref; i = _i += 1) {
      value = initialValue;
      for (j = _j = 0, _ref1 = this.columns; _j < _ref1; j = _j += 1) {
        val = this.get(i, j);
        if (value != null) {
          value = callback.call(this, value, val, i, j);
        } else {
          value = val;
        }
      }
      rdcRows.push(value);
    }
    return rdcRows;
  },
  map: function() {
    var args, elements, func, l, n;
    args = arguments;
    n = args.length - 1;
    if (args[n] === void 0) {
      n -= 1;
    }
    if (typeof args[n] !== "function") {
      T = args[n--];
      if (!this.isSize(T)) {
        failUnmatchingDimensions();
      }
    } else {
      T = createMatrix(this.rows, this.columns);
    }
    func = args[n];
    l = T.rows * T.columns;
    elements = [];
    T.each((function(_this) {
      return function(val, i, j) {
        var k, _i;
        elements[0] = _this.get(i, j);
        for (k = _i = 0; _i < n; k = _i += 1) {
          elements[k + 1] = args[k].get(i, j);
        }
        elements[++k] = i;
        elements[++k] = j;
        return T.set(i, j, func.apply(_this, elements));
      };
    })(this));
    return T;
  },
  clone: function(T) {
    return this.map(id, T);
  },
  fill: function(s, T) {
    return this.map((function() {
      return s;
    }), T);
  },
  times: function(s, T) {
    return this.map((function(x) {
      return s * x;
    }), T);
  },
  add: function(B, T) {
    return this.map(B, add, T);
  },
  minus: function(B, T) {
    return this.map(B, minus, T);
  },
  transp: function(T) {
    var B, i, j, _i, _j, _ref, _ref1, _ref2;
    if (T == null) {
      T = createMatrix(this.columns, this.rows);
    }
    if (T === this) {
      B = this.clone();
      _ref = [this.columns, this.rows], this.rows = _ref[0], this.columns = _ref[1];
      return B.transp(this);
    } else {
      if (this.rows !== T.columns || this.columns !== T.rows) {
        failUnmatchingDimensions();
      }
      for (i = _i = 0, _ref1 = this.columns; _i < _ref1; i = _i += 1) {
        for (j = _j = 0, _ref2 = this.rows; _j < _ref2; j = _j += 1) {
          T.set(i, j, this.get(j, i));
        }
      }
      return T;
    }
  },
  mult: function(B, T) {
    var i, j, k, _i, _j, _k, _ref, _ref1, _ref2;
    if (T == null) {
      T = createMatrix(this.rows, B.columns);
    }
    if (this.columns !== B.rows || T.rows !== this.rows || T.columns !== B.columns) {
      failUnmatchingDimensions();
    }
    T.fill(0, T);
    for (i = _i = 0, _ref = this.rows; _i < _ref; i = _i += 1) {
      for (j = _j = 0, _ref1 = B.columns; _j < _ref1; j = _j += 1) {
        for (k = _k = 0, _ref2 = this.columns; _k < _ref2; k = _k += 1) {
          T.array[i * T.columns + j] += (this.get(i, k)) * (B.get(k, j));
        }
      }
    }
    return T;
  },
  toString: (function() {
    var concatEntries;
    concatEntries = function(x, y) {
      return x + " " + y;
    };
    return function() {
      return (this.reduceRows(concatEntries)).join("\n");
    };
  })()
};

module.exports = createMatrix = creator(matrixStatic, matrixConstructor, matrixProto);

},{"ut1l/create/object":5,"ut1l/create/throwable":6}],4:[function(require,module,exports){
var M, T, creator, fail, udDecompConstructor, udDecompPrototype;

M = require("./matrix");

creator = require("ut1l/create/object");

T = require("ut1l/create/throwable");

fail = T("MatrixException");

udDecompConstructor = function(A, T, U, D) {
  var i, j, k, s, _i, _j, _k, _ref, _ref1, _ref2;
  if (T == null) {
    T = A.clone();
  }
  if (U == null) {
    U = T;
  }
  if (D == null) {
    D = T;
  }
  if (!T.isSquare()) {
    fail("matrix must be square");
  }
  this.size = T.columns;
  for (j = _i = _ref = this.size - 1; _i >= 0; j = _i += -1) {
    for (i = _j = j; _j >= 0; i = _j += -1) {
      s = T.get(i, j);
      for (k = _k = _ref1 = j + 1, _ref2 = this.size; _k < _ref2; k = _k += 1) {
        s -= (U.get(i, k)) * (D.get(k, k)) * (U.get(j, k));
      }
      if (i === j) {
        D.set(j, j, s);
      } else {
        if ((D.get(j, j)) === 0) {
          fail("not a regular matrix");
        }
        U.set(i, j, s / D.get(j, j));
      }
    }
  }
  this.ud = T;
};

udDecompPrototype = {
  solveDiagonal: function(y, t) {
    var i, j, _i, _j, _ref, _ref1;
    if (t == null) {
      t = y.clone();
    }
    for (i = _i = 0, _ref = this.size; _i < _ref; i = _i += 1) {
      for (j = _j = 0, _ref1 = y.columns; _j < _ref1; j = _j += 1) {
        t.set(i, j, y.get(i, j) / this.ud.get(i, i));
      }
    }
    return t;
  },
  solveUnitTriangular: function(y, transp, t) {
    var i, j, k, _i, _j, _k, _l, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (t == null) {
      t = y.clone();
    }
    if (transp) {
      for (j = _i = 0, _ref = y.columns; _i < _ref; j = _i += 1) {
        for (i = _j = 0, _ref1 = this.size; _j < _ref1; i = _j += 1) {
          t.set(i, j, y.get(i, j));
          for (k = _k = 0; _k < i; k = _k += 1) {
            t.set(i, j, (t.get(i, j)) - (this.ud.get(k, i)) * (t.get(k, j)));
          }
        }
      }
    } else {
      for (j = _l = 0, _ref2 = y.columns; _l < _ref2; j = _l += 1) {
        for (i = _m = _ref3 = this.size - 1; _m >= 0; i = _m += -1) {
          t.set(i, j, y.get(i, j));
          for (k = _n = _ref4 = i + 1, _ref5 = this.size; _n < _ref5; k = _n += 1) {
            t.set(i, j, (t.get(i, j)) - (this.ud.get(i, k)) * (t.get(k, j)));
          }
        }
      }
    }
    return t;
  },
  solve: function(y, t) {
    if (t == null) {
      t = y.clone();
    }
    this.solveUnitTriangular(y, false, t);
    this.solveDiagonal(t, t);
    this.solveUnitTriangular(t, true, t);
    return t;
  }
};

module.exports = creator(udDecompConstructor, udDecompPrototype);

},{"./matrix":3,"ut1l/create/object":5,"ut1l/create/throwable":6}],5:[function(require,module,exports){
var createBuilder;

createBuilder = function(extend, constructor, prototype) {
  var F, f, key, value;
  if (typeof extend === "function") {
    prototype = constructor;
    constructor = extend;
    extend = null;
  } else if ((constructor == null) && (prototype == null)) {
    prototype = extend;
    extend = null;
  }
  F = constructor != null ? function(args) {
    var ret;
    ret = constructor.apply(this, args);
    if (ret !== void 0) {
      return ret;
    } else {
      return this;
    }
  } : function() {};
  if (prototype == null) {
    prototype = {};
  }
  F.prototype = prototype;
  f = function() {
    return new F(arguments);
  };
  f.prototype = prototype;
  for (key in extend) {
    value = extend[key];
    f[key] = value;
  }
  return f;
};

module.exports = createBuilder;

},{}],6:[function(require,module,exports){
var O, createCreateThrowable, createTopThrowable, throwableConstr, throwableProto;

O = require("./object");

throwableProto = {
  name: "Error",
  toString: function() {
    if (this.message != null) {
      return "" + this.name + ": " + this.message;
    } else {
      return this.name;
    }
  }
};

createTopThrowable = O(throwableProto);

throwableConstr = function(message) {
  var e;
  this.message = message;
  e = Error.call(this, message);
  this.stack = e.stack;
};

createCreateThrowable = function(name, parent) {
  var proto;
  if (parent == null) {
    parent = createTopThrowable;
  }
  proto = parent();
  if (name != null) {
    proto.name = name;
  }
  return O(throwableConstr, proto);
};

createCreateThrowable.c4tch = function() {
  var action, arg, args, idx, onError, throwables, _i, _len;
  args = arguments;
  throwables = [];
  for (idx = _i = 0, _len = args.length; _i < _len; idx = ++_i) {
    arg = args[idx];
    if (arg.prototype instanceof createTopThrowable) {
      throwables.push(arg);
    } else {
      break;
    }
  }
  if (throwables.length === 0) {
    throwables.push(createTopThrowable);
  }
  action = args[idx];
  onError = args[idx + 1];
  return function() {
    var e, t, _j, _len1;
    try {
      return action.apply(this, arguments);
    } catch (_error) {
      e = _error;
      for (_j = 0, _len1 = throwables.length; _j < _len1; _j++) {
        t = throwables[_j];
        if (e instanceof t) {
          return (onError != null ? onError.call(this, e) : void 0);
        }
      }
      throw e;
    }
  };
};

module.exports = createCreateThrowable;

},{"./object":5}]},{},[1])