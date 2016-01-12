/* LU, LDL, and QR Matrix Decomposer and Solver. v0.3.0 (c) 2016 Bill Dwyer. MIT License. Build 15236DD8632 */
define(function (require) {

  var namespace = {};

  var backwardSubtitution, copy, decomposeLDL, decomposeLU, decomposeQR, decomposeQRPartial, flatten, fold, forwardSubstition, isSquareMatrix, isSymmetricMatrix, reshape, solve, solveLDL, solveLU, solveQR;
  decomposeLU = function(A) {
    var L, U, aa, ab, i, j, k, l, n, o, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, results, results1, s, t, u, v, w;
    if (!isSquareMatrix(A)) {
      return null;
    }
    n = A.length;
    L = (function() {
      results = [];
      for (var l = 0; 0 <= n ? l < n : l > n; 0 <= n ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map(function() {
      return copy(A[0], function() {
        return 0;
      });
    });
    U = (function() {
      results1 = [];
      for (var o = 0; 0 <= n ? o < n : o > n; 0 <= n ? o++ : o--){ results1.push(o); }
      return results1;
    }).apply(this).map(function() {
      return copy(A[0], function() {
        return 0;
      });
    });
    for (j = q = 0, ref = n; 0 <= ref ? q < ref : q > ref; j = 0 <= ref ? ++q : --q) {
      L[j][j] = 1;
    }
    for (j = r = 0, ref1 = n; 0 <= ref1 ? r < ref1 : r > ref1; j = 0 <= ref1 ? ++r : --r) {
      U[0][j] = A[0][j];
    }
    for (i = t = 1, ref2 = n; 1 <= ref2 ? t < ref2 : t > ref2; i = 1 <= ref2 ? ++t : --t) {
      for (j = u = 0, ref3 = n; 0 <= ref3 ? u < ref3 : u > ref3; j = 0 <= ref3 ? ++u : --u) {
        for (k = v = 0, ref4 = i; 0 <= ref4 ? v < ref4 : v > ref4; k = 0 <= ref4 ? ++v : --v) {
          s = A[i][k];
          for (p = w = 0, ref5 = k; 0 <= ref5 ? w < ref5 : w > ref5; p = 0 <= ref5 ? ++w : --w) {
            s -= L[i][p] * U[p][k];
          }
          L[i][k] = s / U[k][k];
        }
        for (k = aa = ref6 = i, ref7 = n; ref6 <= ref7 ? aa < ref7 : aa > ref7; k = ref6 <= ref7 ? ++aa : --aa) {
          s = A[i][k];
          for (p = ab = 0, ref8 = i; 0 <= ref8 ? ab < ref8 : ab > ref8; p = 0 <= ref8 ? ++ab : --ab) {
            s -= L[i][p] * U[p][k];
          }
          U[i][k] = s;
        }
      }
    }
    return {
      L: L,
      U: U
    };
  };
  decomposeLDL = function(A) {
    var L, a, d, i, j, k, l, n, o, q, r, ref, ref1, ref2, ref3, ref4, results, t;
    if (!(isSquareMatrix(A) && isSymmetricMatrix(A))) {
      return null;
    }
    n = A.length;
    L = (function() {
      results = [];
      for (var l = 0; 0 <= n ? l < n : l > n; 0 <= n ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map(function() {
      return copy(A[0], function() {
        return 0;
      });
    });
    d = copy(A[0], function() {
      return 0;
    });
    for (j = o = 0, ref = n; 0 <= ref ? o < ref : o > ref; j = 0 <= ref ? ++o : --o) {
      L[j][j] = 1;
      a = A[j][j];
      for (k = q = 0, ref1 = j; 0 <= ref1 ? q < ref1 : q > ref1; k = 0 <= ref1 ? ++q : --q) {
        a -= d[k] * L[j][k] * L[j][k];
      }
      d[j] = a;
      if (d[j] === 0) {
        return null;
      }
      for (i = r = ref2 = j + 1, ref3 = n; ref2 <= ref3 ? r < ref3 : r > ref3; i = ref2 <= ref3 ? ++r : --r) {
        L[j][i] = 0;
        a = A[i][j];
        for (k = t = 0, ref4 = j; 0 <= ref4 ? t < ref4 : t > ref4; k = 0 <= ref4 ? ++t : --t) {
          a -= d[k] * L[i][k] * L[j][k];
        }
        L[i][j] = a / d[j];
      }
    }
    return {
      L: L,
      d: d
    };
  };
  decomposeQRPartial = function(A) {
    var QR, d, i, j, k, l, m, n, nrm, o, q, r, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, singular, sum, t, u, v;
    QR = copy(A, function(a) {
      return copy(a);
    });
    m = A.length;
    n = A[0].length;
    d = (function() {
      results = [];
      for (var l = 0; 0 <= m ? l < m : l > m; 0 <= m ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map(function() {
      return 0;
    });
    singular = false;
    for (k = o = 0, ref = n; o < ref; k = o += 1) {
      sum = 0;
      for (i = q = ref1 = k, ref2 = m; q < ref2; i = q += 1) {
        sum += QR[i][k] * QR[i][k];
      }
      nrm = Math.sqrt(sum);
      if (nrm === 0.0) {
        d[k] = 0;
        singular = true;
        continue;
      }
      if (QR[k][k] < 0) {
        nrm *= -1;
      }
      for (i = r = ref3 = k, ref4 = m; r < ref4; i = r += 1) {
        QR[i][k] /= nrm;
      }
      QR[k][k] += 1.0;
      for (j = t = ref5 = k + 1, ref6 = n; t < ref6; j = t += 1) {
        sum = 0;
        for (i = u = ref7 = k, ref8 = m; u < ref8; i = u += 1) {
          sum += QR[i][k] * QR[i][j];
        }
        sum = -sum / QR[k][k];
        for (i = v = ref9 = k, ref10 = m; v < ref10; i = v += 1) {
          QR[i][j] += sum * QR[i][k];
        }
      }
      d[k] = -nrm;
    }
    return {
      QR: QR,
      d: d,
      singular: singular
    };
  };
  decomposeQR = function(A) {
    var Q, QR, R, d, i, j, k, l, m, n, o, q, r, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, singular, t, u, v;
    ref = decomposeQRPartial(A), QR = ref.QR, d = ref.d, singular = ref.singular;
    m = A.length;
    n = A[0].length;
    R = reshape(m, n, A[0]);
    for (i = l = 0, ref1 = m; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      for (j = o = 0, ref2 = n; 0 <= ref2 ? o < ref2 : o > ref2; j = 0 <= ref2 ? ++o : --o) {
        if (i < j || j >= m) {
          R[i][j] = QR[i][j];
        } else if (i === j) {
          R[i][j] = d[i];
        } else {
          R[i][j] = 0;
        }
      }
    }
    Q = reshape(m, m, A[0]);
    for (k = q = ref3 = m - 1; q >= 0; k = q += -1) {
      for (i = r = 0, ref4 = m; r < ref4; i = r += 1) {
        Q[i][k] = 0.0;
      }
      Q[k][k] = 1.0;
      for (j = t = ref5 = k, ref6 = m; t < ref6; j = t += 1) {
        if (!(j < m)) {
          continue;
        }
        if (QR[k][k] !== 0 && (((ref7 = QR[k]) != null ? ref7[k] : void 0) != null)) {
          s = 0;
          for (i = u = ref8 = k, ref9 = m; u < ref9; i = u += 1) {
            s += QR[i][k] * Q[i][j];
          }
          s = -s / QR[k][k];
          for (i = v = ref10 = k, ref11 = m; v < ref11; i = v += 1) {
            Q[i][j] += s * QR[i][k];
          }
        }
      }
    }
    return {
      Q: Q,
      R: R,
      singular: singular
    };
  };
  solve = function(A, b) {
    if (b.length !== A.length) {
      return null;
    }
    if (!isSquareMatrix(A)) {
      return solveQR(A, b);
    } else if (isSymmetricMatrix(A)) {
      return solveLDL(A, b);
    } else {
      return solveLU(A, b);
    }
  };
  solveLU = function(A, b) {
    var L, U, res, x, y;
    res = decomposeLU(A);
    if (res == null) {
      return null;
    }
    L = res.L, U = res.U;
    y = forwardSubstition(L, b);
    x = backwardSubtitution(U, y);
    return x;
  };
  solveLDL = function(A, b) {
    var L, d, res, transposed, x, y, z;
    res = decomposeLDL(A);
    if (res == null) {
      return null;
    }
    L = res.L, d = res.d;
    y = forwardSubstition(L, b);
    z = copy(y, function(yi, i) {
      return yi / d[i];
    });
    x = backwardSubtitution(L, z, transposed = true);
    return x;
  };
  solveQR = function(A, b) {
    var QR, cols, d, i, k, l, m, n, o, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, sum, t, u, x, y;
    ref = decomposeQRPartial(A), QR = ref.QR, d = ref.d;
    y = copy(b);
    m = QR.length;
    n = QR[0].length;
    cols = m < n ? m : n;
    for (k = l = 0, ref1 = cols; l < ref1; k = l += 1) {
      sum = 0;
      for (i = o = ref2 = k, ref3 = m; o < ref3; i = o += 1) {
        sum += QR[i][k] * y[i];
      }
      sum = -sum / QR[k][k];
      for (i = q = ref4 = k, ref5 = m; q < ref5; i = q += 1) {
        y[i] += sum * QR[i][k];
      }
    }
    x = copy(y);
    for (k = r = ref6 = cols - 1; r >= 0; k = r += -1) {
      x[k] /= d[k];
      for (i = t = 0, ref7 = k; 0 <= ref7 ? t < ref7 : t > ref7; i = 0 <= ref7 ? ++t : --t) {
        x[i] -= x[k] * QR[i][k];
      }
    }
    if (m < n) {
      for (k = u = ref8 = cols, ref9 = n; u < ref9; k = u += 1) {
        x[k] = 0;
      }
    } else if (n < m) {
      x = x.slice(0, n);
    }
    return x;
  };
  forwardSubstition = function(L, b) {
    var i, j, l, n, o, ref, ref1, x;
    n = L.length;
    x = copy(b, function() {
      return 0;
    });
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      x[i] = b[i];
      for (j = o = 0, ref1 = i; 0 <= ref1 ? o < ref1 : o > ref1; j = 0 <= ref1 ? ++o : --o) {
        x[i] -= x[j] * L[i][j];
      }
      x[i] /= L[i][i];
    }
    return x;
  };
  backwardSubtitution = function(U, b, transposed) {
    var i, j, l, n, o, ref, ref1, ref2, x;
    if (transposed == null) {
      transposed = false;
    }
    n = U.length;
    x = copy(b, function() {
      return 0;
    });
    for (i = l = ref = n - 1; l >= 0; i = l += -1) {
      x[i] = b[i];
      for (j = o = ref1 = i + 1, ref2 = n; o < ref2; j = o += 1) {
        x[i] -= x[j] * (transposed ? U[j][i] : U[i][j]);
      }
      x[i] /= U[i][i];
    }
    return x;
  };
  isSquareMatrix = function(A) {
    if (!Array.isArray(A)) {
      return false;
    }
    if (!(A.length > 0)) {
      return false;
    }
    if (A[0].length !== A.length) {
      return false;
    }
    return true;
  };
  isSymmetricMatrix = function(A) {
    var i, j, l, n, o, ref, ref1;
    n = A.length;
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (j = o = 0, ref1 = n; 0 <= ref1 ? o < ref1 : o > ref1; j = 0 <= ref1 ? ++o : --o) {
        if (j !== i && A[i][j] !== A[j][i]) {
          return false;
        }
      }
    }
    return true;
  };
  copy = function(x, map) {
    var fn, i, l, ref, y;
    y = x.constructor.apply(null, [x.length]);
    fn = function() {
      var ref1;
      return y[i] = (ref1 = typeof map === "function" ? map(x[i], i) : void 0) != null ? ref1 : x[i];
    };
    for (i = l = 0, ref = x.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      fn();
    }
    return y;
  };
  reshape = function(rows, cols, typedObject) {
    var l, results;
    return (function() {
      results = [];
      for (var l = 0; 0 <= rows ? l < rows : l > rows; 0 <= rows ? l++ : l--){ results.push(l); }
      return results;
    }).apply(this).map(function() {
      var i, l, ref, y;
      y = typedObject.constructor.apply(null, [cols]);
      for (i = l = 0, ref = cols; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        y[i] = 0;
      }
      return y;
    });
  };
  fold = function(array, width) {
    var A, folder, n, ref;
    if (width == null) {
      width = 1;
    }
    folder = (ref = array.slice) != null ? ref : array.subarray;
    A = (function() {
      var l, ref1, ref2, results;
      results = [];
      for (n = l = 0, ref1 = array.length, ref2 = width; ref2 > 0 ? l < ref1 : l > ref1; n = l += ref2) {
        results.push((function() {
          return folder.apply(array, [n, n + width]);
        })());
      }
      return results;
    })();
    return A;
  };
  flatten = function(matrix) {
    var array, i, j, l, n, o, ref, ref1;
    n = matrix.length;
    array = matrix[0].constructor.apply(null, [n * n]);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (j = o = 0, ref1 = n; 0 <= ref1 ? o < ref1 : o > ref1; j = 0 <= ref1 ? ++o : --o) {
        array[i * n + j] = matrix[i][j];
      }
    }
    return array;
  };
  namespace.luqr = {
    solve: solve,
    solveLU: solveLU,
    solveLDL: solveLDL,
    solveQR: solveQR,
    decomposeLU: decomposeLU,
    decomposeLDL: decomposeLDL,
    decomposeQR: decomposeQR,
    decomposeQRPartial: decomposeQRPartial,
    forwardSubstition: forwardSubstition,
    backwardSubtitution: backwardSubtitution,
    fold: fold,
    flatten: flatten
  };

  return namespace;
});
