"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

// ../../node_modules/.pnpm/retry@0.13.1/node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "../../node_modules/.pnpm/retry@0.13.1/node_modules/retry/lib/retry_operation.js"(exports, module2) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      this._timer = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module2.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts.slice(0);
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (this._timer) {
        clearTimeout(this._timer);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = new Date().getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.push(err);
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(0, this._errors.length - 1);
          timeout = this._cachedTimeouts.slice(-1);
        } else {
          return false;
        }
      }
      var self2 = this;
      this._timer = setTimeout(function() {
        self2._attempts++;
        if (self2._operationTimeoutCb) {
          self2._timeout = setTimeout(function() {
            self2._operationTimeoutCb(self2._attempts);
          }, self2._operationTimeout);
          if (self2._options.unref) {
            self2._timeout.unref();
          }
        }
        self2._fn(self2._attempts);
      }, timeout);
      if (this._options.unref) {
        this._timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self2 = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self2._operationTimeoutCb();
        }, self2._operationTimeout);
      }
      this._operationStart = new Date().getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// ../../node_modules/.pnpm/retry@0.13.1/node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "../../node_modules/.pnpm/retry@0.13.1/node_modules/retry/lib/retry.js"(exports) {
    var RetryOperation = require_retry_operation();
    exports.operation = function(options) {
      var timeouts = exports.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// ../../node_modules/.pnpm/retry@0.13.1/node_modules/retry/index.js
var require_retry2 = __commonJS({
  "../../node_modules/.pnpm/retry@0.13.1/node_modules/retry/index.js"(exports, module2) {
    module2.exports = require_retry();
  }
});

// ../../node_modules/.pnpm/tslib@1.14.1/node_modules/tslib/tslib.js
var require_tslib = __commonJS({
  "../../node_modules/.pnpm/tslib@1.14.1/node_modules/tslib/tslib.js"(exports, module2) {
    var __extends2;
    var __assign2;
    var __rest2;
    var __decorate2;
    var __param2;
    var __metadata2;
    var __awaiter2;
    var __generator2;
    var __exportStar2;
    var __values2;
    var __read2;
    var __spread2;
    var __spreadArrays2;
    var __await2;
    var __asyncGenerator2;
    var __asyncDelegator2;
    var __asyncValues2;
    var __makeTemplateObject2;
    var __importStar2;
    var __importDefault2;
    var __classPrivateFieldGet2;
    var __classPrivateFieldSet2;
    var __createBinding2;
    (function(factory) {
      var root = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof this === "object" ? this : {};
      if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function(exports2) {
          factory(createExporter(root, createExporter(exports2)));
        });
      } else if (typeof module2 === "object" && typeof module2.exports === "object") {
        factory(createExporter(root, createExporter(module2.exports)));
      } else {
        factory(createExporter(root));
      }
      function createExporter(exports2, previous) {
        if (exports2 !== root) {
          if (typeof Object.create === "function") {
            Object.defineProperty(exports2, "__esModule", { value: true });
          } else {
            exports2.__esModule = true;
          }
        }
        return function(id, v) {
          return exports2[id] = previous ? previous(id, v) : v;
        };
      }
    })(function(exporter) {
      var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
      };
      __extends2 = function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      __assign2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      __rest2 = function(s, e2) {
        var t = {};
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
          }
        return t;
      };
      __decorate2 = function(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          r = Reflect.decorate(decorators, target, key, desc);
        else
          for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
              r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
      };
      __param2 = function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      __metadata2 = function(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(metadataKey, metadataValue);
      };
      __awaiter2 = function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e2) {
              reject(e2);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e2) {
              reject(e2);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      __generator2 = function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f)
            throw new TypeError("Generator is already executing.");
          while (_)
            try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                return t;
              if (y = 0, t)
                op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return { value: op[1], done: false };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2])
                    _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e2) {
              op = [6, e2];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5)
            throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      __createBinding2 = function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      };
      __exportStar2 = function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !exports2.hasOwnProperty(p))
            exports2[p] = m[p];
      };
      __values2 = function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
          return m.call(o);
        if (o && typeof o.length === "number")
          return {
            next: function() {
              if (o && i >= o.length)
                o = void 0;
              return { value: o && o[i++], done: !o };
            }
          };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      __read2 = function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
          return o;
        var i = m.call(o), r, ar = [], e2;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
            ar.push(r.value);
        } catch (error) {
          e2 = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"]))
              m.call(i);
          } finally {
            if (e2)
              throw e2.error;
          }
        }
        return ar;
      };
      __spread2 = function() {
        for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read2(arguments[i]));
        return ar;
      };
      __spreadArrays2 = function() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
          s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
        return r;
      };
      __await2 = function(v) {
        return this instanceof __await2 ? (this.v = v, this) : new __await2(v);
      };
      __asyncGenerator2 = function(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;
        function verb(n) {
          if (g[n])
            i[n] = function(v) {
              return new Promise(function(a, b) {
                q.push([n, v, a, b]) > 1 || resume(n, v);
              });
            };
        }
        function resume(n, v) {
          try {
            step(g[n](v));
          } catch (e2) {
            settle(q[0][3], e2);
          }
        }
        function step(r) {
          r.value instanceof __await2 ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
        }
        function fulfill(value) {
          resume("next", value);
        }
        function reject(value) {
          resume("throw", value);
        }
        function settle(f, v) {
          if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]);
        }
      };
      __asyncDelegator2 = function(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function(e2) {
          throw e2;
        }), verb("return"), i[Symbol.iterator] = function() {
          return this;
        }, i;
        function verb(n, f) {
          i[n] = o[n] ? function(v) {
            return (p = !p) ? { value: __await2(o[n](v)), done: n === "return" } : f ? f(v) : v;
          } : f;
        }
      };
      __asyncValues2 = function(o) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values2 === "function" ? __values2(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
          return this;
        }, i);
        function verb(n) {
          i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
              v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
          };
        }
        function settle(resolve, reject, d, v) {
          Promise.resolve(v).then(function(v2) {
            resolve({ value: v2, done: d });
          }, reject);
        }
      };
      __makeTemplateObject2 = function(cooked, raw) {
        if (Object.defineProperty) {
          Object.defineProperty(cooked, "raw", { value: raw });
        } else {
          cooked.raw = raw;
        }
        return cooked;
      };
      __importStar2 = function(mod) {
        if (mod && mod.__esModule)
          return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod)
            if (Object.hasOwnProperty.call(mod, k))
              result[k] = mod[k];
        }
        result["default"] = mod;
        return result;
      };
      __importDefault2 = function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      __classPrivateFieldGet2 = function(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
          throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
      };
      __classPrivateFieldSet2 = function(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
          throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
      };
      exporter("__extends", __extends2);
      exporter("__assign", __assign2);
      exporter("__rest", __rest2);
      exporter("__decorate", __decorate2);
      exporter("__param", __param2);
      exporter("__metadata", __metadata2);
      exporter("__awaiter", __awaiter2);
      exporter("__generator", __generator2);
      exporter("__exportStar", __exportStar2);
      exporter("__createBinding", __createBinding2);
      exporter("__values", __values2);
      exporter("__read", __read2);
      exporter("__spread", __spread2);
      exporter("__spreadArrays", __spreadArrays2);
      exporter("__await", __await2);
      exporter("__asyncGenerator", __asyncGenerator2);
      exporter("__asyncDelegator", __asyncDelegator2);
      exporter("__asyncValues", __asyncValues2);
      exporter("__makeTemplateObject", __makeTemplateObject2);
      exporter("__importStar", __importStar2);
      exporter("__importDefault", __importDefault2);
      exporter("__classPrivateFieldGet", __classPrivateFieldGet2);
      exporter("__classPrivateFieldSet", __classPrivateFieldSet2);
    });
  }
});

// ../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js
var require_cookie = __commonJS({
  "../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js"(exports) {
    "use strict";
    exports.parse = parse2;
    exports.serialize = serialize;
    var __toString = Object.prototype.toString;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse2(str, options) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options || {};
      var dec = opt.decode || decode5;
      var index = 0;
      while (index < str.length) {
        var eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) {
          break;
        }
        var endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = str.length;
        } else if (endIdx < eqIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var key = str.slice(index, eqIdx).trim();
        if (obj[key] === void 0) {
          var val = str.slice(eqIdx + 1, endIdx).trim();
          if (val.charCodeAt(0) === 34) {
            val = val.slice(1, -1);
          }
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      }
      return obj;
    }
    function serialize(name, val, options) {
      var opt = options || {};
      var enc = opt.encode || encode3;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode5(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function encode3(val) {
      return encodeURIComponent(val);
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]" || val instanceof Date;
    }
    function tryDecode(str, decode6) {
      try {
        return decode6(str);
      } catch (e2) {
        return str;
      }
    }
  }
});

// ../../node_modules/.pnpm/stackframe@1.3.4/node_modules/stackframe/stackframe.js
var require_stackframe = __commonJS({
  "../../node_modules/.pnpm/stackframe@1.3.4/node_modules/stackframe/stackframe.js"(exports, module2) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("stackframe", [], factory);
      } else if (typeof exports === "object") {
        module2.exports = factory();
      } else {
        root.StackFrame = factory();
      }
    })(exports, function() {
      "use strict";
      function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
      }
      function _getter(p) {
        return function() {
          return this[p];
        };
      }
      var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"];
      var numericProps = ["columnNumber", "lineNumber"];
      var stringProps = ["fileName", "functionName", "source"];
      var arrayProps = ["args"];
      var objectProps = ["evalOrigin"];
      var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);
      function StackFrame(obj) {
        if (!obj)
          return;
        for (var i2 = 0; i2 < props.length; i2++) {
          if (obj[props[i2]] !== void 0) {
            this["set" + _capitalize(props[i2])](obj[props[i2]]);
          }
        }
      }
      StackFrame.prototype = {
        getArgs: function() {
          return this.args;
        },
        setArgs: function(v) {
          if (Object.prototype.toString.call(v) !== "[object Array]") {
            throw new TypeError("Args must be an Array");
          }
          this.args = v;
        },
        getEvalOrigin: function() {
          return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
          if (v instanceof StackFrame) {
            this.evalOrigin = v;
          } else if (v instanceof Object) {
            this.evalOrigin = new StackFrame(v);
          } else {
            throw new TypeError("Eval Origin must be an Object or StackFrame");
          }
        },
        toString: function() {
          var fileName = this.getFileName() || "";
          var lineNumber = this.getLineNumber() || "";
          var columnNumber = this.getColumnNumber() || "";
          var functionName = this.getFunctionName() || "";
          if (this.getIsEval()) {
            if (fileName) {
              return "[eval] (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
            }
            return "[eval]:" + lineNumber + ":" + columnNumber;
          }
          if (functionName) {
            return functionName + " (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
          }
          return fileName + ":" + lineNumber + ":" + columnNumber;
        }
      };
      StackFrame.fromString = function StackFrame$$fromString(str) {
        var argsStartIndex = str.indexOf("(");
        var argsEndIndex = str.lastIndexOf(")");
        var functionName = str.substring(0, argsStartIndex);
        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(",");
        var locationString = str.substring(argsEndIndex + 1);
        if (locationString.indexOf("@") === 0) {
          var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, "");
          var fileName = parts[1];
          var lineNumber = parts[2];
          var columnNumber = parts[3];
        }
        return new StackFrame({
          functionName,
          args: args || void 0,
          fileName,
          lineNumber: lineNumber || void 0,
          columnNumber: columnNumber || void 0
        });
      };
      for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype["set" + _capitalize(booleanProps[i])] = function(p) {
          return function(v) {
            this[p] = Boolean(v);
          };
        }(booleanProps[i]);
      }
      for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype["set" + _capitalize(numericProps[j])] = function(p) {
          return function(v) {
            if (!_isNumber(v)) {
              throw new TypeError(p + " must be a Number");
            }
            this[p] = Number(v);
          };
        }(numericProps[j]);
      }
      for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype["set" + _capitalize(stringProps[k])] = function(p) {
          return function(v) {
            this[p] = String(v);
          };
        }(stringProps[k]);
      }
      return StackFrame;
    });
  }
});

// ../../node_modules/.pnpm/error-stack-parser@2.1.4/node_modules/error-stack-parser/error-stack-parser.js
var require_error_stack_parser = __commonJS({
  "../../node_modules/.pnpm/error-stack-parser@2.1.4/node_modules/error-stack-parser/error-stack-parser.js"(exports, module2) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("error-stack-parser", ["stackframe"], factory);
      } else if (typeof exports === "object") {
        module2.exports = factory(require_stackframe());
      } else {
        root.ErrorStackParser = factory(root.StackFrame);
      }
    })(exports, function ErrorStackParser(StackFrame) {
      "use strict";
      var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
      var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
      var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
      return {
        parse: function ErrorStackParser$$parse(error) {
          if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
            return this.parseOpera(error);
          } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
            return this.parseV8OrIE(error);
          } else if (error.stack) {
            return this.parseFFOrSafari(error);
          } else {
            throw new Error("Cannot parse given Error object");
          }
        },
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
          if (urlLike.indexOf(":") === -1) {
            return [urlLike];
          }
          var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
          var parts = regExp.exec(urlLike.replace(/[()]/g, ""));
          return [parts[1], parts[2] || void 0, parts[3] || void 0];
        },
        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
          var filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(CHROME_IE_STACK_REGEXP);
          }, this);
          return filtered.map(function(line) {
            if (line.indexOf("(eval ") > -1) {
              line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
            }
            var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
            var location = sanitizedLine.match(/ (\(.+\)$)/);
            sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
            var locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
            var functionName = location && sanitizedLine || void 0;
            var fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
            return new StackFrame({
              functionName,
              fileName,
              lineNumber: locationParts[1],
              columnNumber: locationParts[2],
              source: line
            });
          }, this);
        },
        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
          var filtered = error.stack.split("\n").filter(function(line) {
            return !line.match(SAFARI_NATIVE_CODE_REGEXP);
          }, this);
          return filtered.map(function(line) {
            if (line.indexOf(" > eval") > -1) {
              line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
            }
            if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
              return new StackFrame({
                functionName: line
              });
            } else {
              var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
              var matches = line.match(functionNameRegex);
              var functionName = matches && matches[1] ? matches[1] : void 0;
              var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
              return new StackFrame({
                functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
              });
            }
          }, this);
        },
        parseOpera: function ErrorStackParser$$parseOpera(e2) {
          if (!e2.stacktrace || e2.message.indexOf("\n") > -1 && e2.message.split("\n").length > e2.stacktrace.split("\n").length) {
            return this.parseOpera9(e2);
          } else if (!e2.stack) {
            return this.parseOpera10(e2);
          } else {
            return this.parseOpera11(e2);
          }
        },
        parseOpera9: function ErrorStackParser$$parseOpera9(e2) {
          var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
          var lines = e2.message.split("\n");
          var result = [];
          for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
              result.push(new StackFrame({
                fileName: match[2],
                lineNumber: match[1],
                source: lines[i]
              }));
            }
          }
          return result;
        },
        parseOpera10: function ErrorStackParser$$parseOpera10(e2) {
          var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
          var lines = e2.stacktrace.split("\n");
          var result = [];
          for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
              result.push(new StackFrame({
                functionName: match[3] || void 0,
                fileName: match[2],
                lineNumber: match[1],
                source: lines[i]
              }));
            }
          }
          return result;
        },
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
          var filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
          }, this);
          return filtered.map(function(line) {
            var tokens = line.split("@");
            var locationParts = this.extractLocation(tokens.pop());
            var functionCall = tokens.shift() || "";
            var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
            var argsRaw;
            if (functionCall.match(/\(([^)]*)\)/)) {
              argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
            }
            var args = argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(",");
            return new StackFrame({
              functionName,
              args,
              fileName: locationParts[0],
              lineNumber: locationParts[1],
              columnNumber: locationParts[2],
              source: line
            });
          }, this);
        }
      };
    });
  }
});

// ../../node_modules/.pnpm/stack-generator@2.0.10/node_modules/stack-generator/stack-generator.js
var require_stack_generator = __commonJS({
  "../../node_modules/.pnpm/stack-generator@2.0.10/node_modules/stack-generator/stack-generator.js"(exports, module2) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("stack-generator", ["stackframe"], factory);
      } else if (typeof exports === "object") {
        module2.exports = factory(require_stackframe());
      } else {
        root.StackGenerator = factory(root.StackFrame);
      }
    })(exports, function(StackFrame) {
      return {
        backtrace: function StackGenerator$$backtrace(opts) {
          var stack = [];
          var maxStackSize = 10;
          if (typeof opts === "object" && typeof opts.maxStackSize === "number") {
            maxStackSize = opts.maxStackSize;
          }
          var curr = arguments.callee;
          while (curr && stack.length < maxStackSize && curr["arguments"]) {
            var args = new Array(curr["arguments"].length);
            for (var i = 0; i < args.length; ++i) {
              args[i] = curr["arguments"][i];
            }
            if (/function(?:\s+([\w$]+))+\s*\(/.test(curr.toString())) {
              stack.push(new StackFrame({ functionName: RegExp.$1 || void 0, args }));
            } else {
              stack.push(new StackFrame({ args }));
            }
            try {
              curr = curr.caller;
            } catch (e2) {
              break;
            }
          }
          return stack;
        }
      };
    });
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/util.js
var require_util = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/util.js"(exports) {
    function getArg(aArgs, aName, aDefaultValue) {
      if (aName in aArgs) {
        return aArgs[aName];
      } else if (arguments.length === 3) {
        return aDefaultValue;
      } else {
        throw new Error('"' + aName + '" is a required argument.');
      }
    }
    exports.getArg = getArg;
    var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
    var dataUrlRegexp = /^data:.+\,.+$/;
    function urlParse(aUrl) {
      var match = aUrl.match(urlRegexp);
      if (!match) {
        return null;
      }
      return {
        scheme: match[1],
        auth: match[2],
        host: match[3],
        port: match[4],
        path: match[5]
      };
    }
    exports.urlParse = urlParse;
    function urlGenerate(aParsedUrl) {
      var url = "";
      if (aParsedUrl.scheme) {
        url += aParsedUrl.scheme + ":";
      }
      url += "//";
      if (aParsedUrl.auth) {
        url += aParsedUrl.auth + "@";
      }
      if (aParsedUrl.host) {
        url += aParsedUrl.host;
      }
      if (aParsedUrl.port) {
        url += ":" + aParsedUrl.port;
      }
      if (aParsedUrl.path) {
        url += aParsedUrl.path;
      }
      return url;
    }
    exports.urlGenerate = urlGenerate;
    function normalize2(aPath) {
      var path = aPath;
      var url = urlParse(aPath);
      if (url) {
        if (!url.path) {
          return aPath;
        }
        path = url.path;
      }
      var isAbsolute = exports.isAbsolute(path);
      var parts = path.split(/\/+/);
      for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
        part = parts[i];
        if (part === ".") {
          parts.splice(i, 1);
        } else if (part === "..") {
          up++;
        } else if (up > 0) {
          if (part === "") {
            parts.splice(i + 1, up);
            up = 0;
          } else {
            parts.splice(i, 2);
            up--;
          }
        }
      }
      path = parts.join("/");
      if (path === "") {
        path = isAbsolute ? "/" : ".";
      }
      if (url) {
        url.path = path;
        return urlGenerate(url);
      }
      return path;
    }
    exports.normalize = normalize2;
    function join(aRoot, aPath) {
      if (aRoot === "") {
        aRoot = ".";
      }
      if (aPath === "") {
        aPath = ".";
      }
      var aPathUrl = urlParse(aPath);
      var aRootUrl = urlParse(aRoot);
      if (aRootUrl) {
        aRoot = aRootUrl.path || "/";
      }
      if (aPathUrl && !aPathUrl.scheme) {
        if (aRootUrl) {
          aPathUrl.scheme = aRootUrl.scheme;
        }
        return urlGenerate(aPathUrl);
      }
      if (aPathUrl || aPath.match(dataUrlRegexp)) {
        return aPath;
      }
      if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
        aRootUrl.host = aPath;
        return urlGenerate(aRootUrl);
      }
      var joined = aPath.charAt(0) === "/" ? aPath : normalize2(aRoot.replace(/\/+$/, "") + "/" + aPath);
      if (aRootUrl) {
        aRootUrl.path = joined;
        return urlGenerate(aRootUrl);
      }
      return joined;
    }
    exports.join = join;
    exports.isAbsolute = function(aPath) {
      return aPath.charAt(0) === "/" || !!aPath.match(urlRegexp);
    };
    function relative(aRoot, aPath) {
      if (aRoot === "") {
        aRoot = ".";
      }
      aRoot = aRoot.replace(/\/$/, "");
      var level = 0;
      while (aPath.indexOf(aRoot + "/") !== 0) {
        var index = aRoot.lastIndexOf("/");
        if (index < 0) {
          return aPath;
        }
        aRoot = aRoot.slice(0, index);
        if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
          return aPath;
        }
        ++level;
      }
      return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
    }
    exports.relative = relative;
    var supportsNullProto = function() {
      var obj = /* @__PURE__ */ Object.create(null);
      return !("__proto__" in obj);
    }();
    function identity(s) {
      return s;
    }
    function toSetString(aStr) {
      if (isProtoString(aStr)) {
        return "$" + aStr;
      }
      return aStr;
    }
    exports.toSetString = supportsNullProto ? identity : toSetString;
    function fromSetString(aStr) {
      if (isProtoString(aStr)) {
        return aStr.slice(1);
      }
      return aStr;
    }
    exports.fromSetString = supportsNullProto ? identity : fromSetString;
    function isProtoString(s) {
      if (!s) {
        return false;
      }
      var length2 = s.length;
      if (length2 < 9) {
        return false;
      }
      if (s.charCodeAt(length2 - 1) !== 95 || s.charCodeAt(length2 - 2) !== 95 || s.charCodeAt(length2 - 3) !== 111 || s.charCodeAt(length2 - 4) !== 116 || s.charCodeAt(length2 - 5) !== 111 || s.charCodeAt(length2 - 6) !== 114 || s.charCodeAt(length2 - 7) !== 112 || s.charCodeAt(length2 - 8) !== 95 || s.charCodeAt(length2 - 9) !== 95) {
        return false;
      }
      for (var i = length2 - 10; i >= 0; i--) {
        if (s.charCodeAt(i) !== 36) {
          return false;
        }
      }
      return true;
    }
    function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
      var cmp = mappingA.source - mappingB.source;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0 || onlyCompareOriginal) {
        return cmp;
      }
      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }
      return mappingA.name - mappingB.name;
    }
    exports.compareByOriginalPositions = compareByOriginalPositions;
    function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0 || onlyCompareGenerated) {
        return cmp;
      }
      cmp = mappingA.source - mappingB.source;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }
      return mappingA.name - mappingB.name;
    }
    exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
    function strcmp(aStr1, aStr2) {
      if (aStr1 === aStr2) {
        return 0;
      }
      if (aStr1 > aStr2) {
        return 1;
      }
      return -1;
    }
    function compareByGeneratedPositionsInflated(mappingA, mappingB) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }
      return strcmp(mappingA.name, mappingB.name);
    }
    exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/binary-search.js
var require_binary_search = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/binary-search.js"(exports) {
    exports.GREATEST_LOWER_BOUND = 1;
    exports.LEAST_UPPER_BOUND = 2;
    function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
      var mid = Math.floor((aHigh - aLow) / 2) + aLow;
      var cmp = aCompare(aNeedle, aHaystack[mid], true);
      if (cmp === 0) {
        return mid;
      } else if (cmp > 0) {
        if (aHigh - mid > 1) {
          return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
        }
        if (aBias == exports.LEAST_UPPER_BOUND) {
          return aHigh < aHaystack.length ? aHigh : -1;
        } else {
          return mid;
        }
      } else {
        if (mid - aLow > 1) {
          return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
        }
        if (aBias == exports.LEAST_UPPER_BOUND) {
          return mid;
        } else {
          return aLow < 0 ? -1 : aLow;
        }
      }
    }
    exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
      if (aHaystack.length === 0) {
        return -1;
      }
      var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
      if (index < 0) {
        return -1;
      }
      while (index - 1 >= 0) {
        if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
          break;
        }
        --index;
      }
      return index;
    };
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/array-set.js
var require_array_set = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/array-set.js"(exports) {
    var util = require_util();
    var has = Object.prototype.hasOwnProperty;
    function ArraySet() {
      this._array = [];
      this._set = /* @__PURE__ */ Object.create(null);
    }
    ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
      var set = new ArraySet();
      for (var i = 0, len = aArray.length; i < len; i++) {
        set.add(aArray[i], aAllowDuplicates);
      }
      return set;
    };
    ArraySet.prototype.size = function ArraySet_size() {
      return Object.getOwnPropertyNames(this._set).length;
    };
    ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
      var sStr = util.toSetString(aStr);
      var isDuplicate = has.call(this._set, sStr);
      var idx = this._array.length;
      if (!isDuplicate || aAllowDuplicates) {
        this._array.push(aStr);
      }
      if (!isDuplicate) {
        this._set[sStr] = idx;
      }
    };
    ArraySet.prototype.has = function ArraySet_has(aStr) {
      var sStr = util.toSetString(aStr);
      return has.call(this._set, sStr);
    };
    ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
      var sStr = util.toSetString(aStr);
      if (has.call(this._set, sStr)) {
        return this._set[sStr];
      }
      throw new Error('"' + aStr + '" is not in the set.');
    };
    ArraySet.prototype.at = function ArraySet_at(aIdx) {
      if (aIdx >= 0 && aIdx < this._array.length) {
        return this._array[aIdx];
      }
      throw new Error("No element indexed by " + aIdx);
    };
    ArraySet.prototype.toArray = function ArraySet_toArray() {
      return this._array.slice();
    };
    exports.ArraySet = ArraySet;
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/base64.js
var require_base64 = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/base64.js"(exports) {
    var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    exports.encode = function(number) {
      if (0 <= number && number < intToCharMap.length) {
        return intToCharMap[number];
      }
      throw new TypeError("Must be between 0 and 63: " + number);
    };
    exports.decode = function(charCode) {
      var bigA = 65;
      var bigZ = 90;
      var littleA = 97;
      var littleZ = 122;
      var zero = 48;
      var nine = 57;
      var plus = 43;
      var slash = 47;
      var littleOffset = 26;
      var numberOffset = 52;
      if (bigA <= charCode && charCode <= bigZ) {
        return charCode - bigA;
      }
      if (littleA <= charCode && charCode <= littleZ) {
        return charCode - littleA + littleOffset;
      }
      if (zero <= charCode && charCode <= nine) {
        return charCode - zero + numberOffset;
      }
      if (charCode == plus) {
        return 62;
      }
      if (charCode == slash) {
        return 63;
      }
      return -1;
    };
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/base64-vlq.js
var require_base64_vlq = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/base64-vlq.js"(exports) {
    var base64 = require_base64();
    var VLQ_BASE_SHIFT = 5;
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    var VLQ_BASE_MASK = VLQ_BASE - 1;
    var VLQ_CONTINUATION_BIT = VLQ_BASE;
    function toVLQSigned(aValue) {
      return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
    }
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative ? -shifted : shifted;
    }
    exports.encode = function base64VLQ_encode(aValue) {
      var encoded = "";
      var digit;
      var vlq = toVLQSigned(aValue);
      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base64.encode(digit);
      } while (vlq > 0);
      return encoded;
    };
    exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
      var strLen = aStr.length;
      var result = 0;
      var shift = 0;
      var continuation, digit;
      do {
        if (aIndex >= strLen) {
          throw new Error("Expected more digits in base 64 VLQ value.");
        }
        digit = base64.decode(aStr.charCodeAt(aIndex++));
        if (digit === -1) {
          throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
        }
        continuation = !!(digit & VLQ_CONTINUATION_BIT);
        digit &= VLQ_BASE_MASK;
        result = result + (digit << shift);
        shift += VLQ_BASE_SHIFT;
      } while (continuation);
      aOutParam.value = fromVLQSigned(result);
      aOutParam.rest = aIndex;
    };
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/quick-sort.js
var require_quick_sort = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/quick-sort.js"(exports) {
    function swap(ary, x, y) {
      var temp = ary[x];
      ary[x] = ary[y];
      ary[y] = temp;
    }
    function randomIntInRange(low, high) {
      return Math.round(low + Math.random() * (high - low));
    }
    function doQuickSort(ary, comparator, p, r) {
      if (p < r) {
        var pivotIndex = randomIntInRange(p, r);
        var i = p - 1;
        swap(ary, pivotIndex, r);
        var pivot = ary[r];
        for (var j = p; j < r; j++) {
          if (comparator(ary[j], pivot) <= 0) {
            i += 1;
            swap(ary, i, j);
          }
        }
        swap(ary, i + 1, j);
        var q = i + 1;
        doQuickSort(ary, comparator, p, q - 1);
        doQuickSort(ary, comparator, q + 1, r);
      }
    }
    exports.quickSort = function(ary, comparator) {
      doQuickSort(ary, comparator, 0, ary.length - 1);
    };
  }
});

// ../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/source-map-consumer.js
var require_source_map_consumer = __commonJS({
  "../../node_modules/.pnpm/source-map@0.5.6/node_modules/source-map/lib/source-map-consumer.js"(exports) {
    var util = require_util();
    var binarySearch = require_binary_search();
    var ArraySet = require_array_set().ArraySet;
    var base64VLQ = require_base64_vlq();
    var quickSort = require_quick_sort().quickSort;
    function SourceMapConsumer(aSourceMap) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
      }
      return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap) : new BasicSourceMapConsumer(sourceMap);
    }
    SourceMapConsumer.fromSourceMap = function(aSourceMap) {
      return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
    };
    SourceMapConsumer.prototype._version = 3;
    SourceMapConsumer.prototype.__generatedMappings = null;
    Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
      get: function() {
        if (!this.__generatedMappings) {
          this._parseMappings(this._mappings, this.sourceRoot);
        }
        return this.__generatedMappings;
      }
    });
    SourceMapConsumer.prototype.__originalMappings = null;
    Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
      get: function() {
        if (!this.__originalMappings) {
          this._parseMappings(this._mappings, this.sourceRoot);
        }
        return this.__originalMappings;
      }
    });
    SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
      var c = aStr.charAt(index);
      return c === ";" || c === ",";
    };
    SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      throw new Error("Subclasses must implement _parseMappings");
    };
    SourceMapConsumer.GENERATED_ORDER = 1;
    SourceMapConsumer.ORIGINAL_ORDER = 2;
    SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
    SourceMapConsumer.LEAST_UPPER_BOUND = 2;
    SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
      var mappings;
      switch (order) {
        case SourceMapConsumer.GENERATED_ORDER:
          mappings = this._generatedMappings;
          break;
        case SourceMapConsumer.ORIGINAL_ORDER:
          mappings = this._originalMappings;
          break;
        default:
          throw new Error("Unknown order of iteration.");
      }
      var sourceRoot = this.sourceRoot;
      mappings.map(function(mapping) {
        var source = mapping.source === null ? null : this._sources.at(mapping.source);
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name === null ? null : this._names.at(mapping.name)
        };
      }, this).forEach(aCallback, context);
    };
    SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      var line = util.getArg(aArgs, "line");
      var needle = {
        source: util.getArg(aArgs, "source"),
        originalLine: line,
        originalColumn: util.getArg(aArgs, "column", 0)
      };
      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }
      if (!this._sources.has(needle.source)) {
        return [];
      }
      needle.source = this._sources.indexOf(needle.source);
      var mappings = [];
      var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
      if (index >= 0) {
        var mapping = this._originalMappings[index];
        if (aArgs.column === void 0) {
          var originalLine = mapping.originalLine;
          while (mapping && mapping.originalLine === originalLine) {
            mappings.push({
              line: util.getArg(mapping, "generatedLine", null),
              column: util.getArg(mapping, "generatedColumn", null),
              lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
            });
            mapping = this._originalMappings[++index];
          }
        } else {
          var originalColumn = mapping.originalColumn;
          while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
            mappings.push({
              line: util.getArg(mapping, "generatedLine", null),
              column: util.getArg(mapping, "generatedColumn", null),
              lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
            });
            mapping = this._originalMappings[++index];
          }
        }
      }
      return mappings;
    };
    exports.SourceMapConsumer = SourceMapConsumer;
    function BasicSourceMapConsumer(aSourceMap) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
      }
      var version2 = util.getArg(sourceMap, "version");
      var sources = util.getArg(sourceMap, "sources");
      var names = util.getArg(sourceMap, "names", []);
      var sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
      var sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
      var mappings = util.getArg(sourceMap, "mappings");
      var file = util.getArg(sourceMap, "file", null);
      if (version2 != this._version) {
        throw new Error("Unsupported version: " + version2);
      }
      sources = sources.map(String).map(util.normalize).map(function(source) {
        return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
      });
      this._names = ArraySet.fromArray(names.map(String), true);
      this._sources = ArraySet.fromArray(sources, true);
      this.sourceRoot = sourceRoot;
      this.sourcesContent = sourcesContent;
      this._mappings = mappings;
      this.file = file;
    }
    BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
    BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
    BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(BasicSourceMapConsumer.prototype);
      var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
      smc.file = aSourceMap._file;
      var generatedMappings = aSourceMap._mappings.toArray().slice();
      var destGeneratedMappings = smc.__generatedMappings = [];
      var destOriginalMappings = smc.__originalMappings = [];
      for (var i = 0, length2 = generatedMappings.length; i < length2; i++) {
        var srcMapping = generatedMappings[i];
        var destMapping = new Mapping();
        destMapping.generatedLine = srcMapping.generatedLine;
        destMapping.generatedColumn = srcMapping.generatedColumn;
        if (srcMapping.source) {
          destMapping.source = sources.indexOf(srcMapping.source);
          destMapping.originalLine = srcMapping.originalLine;
          destMapping.originalColumn = srcMapping.originalColumn;
          if (srcMapping.name) {
            destMapping.name = names.indexOf(srcMapping.name);
          }
          destOriginalMappings.push(destMapping);
        }
        destGeneratedMappings.push(destMapping);
      }
      quickSort(smc.__originalMappings, util.compareByOriginalPositions);
      return smc;
    };
    BasicSourceMapConsumer.prototype._version = 3;
    Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
      get: function() {
        return this._sources.toArray().map(function(s) {
          return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
        }, this);
      }
    });
    function Mapping() {
      this.generatedLine = 0;
      this.generatedColumn = 0;
      this.source = null;
      this.originalLine = null;
      this.originalColumn = null;
      this.name = null;
    }
    BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var length2 = aStr.length;
      var index = 0;
      var cachedSegments = {};
      var temp = {};
      var originalMappings = [];
      var generatedMappings = [];
      var mapping, str, segment, end, value;
      while (index < length2) {
        if (aStr.charAt(index) === ";") {
          generatedLine++;
          index++;
          previousGeneratedColumn = 0;
        } else if (aStr.charAt(index) === ",") {
          index++;
        } else {
          mapping = new Mapping();
          mapping.generatedLine = generatedLine;
          for (end = index; end < length2; end++) {
            if (this._charIsMappingSeparator(aStr, end)) {
              break;
            }
          }
          str = aStr.slice(index, end);
          segment = cachedSegments[str];
          if (segment) {
            index += str.length;
          } else {
            segment = [];
            while (index < end) {
              base64VLQ.decode(aStr, index, temp);
              value = temp.value;
              index = temp.rest;
              segment.push(value);
            }
            if (segment.length === 2) {
              throw new Error("Found a source, but no line and column");
            }
            if (segment.length === 3) {
              throw new Error("Found a source and line, but no column");
            }
            cachedSegments[str] = segment;
          }
          mapping.generatedColumn = previousGeneratedColumn + segment[0];
          previousGeneratedColumn = mapping.generatedColumn;
          if (segment.length > 1) {
            mapping.source = previousSource + segment[1];
            previousSource += segment[1];
            mapping.originalLine = previousOriginalLine + segment[2];
            previousOriginalLine = mapping.originalLine;
            mapping.originalLine += 1;
            mapping.originalColumn = previousOriginalColumn + segment[3];
            previousOriginalColumn = mapping.originalColumn;
            if (segment.length > 4) {
              mapping.name = previousName + segment[4];
              previousName += segment[4];
            }
          }
          generatedMappings.push(mapping);
          if (typeof mapping.originalLine === "number") {
            originalMappings.push(mapping);
          }
        }
      }
      quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
      this.__generatedMappings = generatedMappings;
      quickSort(originalMappings, util.compareByOriginalPositions);
      this.__originalMappings = originalMappings;
    };
    BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
      if (aNeedle[aLineName] <= 0) {
        throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
      }
      return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
    };
    BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];
          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }
        mapping.lastGeneratedColumn = Infinity;
      }
    };
    BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, "line"),
        generatedColumn: util.getArg(aArgs, "column")
      };
      var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
      if (index >= 0) {
        var mapping = this._generatedMappings[index];
        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, "source", null);
          if (source !== null) {
            source = this._sources.at(source);
            if (this.sourceRoot != null) {
              source = util.join(this.sourceRoot, source);
            }
          }
          var name = util.getArg(mapping, "name", null);
          if (name !== null) {
            name = this._names.at(name);
          }
          return {
            source,
            line: util.getArg(mapping, "originalLine", null),
            column: util.getArg(mapping, "originalColumn", null),
            name
          };
        }
      }
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };
    BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
      if (!this.sourcesContent) {
        return false;
      }
      return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
        return sc == null;
      });
    };
    BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
      if (!this.sourcesContent) {
        return null;
      }
      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }
      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }
      var url;
      if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
        }
        if ((!url.path || url.path == "/") && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }
      if (nullOnMissing) {
        return null;
      } else {
        throw new Error('"' + aSource + '" is not in the SourceMap.');
      }
    };
    BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
      var source = util.getArg(aArgs, "source");
      if (this.sourceRoot != null) {
        source = util.relative(this.sourceRoot, source);
      }
      if (!this._sources.has(source)) {
        return {
          line: null,
          column: null,
          lastColumn: null
        };
      }
      source = this._sources.indexOf(source);
      var needle = {
        source,
        originalLine: util.getArg(aArgs, "line"),
        originalColumn: util.getArg(aArgs, "column")
      };
      var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
      if (index >= 0) {
        var mapping = this._originalMappings[index];
        if (mapping.source === needle.source) {
          return {
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
          };
        }
      }
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };
    exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
    function IndexedSourceMapConsumer(aSourceMap) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
      }
      var version2 = util.getArg(sourceMap, "version");
      var sections = util.getArg(sourceMap, "sections");
      if (version2 != this._version) {
        throw new Error("Unsupported version: " + version2);
      }
      this._sources = new ArraySet();
      this._names = new ArraySet();
      var lastOffset = {
        line: -1,
        column: 0
      };
      this._sections = sections.map(function(s) {
        if (s.url) {
          throw new Error("Support for url field in sections not implemented.");
        }
        var offset = util.getArg(s, "offset");
        var offsetLine = util.getArg(offset, "line");
        var offsetColumn = util.getArg(offset, "column");
        if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
          throw new Error("Section offsets must be ordered and non-overlapping.");
        }
        lastOffset = offset;
        return {
          generatedOffset: {
            generatedLine: offsetLine + 1,
            generatedColumn: offsetColumn + 1
          },
          consumer: new SourceMapConsumer(util.getArg(s, "map"))
        };
      });
    }
    IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
    IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
    IndexedSourceMapConsumer.prototype._version = 3;
    Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
      get: function() {
        var sources = [];
        for (var i = 0; i < this._sections.length; i++) {
          for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
            sources.push(this._sections[i].consumer.sources[j]);
          }
        }
        return sources;
      }
    });
    IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, "line"),
        generatedColumn: util.getArg(aArgs, "column")
      };
      var sectionIndex = binarySearch.search(needle, this._sections, function(needle2, section2) {
        var cmp = needle2.generatedLine - section2.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }
        return needle2.generatedColumn - section2.generatedOffset.generatedColumn;
      });
      var section = this._sections[sectionIndex];
      if (!section) {
        return {
          source: null,
          line: null,
          column: null,
          name: null
        };
      }
      return section.consumer.originalPositionFor({
        line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
        column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
        bias: aArgs.bias
      });
    };
    IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
      return this._sections.every(function(s) {
        return s.consumer.hasContentsOfAllSources();
      });
    };
    IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
      for (var i = 0; i < this._sections.length; i++) {
        var section = this._sections[i];
        var content = section.consumer.sourceContentFor(aSource, true);
        if (content) {
          return content;
        }
      }
      if (nullOnMissing) {
        return null;
      } else {
        throw new Error('"' + aSource + '" is not in the SourceMap.');
      }
    };
    IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
      for (var i = 0; i < this._sections.length; i++) {
        var section = this._sections[i];
        if (section.consumer.sources.indexOf(util.getArg(aArgs, "source")) === -1) {
          continue;
        }
        var generatedPosition = section.consumer.generatedPositionFor(aArgs);
        if (generatedPosition) {
          var ret = {
            line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
            column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
          };
          return ret;
        }
      }
      return {
        line: null,
        column: null
      };
    };
    IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      this.__generatedMappings = [];
      this.__originalMappings = [];
      for (var i = 0; i < this._sections.length; i++) {
        var section = this._sections[i];
        var sectionMappings = section.consumer._generatedMappings;
        for (var j = 0; j < sectionMappings.length; j++) {
          var mapping = sectionMappings[j];
          var source = section.consumer._sources.at(mapping.source);
          if (section.consumer.sourceRoot !== null) {
            source = util.join(section.consumer.sourceRoot, source);
          }
          this._sources.add(source);
          source = this._sources.indexOf(source);
          var name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
          var adjustedMapping = {
            source,
            generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
            generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
            originalLine: mapping.originalLine,
            originalColumn: mapping.originalColumn,
            name
          };
          this.__generatedMappings.push(adjustedMapping);
          if (typeof adjustedMapping.originalLine === "number") {
            this.__originalMappings.push(adjustedMapping);
          }
        }
      }
      quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
      quickSort(this.__originalMappings, util.compareByOriginalPositions);
    };
    exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
  }
});

// ../../node_modules/.pnpm/stacktrace-gps@3.1.2/node_modules/stacktrace-gps/stacktrace-gps.js
var require_stacktrace_gps = __commonJS({
  "../../node_modules/.pnpm/stacktrace-gps@3.1.2/node_modules/stacktrace-gps/stacktrace-gps.js"(exports, module2) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("stacktrace-gps", ["source-map", "stackframe"], factory);
      } else if (typeof exports === "object") {
        module2.exports = factory(require_source_map_consumer(), require_stackframe());
      } else {
        root.StackTraceGPS = factory(root.SourceMap || root.sourceMap, root.StackFrame);
      }
    })(exports, function(SourceMap, StackFrame) {
      "use strict";
      function _xdr(url) {
        return new Promise(function(resolve, reject) {
          var req = new XMLHttpRequest();
          req.open("get", url);
          req.onerror = reject;
          req.onreadystatechange = function onreadystatechange() {
            if (req.readyState === 4) {
              if (req.status >= 200 && req.status < 300 || url.substr(0, 7) === "file://" && req.responseText) {
                resolve(req.responseText);
              } else {
                reject(new Error("HTTP status: " + req.status + " retrieving " + url));
              }
            }
          };
          req.send();
        });
      }
      function _atob(b64str) {
        if (typeof window !== "undefined" && window.atob) {
          return window.atob(b64str);
        } else {
          throw new Error("You must supply a polyfill for window.atob in this environment");
        }
      }
      function _parseJson(string) {
        if (typeof JSON !== "undefined" && JSON.parse) {
          return JSON.parse(string);
        } else {
          throw new Error("You must supply a polyfill for JSON.parse in this environment");
        }
      }
      function _findFunctionName(source, lineNumber) {
        var syntaxes = [
          /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/,
          /function\s+([^('"`]*?)\s*\(([^)]*)\)/,
          /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/,
          /\b(?!(?:if|for|switch|while|with|catch)\b)(?:(?:static)\s+)?(\S+)\s*\(.*?\)\s*\{/,
          /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*\(.*?\)\s*=>/
        ];
        var lines = source.split("\n");
        var code = "";
        var maxLines = Math.min(lineNumber, 20);
        for (var i = 0; i < maxLines; ++i) {
          var line = lines[lineNumber - i - 1];
          var commentPos = line.indexOf("//");
          if (commentPos >= 0) {
            line = line.substr(0, commentPos);
          }
          if (line) {
            code = line + code;
            var len = syntaxes.length;
            for (var index = 0; index < len; index++) {
              var m = syntaxes[index].exec(code);
              if (m && m[1]) {
                return m[1];
              }
            }
          }
        }
        return void 0;
      }
      function _ensureSupportedEnvironment() {
        if (typeof Object.defineProperty !== "function" || typeof Object.create !== "function") {
          throw new Error("Unable to consume source maps in older browsers");
        }
      }
      function _ensureStackFrameIsLegit(stackframe) {
        if (typeof stackframe !== "object") {
          throw new TypeError("Given StackFrame is not an object");
        } else if (typeof stackframe.fileName !== "string") {
          throw new TypeError("Given file name is not a String");
        } else if (typeof stackframe.lineNumber !== "number" || stackframe.lineNumber % 1 !== 0 || stackframe.lineNumber < 1) {
          throw new TypeError("Given line number must be a positive integer");
        } else if (typeof stackframe.columnNumber !== "number" || stackframe.columnNumber % 1 !== 0 || stackframe.columnNumber < 0) {
          throw new TypeError("Given column number must be a non-negative integer");
        }
        return true;
      }
      function _findSourceMappingURL(source) {
        var sourceMappingUrlRegExp = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/mg;
        var lastSourceMappingUrl;
        var matchSourceMappingUrl;
        while (matchSourceMappingUrl = sourceMappingUrlRegExp.exec(source)) {
          lastSourceMappingUrl = matchSourceMappingUrl[1];
        }
        if (lastSourceMappingUrl) {
          return lastSourceMappingUrl;
        } else {
          throw new Error("sourceMappingURL not found");
        }
      }
      function _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache) {
        return new Promise(function(resolve, reject) {
          var loc = sourceMapConsumer.originalPositionFor({
            line: stackframe.lineNumber,
            column: stackframe.columnNumber
          });
          if (loc.source) {
            var mappedSource = sourceMapConsumer.sourceContentFor(loc.source);
            if (mappedSource) {
              sourceCache[loc.source] = mappedSource;
            }
            resolve(new StackFrame({
              functionName: loc.name || stackframe.functionName,
              args: stackframe.args,
              fileName: loc.source,
              lineNumber: loc.line,
              columnNumber: loc.column
            }));
          } else {
            reject(new Error("Could not get original source for given stackframe and source map"));
          }
        });
      }
      return function StackTraceGPS(opts) {
        if (!(this instanceof StackTraceGPS)) {
          return new StackTraceGPS(opts);
        }
        opts = opts || {};
        this.sourceCache = opts.sourceCache || {};
        this.sourceMapConsumerCache = opts.sourceMapConsumerCache || {};
        this.ajax = opts.ajax || _xdr;
        this._atob = opts.atob || _atob;
        this._get = function _get(location) {
          return new Promise(function(resolve, reject) {
            var isDataUrl = location.substr(0, 5) === "data:";
            if (this.sourceCache[location]) {
              resolve(this.sourceCache[location]);
            } else if (opts.offline && !isDataUrl) {
              reject(new Error("Cannot make network requests in offline mode"));
            } else {
              if (isDataUrl) {
                var supportedEncodingRegexp = /^data:application\/json;([\w=:"-]+;)*base64,/;
                var match = location.match(supportedEncodingRegexp);
                if (match) {
                  var sourceMapStart = match[0].length;
                  var encodedSource = location.substr(sourceMapStart);
                  var source = this._atob(encodedSource);
                  this.sourceCache[location] = source;
                  resolve(source);
                } else {
                  reject(new Error("The encoding of the inline sourcemap is not supported"));
                }
              } else {
                var xhrPromise = this.ajax(location, { method: "get" });
                this.sourceCache[location] = xhrPromise;
                xhrPromise.then(resolve, reject);
              }
            }
          }.bind(this));
        };
        this._getSourceMapConsumer = function _getSourceMapConsumer(sourceMappingURL, defaultSourceRoot) {
          return new Promise(function(resolve) {
            if (this.sourceMapConsumerCache[sourceMappingURL]) {
              resolve(this.sourceMapConsumerCache[sourceMappingURL]);
            } else {
              var sourceMapConsumerPromise = new Promise(function(resolve2, reject) {
                return this._get(sourceMappingURL).then(function(sourceMapSource) {
                  if (typeof sourceMapSource === "string") {
                    sourceMapSource = _parseJson(sourceMapSource.replace(/^\)\]\}'/, ""));
                  }
                  if (typeof sourceMapSource.sourceRoot === "undefined") {
                    sourceMapSource.sourceRoot = defaultSourceRoot;
                  }
                  resolve2(new SourceMap.SourceMapConsumer(sourceMapSource));
                }).catch(reject);
              }.bind(this));
              this.sourceMapConsumerCache[sourceMappingURL] = sourceMapConsumerPromise;
              resolve(sourceMapConsumerPromise);
            }
          }.bind(this));
        };
        this.pinpoint = function StackTraceGPS$$pinpoint(stackframe) {
          return new Promise(function(resolve, reject) {
            this.getMappedLocation(stackframe).then(function(mappedStackFrame) {
              function resolveMappedStackFrame() {
                resolve(mappedStackFrame);
              }
              this.findFunctionName(mappedStackFrame).then(resolve, resolveMappedStackFrame)["catch"](resolveMappedStackFrame);
            }.bind(this), reject);
          }.bind(this));
        };
        this.findFunctionName = function StackTraceGPS$$findFunctionName(stackframe) {
          return new Promise(function(resolve, reject) {
            _ensureStackFrameIsLegit(stackframe);
            this._get(stackframe.fileName).then(function getSourceCallback(source) {
              var lineNumber = stackframe.lineNumber;
              var columnNumber = stackframe.columnNumber;
              var guessedFunctionName = _findFunctionName(source, lineNumber, columnNumber);
              if (guessedFunctionName) {
                resolve(new StackFrame({
                  functionName: guessedFunctionName,
                  args: stackframe.args,
                  fileName: stackframe.fileName,
                  lineNumber,
                  columnNumber
                }));
              } else {
                resolve(stackframe);
              }
            }, reject)["catch"](reject);
          }.bind(this));
        };
        this.getMappedLocation = function StackTraceGPS$$getMappedLocation(stackframe) {
          return new Promise(function(resolve, reject) {
            _ensureSupportedEnvironment();
            _ensureStackFrameIsLegit(stackframe);
            var sourceCache = this.sourceCache;
            var fileName = stackframe.fileName;
            this._get(fileName).then(function(source) {
              var sourceMappingURL = _findSourceMappingURL(source);
              var isDataUrl = sourceMappingURL.substr(0, 5) === "data:";
              var defaultSourceRoot = fileName.substring(0, fileName.lastIndexOf("/") + 1);
              if (sourceMappingURL[0] !== "/" && !isDataUrl && !/^https?:\/\/|^\/\//i.test(sourceMappingURL)) {
                sourceMappingURL = defaultSourceRoot + sourceMappingURL;
              }
              return this._getSourceMapConsumer(sourceMappingURL, defaultSourceRoot).then(function(sourceMapConsumer) {
                return _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache).then(resolve)["catch"](function() {
                  resolve(stackframe);
                });
              });
            }.bind(this), reject)["catch"](reject);
          }.bind(this));
        };
      };
    });
  }
});

// ../../node_modules/.pnpm/stacktrace-js@2.0.2/node_modules/stacktrace-js/stacktrace.js
var require_stacktrace = __commonJS({
  "../../node_modules/.pnpm/stacktrace-js@2.0.2/node_modules/stacktrace-js/stacktrace.js"(exports, module2) {
    (function(root, factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define("stacktrace", ["error-stack-parser", "stack-generator", "stacktrace-gps"], factory);
      } else if (typeof exports === "object") {
        module2.exports = factory(require_error_stack_parser(), require_stack_generator(), require_stacktrace_gps());
      } else {
        root.StackTrace = factory(root.ErrorStackParser, root.StackGenerator, root.StackTraceGPS);
      }
    })(exports, function StackTrace(ErrorStackParser, StackGenerator, StackTraceGPS) {
      var _options = {
        filter: function(stackframe) {
          return (stackframe.functionName || "").indexOf("StackTrace$$") === -1 && (stackframe.functionName || "").indexOf("ErrorStackParser$$") === -1 && (stackframe.functionName || "").indexOf("StackTraceGPS$$") === -1 && (stackframe.functionName || "").indexOf("StackGenerator$$") === -1;
        },
        sourceCache: {}
      };
      var _generateError = function StackTrace$$GenerateError() {
        try {
          throw new Error();
        } catch (err) {
          return err;
        }
      };
      function _merge(first, second) {
        var target = {};
        [first, second].forEach(function(obj) {
          for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              target[prop] = obj[prop];
            }
          }
          return target;
        });
        return target;
      }
      function _isShapedLikeParsableError(err) {
        return err.stack || err["opera#sourceloc"];
      }
      function _filtered(stackframes, filter) {
        if (typeof filter === "function") {
          return stackframes.filter(filter);
        }
        return stackframes;
      }
      return {
        get: function StackTrace$$get(opts) {
          var err = _generateError();
          return _isShapedLikeParsableError(err) ? this.fromError(err, opts) : this.generateArtificially(opts);
        },
        getSync: function StackTrace$$getSync(opts) {
          opts = _merge(_options, opts);
          var err = _generateError();
          var stack = _isShapedLikeParsableError(err) ? ErrorStackParser.parse(err) : StackGenerator.backtrace(opts);
          return _filtered(stack, opts.filter);
        },
        fromError: function StackTrace$$fromError(error, opts) {
          opts = _merge(_options, opts);
          var gps = new StackTraceGPS(opts);
          return new Promise(function(resolve) {
            var stackframes = _filtered(ErrorStackParser.parse(error), opts.filter);
            resolve(Promise.all(stackframes.map(function(sf) {
              return new Promise(function(resolve2) {
                function resolveOriginal() {
                  resolve2(sf);
                }
                gps.pinpoint(sf).then(resolve2, resolveOriginal)["catch"](resolveOriginal);
              });
            })));
          }.bind(this));
        },
        generateArtificially: function StackTrace$$generateArtificially(opts) {
          opts = _merge(_options, opts);
          var stackFrames = StackGenerator.backtrace(opts);
          if (typeof opts.filter === "function") {
            stackFrames = stackFrames.filter(opts.filter);
          }
          return Promise.resolve(stackFrames);
        },
        instrument: function StackTrace$$instrument(fn, callback, errback, thisArg) {
          if (typeof fn !== "function") {
            throw new Error("Cannot instrument non-function object");
          } else if (typeof fn.__stacktraceOriginalFn === "function") {
            return fn;
          }
          var instrumented = function StackTrace$$instrumented() {
            try {
              this.get().then(callback, errback)["catch"](errback);
              return fn.apply(thisArg || this, arguments);
            } catch (e2) {
              if (_isShapedLikeParsableError(e2)) {
                this.fromError(e2).then(callback, errback)["catch"](errback);
              }
              throw e2;
            }
          }.bind(this);
          instrumented.__stacktraceOriginalFn = fn;
          return instrumented;
        },
        deinstrument: function StackTrace$$deinstrument(fn) {
          if (typeof fn !== "function") {
            throw new Error("Cannot de-instrument non-function object");
          } else if (typeof fn.__stacktraceOriginalFn === "function") {
            return fn.__stacktraceOriginalFn;
          } else {
            return fn;
          }
        },
        report: function StackTrace$$report(stackframes, url, errorMsg, requestOptions) {
          return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.onerror = reject;
            req.onreadystatechange = function onreadystatechange() {
              if (req.readyState === 4) {
                if (req.status >= 200 && req.status < 400) {
                  resolve(req.responseText);
                } else {
                  reject(new Error("POST to " + url + " failed with status: " + req.status));
                }
              }
            };
            req.open("post", url);
            req.setRequestHeader("Content-Type", "application/json");
            if (requestOptions && typeof requestOptions.headers === "object") {
              var headers = requestOptions.headers;
              for (var header in headers) {
                if (Object.prototype.hasOwnProperty.call(headers, header)) {
                  req.setRequestHeader(header, headers[header]);
                }
              }
            }
            var reportPayload = { stack: stackframes };
            if (errorMsg !== void 0 && errorMsg !== null) {
              reportPayload.message = errorMsg;
            }
            req.send(JSON.stringify(reportPayload));
          });
        }
      };
    });
  }
});

// ../../node_modules/.pnpm/itty-router@2.6.1/node_modules/itty-router/dist/itty-router.min.mjs
function e({ base: t = "", routes: n = [] } = {}) {
  return { __proto__: new Proxy({}, { get: (e2, a, o) => (e3, ...r) => n.push([a.toUpperCase(), RegExp(`^${(t + e3).replace(/(\/?)\*/g, "($1.*)?").replace(/\/$/, "").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/, "\\.").replace(/\)\.\?\(([^\[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.")}/*$`), r]) && o }), routes: n, async handle(e2, ...r) {
    let a, o, t2 = new URL(e2.url);
    e2.query = Object.fromEntries(t2.searchParams);
    for (var [p, s, u] of n)
      if ((p === e2.method || p === "ALL") && (o = t2.pathname.match(s))) {
        e2.params = o.groups;
        for (var c of u)
          if ((a = await c(e2.proxy || e2, ...r)) !== void 0)
            return a;
      }
  } };
}

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/vendor/varint.js
var encode_1 = encode;
var MSB = 128;
var REST = 127;
var MSBALL = ~REST;
var INT = Math.pow(2, 31);
function encode(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;
  while (num >= INT) {
    out[offset++] = num & 255 | MSB;
    num /= 128;
  }
  while (num & MSBALL) {
    out[offset++] = num & 255 | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;
  encode.bytes = offset - oldOffset + 1;
  return out;
}
var decode = read;
var MSB$1 = 128;
var REST$1 = 127;
function read(buf, offset) {
  var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError("Could not decode varint");
    }
    b = buf[counter++];
    res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1);
  read.bytes = counter - offset;
  return res;
}
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var length = function(value) {
  return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
};
var varint = {
  encode: encode_1,
  decode,
  encodingLength: length
};
var _brrp_varint = varint;
var varint_default = _brrp_varint;

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/varint.js
var decode2 = (data) => {
  const code = varint_default.decode(data);
  return [
    code,
    varint_default.decode.bytes
  ];
};
var encodeTo = (int, target, offset = 0) => {
  varint_default.encode(int, target, offset);
  return target;
};
var encodingLength = (int) => {
  return varint_default.encodingLength(int);
};

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/bytes.js
var empty = new Uint8Array(0);
var equals = (aa, bb) => {
  if (aa === bb)
    return true;
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }
  return true;
};
var coerce = (o) => {
  if (o instanceof Uint8Array && o.constructor.name === "Uint8Array")
    return o;
  if (o instanceof ArrayBuffer)
    return new Uint8Array(o);
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error("Unknown type, must be binary type");
};

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/hashes/digest.js
var create = (code, digest) => {
  const size = digest.byteLength;
  const sizeOffset = encodingLength(code);
  const digestOffset = sizeOffset + encodingLength(size);
  const bytes = new Uint8Array(digestOffset + size);
  encodeTo(code, bytes, 0);
  encodeTo(size, bytes, sizeOffset);
  bytes.set(digest, digestOffset);
  return new Digest(code, size, digest, bytes);
};
var decode3 = (multihash) => {
  const bytes = coerce(multihash);
  const [code, sizeOffset] = decode2(bytes);
  const [size, digestOffset] = decode2(bytes.subarray(sizeOffset));
  const digest = bytes.subarray(sizeOffset + digestOffset);
  if (digest.byteLength !== size) {
    throw new Error("Incorrect length");
  }
  return new Digest(code, size, digest, bytes);
};
var equals2 = (a, b) => {
  if (a === b) {
    return true;
  } else {
    return a.code === b.code && a.size === b.size && equals(a.bytes, b.bytes);
  }
};
var Digest = class {
  constructor(code, size, digest, bytes) {
    this.code = code;
    this.size = size;
    this.digest = digest;
    this.bytes = bytes;
  }
};

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/vendor/base-x.js
function base(ALPHABET, name) {
  if (ALPHABET.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256);
  var iFACTOR = Math.log(256) / Math.log(BASE);
  function encode3(source) {
    if (source instanceof Uint8Array)
      ;
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    var zeroes = 0;
    var length2 = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    var b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      var carry = source[pbegin];
      var i2 = 0;
      for (var it1 = size - 1; (carry !== 0 || i2 < length2) && it1 !== -1; it1--, i2++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length2 = i2;
      pbegin++;
    }
    var it2 = size - length2;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    if (source[psz] === " ") {
      return;
    }
    var zeroes = 0;
    var length2 = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    var size = (source.length - psz) * FACTOR + 1 >>> 0;
    var b256 = new Uint8Array(size);
    while (source[psz]) {
      var carry = BASE_MAP[source.charCodeAt(psz)];
      if (carry === 255) {
        return;
      }
      var i2 = 0;
      for (var it3 = size - 1; (carry !== 0 || i2 < length2) && it3 !== -1; it3--, i2++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length2 = i2;
      psz++;
    }
    if (source[psz] === " ") {
      return;
    }
    var it4 = size - length2;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j2 = zeroes;
    while (it4 !== size) {
      vch[j2++] = b256[it4++];
    }
    return vch;
  }
  function decode5(string) {
    var buffer = decodeUnsafe(string);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${name} character`);
  }
  return {
    encode: encode3,
    decodeUnsafe,
    decode: decode5
  };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;
var base_x_default = _brrp__multiformats_scope_baseX;

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/bases/base.js
var Encoder = class {
  constructor(name, prefix, baseEncode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }
  encode(bytes) {
    if (bytes instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes)}`;
    } else {
      throw Error("Unknown type, must be binary type");
    }
  }
};
var Decoder = class {
  constructor(name, prefix, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    if (prefix.codePointAt(0) === void 0) {
      throw new Error("Invalid prefix character");
    }
    this.prefixCodePoint = prefix.codePointAt(0);
    this.baseDecode = baseDecode;
  }
  decode(text) {
    if (typeof text === "string") {
      if (text.codePointAt(0) !== this.prefixCodePoint) {
        throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
      }
      return this.baseDecode(text.slice(this.prefix.length));
    } else {
      throw Error("Can only multibase decode strings");
    }
  }
  or(decoder) {
    return or(this, decoder);
  }
};
var ComposedDecoder = class {
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder) {
    return or(this, decoder);
  }
  decode(input) {
    const prefix = input[0];
    const decoder = this.decoders[prefix];
    if (decoder) {
      return decoder.decode(input);
    } else {
      throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
  }
};
var or = (left, right) => new ComposedDecoder({
  ...left.decoders || { [left.prefix]: left },
  ...right.decoders || { [right.prefix]: right }
});
var Codec = class {
  constructor(name, prefix, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name, prefix, baseEncode);
    this.decoder = new Decoder(name, prefix, baseDecode);
  }
  encode(input) {
    return this.encoder.encode(input);
  }
  decode(input) {
    return this.decoder.decode(input);
  }
};
var from = ({ name, prefix, encode: encode3, decode: decode5 }) => new Codec(name, prefix, encode3, decode5);
var baseX = ({ prefix, name, alphabet }) => {
  const { encode: encode3, decode: decode5 } = base_x_default(alphabet, name);
  return from({
    prefix,
    name,
    encode: encode3,
    decode: (text) => coerce(decode5(text))
  });
};
var decode4 = (string, alphabet, bitsPerChar, name) => {
  const codes = {};
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i;
  }
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = codes[string[i]];
    if (value === void 0) {
      throw new SyntaxError(`Non-${name} character`);
    }
    buffer = buffer << bitsPerChar | value;
    bits += bitsPerChar;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= bitsPerChar || 255 & buffer << 8 - bits) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
};
var encode2 = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === "=";
  const mask = (1 << bitsPerChar) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | data[i];
    bits += 8;
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & buffer >> bits];
    }
  }
  if (bits) {
    out += alphabet[mask & buffer << bitsPerChar - bits];
  }
  if (pad) {
    while (out.length * bitsPerChar & 7) {
      out += "=";
    }
  }
  return out;
};
var rfc4648 = ({ name, prefix, bitsPerChar, alphabet }) => {
  return from({
    prefix,
    name,
    encode(input) {
      return encode2(input, alphabet, bitsPerChar);
    },
    decode(input) {
      return decode4(input, alphabet, bitsPerChar, name);
    }
  });
};

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/bases/base58.js
var base58btc = baseX({
  name: "base58btc",
  prefix: "z",
  alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
var base58flickr = baseX({
  name: "base58flickr",
  prefix: "Z",
  alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/bases/base32.js
var base32 = rfc4648({
  prefix: "b",
  name: "base32",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567",
  bitsPerChar: 5
});
var base32upper = rfc4648({
  prefix: "B",
  name: "base32upper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  bitsPerChar: 5
});
var base32pad = rfc4648({
  prefix: "c",
  name: "base32pad",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
  bitsPerChar: 5
});
var base32padupper = rfc4648({
  prefix: "C",
  name: "base32padupper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
  bitsPerChar: 5
});
var base32hex = rfc4648({
  prefix: "v",
  name: "base32hex",
  alphabet: "0123456789abcdefghijklmnopqrstuv",
  bitsPerChar: 5
});
var base32hexupper = rfc4648({
  prefix: "V",
  name: "base32hexupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
  bitsPerChar: 5
});
var base32hexpad = rfc4648({
  prefix: "t",
  name: "base32hexpad",
  alphabet: "0123456789abcdefghijklmnopqrstuv=",
  bitsPerChar: 5
});
var base32hexpadupper = rfc4648({
  prefix: "T",
  name: "base32hexpadupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
  bitsPerChar: 5
});
var base32z = rfc4648({
  prefix: "h",
  name: "base32z",
  alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
  bitsPerChar: 5
});

// ../../node_modules/.pnpm/multiformats@9.7.1/node_modules/multiformats/esm/src/cid.js
var CID = class {
  constructor(version2, code, multihash, bytes) {
    this.code = code;
    this.version = version2;
    this.multihash = multihash;
    this.bytes = bytes;
    this.byteOffset = bytes.byteOffset;
    this.byteLength = bytes.byteLength;
    this.asCID = this;
    this._baseCache = /* @__PURE__ */ new Map();
    Object.defineProperties(this, {
      byteOffset: hidden,
      byteLength: hidden,
      code: readonly,
      version: readonly,
      multihash: readonly,
      bytes: readonly,
      _baseCache: hidden,
      asCID: hidden
    });
  }
  toV0() {
    switch (this.version) {
      case 0: {
        return this;
      }
      default: {
        const { code, multihash } = this;
        if (code !== DAG_PB_CODE) {
          throw new Error("Cannot convert a non dag-pb CID to CIDv0");
        }
        if (multihash.code !== SHA_256_CODE) {
          throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
        }
        return CID.createV0(multihash);
      }
    }
  }
  toV1() {
    switch (this.version) {
      case 0: {
        const { code, digest } = this.multihash;
        const multihash = create(code, digest);
        return CID.createV1(this.code, multihash);
      }
      case 1: {
        return this;
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
      }
    }
  }
  equals(other) {
    return other && this.code === other.code && this.version === other.version && equals2(this.multihash, other.multihash);
  }
  toString(base2) {
    const { bytes, version: version2, _baseCache } = this;
    switch (version2) {
      case 0:
        return toStringV0(bytes, _baseCache, base2 || base58btc.encoder);
      default:
        return toStringV1(bytes, _baseCache, base2 || base32.encoder);
    }
  }
  toJSON() {
    return {
      code: this.code,
      version: this.version,
      hash: this.multihash.bytes
    };
  }
  get [Symbol.toStringTag]() {
    return "CID";
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return "CID(" + this.toString() + ")";
  }
  static isCID(value) {
    deprecate(/^0\.0/, IS_CID_DEPRECATION);
    return !!(value && (value[cidSymbol] || value.asCID === value));
  }
  get toBaseEncodedString() {
    throw new Error("Deprecated, use .toString()");
  }
  get codec() {
    throw new Error('"codec" property is deprecated, use integer "code" property instead');
  }
  get buffer() {
    throw new Error("Deprecated .buffer property, use .bytes to get Uint8Array instead");
  }
  get multibaseName() {
    throw new Error('"multibaseName" property is deprecated');
  }
  get prefix() {
    throw new Error('"prefix" property is deprecated');
  }
  static asCID(value) {
    if (value instanceof CID) {
      return value;
    } else if (value != null && value.asCID === value) {
      const { version: version2, code, multihash, bytes } = value;
      return new CID(version2, code, multihash, bytes || encodeCID(version2, code, multihash.bytes));
    } else if (value != null && value[cidSymbol] === true) {
      const { version: version2, multihash, code } = value;
      const digest = decode3(multihash);
      return CID.create(version2, code, digest);
    } else {
      return null;
    }
  }
  static create(version2, code, digest) {
    if (typeof code !== "number") {
      throw new Error("String codecs are no longer supported");
    }
    switch (version2) {
      case 0: {
        if (code !== DAG_PB_CODE) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
        } else {
          return new CID(version2, code, digest, digest.bytes);
        }
      }
      case 1: {
        const bytes = encodeCID(version2, code, digest.bytes);
        return new CID(version2, code, digest, bytes);
      }
      default: {
        throw new Error("Invalid version");
      }
    }
  }
  static createV0(digest) {
    return CID.create(0, DAG_PB_CODE, digest);
  }
  static createV1(code, digest) {
    return CID.create(1, code, digest);
  }
  static decode(bytes) {
    const [cid, remainder] = CID.decodeFirst(bytes);
    if (remainder.length) {
      throw new Error("Incorrect length");
    }
    return cid;
  }
  static decodeFirst(bytes) {
    const specs = CID.inspectBytes(bytes);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error("Incorrect length");
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid = specs.version === 0 ? CID.createV0(digest) : CID.createV1(specs.codec, digest);
    return [
      cid,
      bytes.subarray(specs.size)
    ];
  }
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length2] = decode2(initialBytes.subarray(offset));
      offset += length2;
      return i;
    };
    let version2 = next();
    let codec = DAG_PB_CODE;
    if (version2 === 18) {
      version2 = 0;
      offset = 0;
    } else if (version2 === 1) {
      codec = next();
    }
    if (version2 !== 0 && version2 !== 1) {
      throw new RangeError(`Invalid CID version ${version2}`);
    }
    const prefixSize = offset;
    const multihashCode = next();
    const digestSize = next();
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;
    return {
      version: version2,
      codec,
      multihashCode,
      digestSize,
      multihashSize,
      size
    };
  }
  static parse(source, base2) {
    const [prefix, bytes] = parseCIDtoBytes(source, base2);
    const cid = CID.decode(bytes);
    cid._baseCache.set(prefix, source);
    return cid;
  }
};
var parseCIDtoBytes = (source, base2) => {
  switch (source[0]) {
    case "Q": {
      const decoder = base2 || base58btc;
      return [
        base58btc.prefix,
        decoder.decode(`${base58btc.prefix}${source}`)
      ];
    }
    case base58btc.prefix: {
      const decoder = base2 || base58btc;
      return [
        base58btc.prefix,
        decoder.decode(source)
      ];
    }
    case base32.prefix: {
      const decoder = base2 || base32;
      return [
        base32.prefix,
        decoder.decode(source)
      ];
    }
    default: {
      if (base2 == null) {
        throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
      }
      return [
        source[0],
        base2.decode(source)
      ];
    }
  }
};
var toStringV0 = (bytes, cache, base2) => {
  const { prefix } = base2;
  if (prefix !== base58btc.prefix) {
    throw Error(`Cannot string encode V0 in ${base2.name} encoding`);
  }
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid2 = base2.encode(bytes).slice(1);
    cache.set(prefix, cid2);
    return cid2;
  } else {
    return cid;
  }
};
var toStringV1 = (bytes, cache, base2) => {
  const { prefix } = base2;
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid2 = base2.encode(bytes);
    cache.set(prefix, cid2);
    return cid2;
  } else {
    return cid;
  }
};
var DAG_PB_CODE = 112;
var SHA_256_CODE = 18;
var encodeCID = (version2, code, multihash) => {
  const codeOffset = encodingLength(version2);
  const hashOffset = codeOffset + encodingLength(code);
  const bytes = new Uint8Array(hashOffset + multihash.byteLength);
  encodeTo(version2, bytes, 0);
  encodeTo(code, bytes, codeOffset);
  bytes.set(multihash, hashOffset);
  return bytes;
};
var cidSymbol = Symbol.for("@ipld/js-cid/CID");
var readonly = {
  writable: false,
  configurable: false,
  enumerable: true
};
var hidden = {
  writable: false,
  enumerable: false,
  configurable: false
};
var version = "0.0.0-dev";
var deprecate = (range, message) => {
  if (range.test(version)) {
    console.warn(message);
  } else {
    throw new Error(message);
  }
};
var IS_CID_DEPRECATION = `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`;

// src/errors.js
var InvalidUrlError = class extends Error {
  constructor(message = "invalid URL") {
    const status = 400;
    super(createErrorHtmlContent(status, message));
    this.name = "InvalidUrlError";
    this.status = status;
    this.code = InvalidUrlError.CODE;
    this.contentType = "text/html";
  }
};
InvalidUrlError.CODE = "ERROR_INVALID_URL";
var createErrorHtmlContent = (status, message) => `<html>
<head><title>${status} ${message}</title></head>
<body>
<div style="text-align:center">
<h1>${status} ${message}</h1>
</div>
</body>
</html>
`;

// src/ipfs.js
async function ipfsGet(request, env) {
  const cid = request.params.cid;
  const reqUrl = new URL(request.url);
  const reqQueryString = reqUrl.searchParams.toString();
  const redirectPath = reqUrl.pathname.split(cid).slice(1).join(cid);
  const redirectQueryString = reqQueryString ? `?${reqQueryString}` : "";
  let nCid;
  try {
    nCid = normalizeCid(cid);
  } catch (err) {
    throw new InvalidUrlError(`invalid CID: ${cid}: ${err.message}`);
  }
  const url = new URL(`https://${nCid}.${env.IPFS_GATEWAY_HOSTNAME}${redirectPath}${redirectQueryString}`);
  return Response.redirect(url.toString(), 301);
}
function normalizeCid(cid) {
  const c = CID.parse(cid);
  return c.toV1().toString();
}

// src/ipns.js
var DNS_LABEL_MAX_LENGTH = 63;
async function ipnsGet(request, env) {
  const name = request.params.name;
  const reqUrl = new URL(request.url);
  const reqQueryString = reqUrl.searchParams.toString();
  const redirectPath = reqUrl.pathname.split(name).slice(1).join(name);
  const redirectQueryString = reqQueryString ? `?${reqQueryString}` : "";
  const dnsLabel = toDNSLinkDNSLabel(name);
  const url = new URL(`https://${dnsLabel}.${env.IPNS_GATEWAY_HOSTNAME}${redirectPath}${redirectQueryString}`);
  return Response.redirect(url.toString(), 302);
}
function toDNSLinkDNSLabel(fqdn) {
  const dnsLabel = fqdn.replaceAll("-", "--").replaceAll(".", "-");
  if (dnsLabel.length > DNS_LABEL_MAX_LENGTH) {
    throw new InvalidUrlError(`invalid FQDN: ${fqdn}: longer than max length: ${DNS_LABEL_MAX_LENGTH}`);
  }
  return dnsLabel;
}

// ../../node_modules/.pnpm/@web3-storage+worker-utils@0.3.0-dev/node_modules/@web3-storage/worker-utils/src/response.js
var JSONResponse = class extends Response {
  constructor(body, init = {}) {
    const headers = {
      headers: {
        "content-type": "application/json;charset=UTF-8"
      }
    };
    super(JSON.stringify(body), { ...init, ...headers });
  }
  static respond(body, init = {}) {
    return new JSONResponse(body, init);
  }
};

// src/version.js
async function versionGet(request, env) {
  return new JSONResponse({
    version: env.VERSION,
    commit: env.COMMITHASH,
    branch: env.BRANCH
  });
}

// ../../node_modules/.pnpm/p-retry@5.1.2/node_modules/p-retry/index.js
var import_retry = __toESM(require_retry2(), 1);
var networkErrorMsgs = /* @__PURE__ */ new Set([
  "Failed to fetch",
  "NetworkError when attempting to fetch resource.",
  "The Internet connection appears to be offline.",
  "Network request failed",
  "fetch failed"
]);
var AbortError = class extends Error {
  constructor(message) {
    super();
    if (message instanceof Error) {
      this.originalError = message;
      ({ message } = message);
    } else {
      this.originalError = new Error(message);
      this.originalError.stack = this.stack;
    }
    this.name = "AbortError";
    this.message = message;
  }
};
var decorateErrorWithCounts = (error, attemptNumber, options) => {
  const retriesLeft = options.retries - (attemptNumber - 1);
  error.attemptNumber = attemptNumber;
  error.retriesLeft = retriesLeft;
  return error;
};
var isNetworkError = (errorMessage) => networkErrorMsgs.has(errorMessage);
var getDOMException = (errorMessage) => globalThis.DOMException === void 0 ? new Error(errorMessage) : new DOMException(errorMessage);
async function pRetry(input, options) {
  return new Promise((resolve, reject) => {
    options = {
      onFailedAttempt() {
      },
      retries: 10,
      ...options
    };
    const operation = import_retry.default.operation(options);
    operation.attempt(async (attemptNumber) => {
      try {
        resolve(await input(attemptNumber));
      } catch (error) {
        if (!(error instanceof Error)) {
          reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
          return;
        }
        if (error instanceof AbortError) {
          operation.stop();
          reject(error.originalError);
        } else if (error instanceof TypeError && !isNetworkError(error.message)) {
          operation.stop();
          reject(error);
        } else {
          decorateErrorWithCounts(error, attemptNumber, options);
          try {
            await options.onFailedAttempt(error);
          } catch (error2) {
            reject(error2);
            return;
          }
          if (!operation.retry(error)) {
            reject(operation.mainError());
          }
        }
      }
    });
    if (options.signal && !options.signal.aborted) {
      options.signal.addEventListener("abort", () => {
        operation.stop();
        const reason = options.signal.reason === void 0 ? getDOMException("The operation was aborted.") : options.signal.reason;
        reject(reason instanceof Error ? reason : getDOMException(reason));
      }, {
        once: true
      });
    }
  });
}

// src/gateway.js
var PRODUCT_URL = "https://web3.storage/products/w3link/";
var GOODBITS_BYPASS_TAG = "https://leto.gg/tags/bypass-default-csp";
var IPFS_GATEWAYS = [
  "https://*.leto.gg",
  "https://*.nftstorage.link",
  "https://*.dweb.link",
  "https://ipfs.io/ipfs/"
];
var DOTSTORAGE_APIS = ["https://*.web3.storage", "https://*.nft.storage"];
var ALLOWED_LIST = [
  "https://*.githubusercontent.com",
  "https://tableland.network",
  "https://*.tableland.network"
];
async function gatewayGet(request, env) {
  if (!request.url.includes("ipfs") && !request.url.includes("ipns")) {
    return Response.redirect(PRODUCT_URL, 302);
  }
  if (request.url.includes(env.IPNS_GATEWAY_HOSTNAME)) {
    return Response.redirect(request.url.replace(env.IPNS_GATEWAY_HOSTNAME, "ipns.dweb.link"), 302);
  }
  const response = await env.EDGE_GATEWAY.fetch(request.url, {
    headers: request.headers,
    cf: {
      ...request.cf || {},
      onlyIfCachedGateways: JSON.stringify(["https://nftstorage.link"])
    }
  });
  const resourceCid = decodeURIComponent(response.headers.get("etag") || getCidFromSubdomainUrl(new URL(request.url)));
  const goodbitsTags = await getTagsFromGoodbitsList(env.GOODBITSLIST, resourceCid);
  if (goodbitsTags.includes(GOODBITS_BYPASS_TAG)) {
    return response;
  }
  return getTransformedResponseWithCspHeaders(response, env);
}
function getTransformedResponseWithCspHeaders(response, env) {
  const clonedResponse = new Response(response.body, response);
  const defaultSrc = `'self' 'unsafe-inline' 'unsafe-eval' blob: data: ${IPFS_GATEWAYS.join(" ")} ${DOTSTORAGE_APIS.join(" ")} ${ALLOWED_LIST.join(" ")}`;
  const connectSrc = `'self' blob: data: ${IPFS_GATEWAYS.join(" ")} ${DOTSTORAGE_APIS.join(" ")} ${ALLOWED_LIST.join(" ")}`;
  const reportUri = env.CSP_REPORT_URI;
  clonedResponse.headers.set("content-security-policy", `default-src ${defaultSrc} ; form-action 'self'; navigate-to 'self'; connect-src ${connectSrc} ; report-to csp-endpoint ; report-uri ${reportUri}`);
  reportUri && clonedResponse.headers.set("reporting-endpoints", `csp-endpoint="${reportUri}"`);
  return clonedResponse;
}
async function getTagsFromGoodbitsList(datastore, cid) {
  if (!datastore || !cid) {
    return [];
  }
  const goodbitsEntry = await pRetry(() => datastore.get(cid), { retries: 5 });
  if (goodbitsEntry) {
    const { tags } = JSON.parse(goodbitsEntry);
    return Array.isArray(tags) ? tags : [];
  }
  return [];
}
function getCidFromSubdomainUrl(url) {
  const host = url.hostname.replace("ipfs-staging", "ipfs");
  const splitHost = host.split(".ipfs.");
  if (!splitHost.length) {
    throw new InvalidUrlError(url.hostname);
  }
  let cid;
  try {
    cid = CID.parse(splitHost[0]);
  } catch (err) {
    throw new InvalidUrlError(`invalid CID: ${splitHost[0]}: ${err.message}`);
  }
  return cid.toV1().toString();
}

// src/cors.js
function withCorsHeaders(handler) {
  return async (request, ...rest) => {
    const response = await handler(request, ...rest);
    return addCorsHeaders(request, response);
  };
}
function addCorsHeaders(request, response) {
  response = new Response(response.body, response);
  const origin = request.headers.get("origin");
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }
  response.headers.set("Access-Control-Expose-Headers", "Link");
  return response;
}

// src/error-handler.js
function errorHandler(err, env) {
  console.error(err.stack);
  const status = err.status || 500;
  if (env.sentry && status >= 500) {
    env.log.error(err);
  }
  return new Response(err.message || "Server Error", {
    status,
    headers: {
      "content-type": err.contentType || "text/plain"
    }
  });
}

// ../../node_modules/.pnpm/tslib@1.14.1/node_modules/tslib/modules/index.js
var import_tslib = __toESM(require_tslib(), 1);
var {
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __metadata,
  __awaiter,
  __generator,
  __exportStar,
  __createBinding,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet
} = import_tslib.default;

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/env.js
function isBrowserBundle() {
  return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/node.js
function isNodeEnv() {
  return !isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
}
function dynamicRequire(mod, request) {
  return mod.require(request);
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/global.js
var fallbackGlobalObject = {};
function getGlobalObject() {
  return isNodeEnv() ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : fallbackGlobalObject;
}
function getGlobalSingleton(name, creator, obj) {
  var global2 = obj || getGlobalObject();
  var __SENTRY__ = global2.__SENTRY__ = global2.__SENTRY__ || {};
  var singleton = __SENTRY__[name] || (__SENTRY__[name] = creator());
  return singleton;
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/is.js
var objectToString = Object.prototype.toString;
function isError(wat) {
  switch (objectToString.call(wat)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}
function isBuiltin(wat, ty) {
  return objectToString.call(wat) === "[object " + ty + "]";
}
function isString(wat) {
  return isBuiltin(wat, "String");
}
function isPlainObject(wat) {
  return isBuiltin(wat, "Object");
}
function isEvent(wat) {
  return typeof Event !== "undefined" && isInstanceOf(wat, Event);
}
function isElement(wat) {
  return typeof Element !== "undefined" && isInstanceOf(wat, Element);
}
function isThenable(wat) {
  return Boolean(wat && wat.then && typeof wat.then === "function");
}
function isSyntheticEvent(wat) {
  return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
}
function isNaN2(wat) {
  return typeof wat === "number" && wat !== wat;
}
function isInstanceOf(wat, base2) {
  try {
    return wat instanceof base2;
  } catch (_e) {
    return false;
  }
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/browser.js
function htmlTreeAsString(elem, keyAttrs) {
  try {
    var currentElem = elem;
    var MAX_TRAVERSE_HEIGHT = 5;
    var MAX_OUTPUT_LEN = 80;
    var out = [];
    var height = 0;
    var len = 0;
    var separator = " > ";
    var sepLength = separator.length;
    var nextStr = void 0;
    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem, keyAttrs);
      if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN) {
        break;
      }
      out.push(nextStr);
      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }
    return out.reverse().join(separator);
  } catch (_oO) {
    return "<unknown>";
  }
}
function _htmlElementAsString(el, keyAttrs) {
  var elem = el;
  var out = [];
  var className;
  var classes;
  var key;
  var attr;
  var i;
  if (!elem || !elem.tagName) {
    return "";
  }
  out.push(elem.tagName.toLowerCase());
  var keyAttrPairs = keyAttrs && keyAttrs.length ? keyAttrs.filter(function(keyAttr) {
    return elem.getAttribute(keyAttr);
  }).map(function(keyAttr) {
    return [keyAttr, elem.getAttribute(keyAttr)];
  }) : null;
  if (keyAttrPairs && keyAttrPairs.length) {
    keyAttrPairs.forEach(function(keyAttrPair) {
      out.push("[" + keyAttrPair[0] + '="' + keyAttrPair[1] + '"]');
    });
  } else {
    if (elem.id) {
      out.push("#" + elem.id);
    }
    className = elem.className;
    if (className && isString(className)) {
      classes = className.split(/\s+/);
      for (i = 0; i < classes.length; i++) {
        out.push("." + classes[i]);
      }
    }
  }
  var allowedAttrs = ["type", "name", "title", "alt"];
  for (i = 0; i < allowedAttrs.length; i++) {
    key = allowedAttrs[i];
    attr = elem.getAttribute(key);
    if (attr) {
      out.push("[" + key + '="' + attr + '"]');
    }
  }
  return out.join("");
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/polyfill.js
var setPrototypeOf = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties);
function setProtoOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
function mixinProperties(obj, proto) {
  for (var prop in proto) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      obj[prop] = proto[prop];
    }
  }
  return obj;
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/error.js
var SentryError = function(_super) {
  __extends(SentryError2, _super);
  function SentryError2(message) {
    var _newTarget = this.constructor;
    var _this = _super.call(this, message) || this;
    _this.message = message;
    _this.name = _newTarget.prototype.constructor.name;
    setPrototypeOf(_this, _newTarget.prototype);
    return _this;
  }
  return SentryError2;
}(Error);

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/flags.js
var IS_DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" ? true : __SENTRY_DEBUG__;

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/dsn.js
var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
  return protocol === "http" || protocol === "https";
}
function dsnFromString(str) {
  var match = DSN_REGEX.exec(str);
  if (!match) {
    throw new SentryError("Invalid Sentry Dsn: " + str);
  }
  var _a = __read(match.slice(1), 6), protocol = _a[0], publicKey = _a[1], _b = _a[2], pass = _b === void 0 ? "" : _b, host = _a[3], _c = _a[4], port = _c === void 0 ? "" : _c, lastPath = _a[5];
  var path = "";
  var projectId = lastPath;
  var split = projectId.split("/");
  if (split.length > 1) {
    path = split.slice(0, -1).join("/");
    projectId = split.pop();
  }
  if (projectId) {
    var projectMatch = projectId.match(/^\d+/);
    if (projectMatch) {
      projectId = projectMatch[0];
    }
  }
  return dsnFromComponents({ host, pass, path, projectId, port, protocol, publicKey });
}
function dsnFromComponents(components) {
  if ("user" in components && !("publicKey" in components)) {
    components.publicKey = components.user;
  }
  return {
    user: components.publicKey || "",
    protocol: components.protocol,
    publicKey: components.publicKey || "",
    pass: components.pass || "",
    host: components.host,
    port: components.port || "",
    path: components.path || "",
    projectId: components.projectId
  };
}
function validateDsn(dsn) {
  if (!IS_DEBUG_BUILD) {
    return;
  }
  var port = dsn.port, projectId = dsn.projectId, protocol = dsn.protocol;
  var requiredComponents = ["protocol", "publicKey", "host", "projectId"];
  requiredComponents.forEach(function(component) {
    if (!dsn[component]) {
      throw new SentryError("Invalid Sentry Dsn: " + component + " missing");
    }
  });
  if (!projectId.match(/^\d+$/)) {
    throw new SentryError("Invalid Sentry Dsn: Invalid projectId " + projectId);
  }
  if (!isValidProtocol(protocol)) {
    throw new SentryError("Invalid Sentry Dsn: Invalid protocol " + protocol);
  }
  if (port && isNaN(parseInt(port, 10))) {
    throw new SentryError("Invalid Sentry Dsn: Invalid port " + port);
  }
  return true;
}
function makeDsn(from2) {
  var components = typeof from2 === "string" ? dsnFromString(from2) : dsnFromComponents(from2);
  validateDsn(components);
  return components;
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/string.js
function truncate(str, max) {
  if (max === void 0) {
    max = 0;
  }
  if (typeof str !== "string" || max === 0) {
    return str;
  }
  return str.length <= max ? str : str.substr(0, max) + "...";
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/object.js
function urlEncode(object) {
  return Object.keys(object).map(function(key) {
    return encodeURIComponent(key) + "=" + encodeURIComponent(object[key]);
  }).join("&");
}
function convertToPlainObject(value) {
  var newObj = value;
  if (isError(value)) {
    newObj = __assign({ message: value.message, name: value.name, stack: value.stack }, getOwnProperties(value));
  } else if (isEvent(value)) {
    var event_1 = value;
    newObj = __assign({ type: event_1.type, target: serializeEventTarget(event_1.target), currentTarget: serializeEventTarget(event_1.currentTarget) }, getOwnProperties(event_1));
    if (typeof CustomEvent !== "undefined" && isInstanceOf(value, CustomEvent)) {
      newObj.detail = event_1.detail;
    }
  }
  return newObj;
}
function serializeEventTarget(target) {
  try {
    return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
  } catch (_oO) {
    return "<unknown>";
  }
}
function getOwnProperties(obj) {
  var extractedProps = {};
  for (var property in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      extractedProps[property] = obj[property];
    }
  }
  return extractedProps;
}
function extractExceptionKeysForMessage(exception, maxLength) {
  if (maxLength === void 0) {
    maxLength = 40;
  }
  var keys = Object.keys(convertToPlainObject(exception));
  keys.sort();
  if (!keys.length) {
    return "[object has no keys]";
  }
  if (keys[0].length >= maxLength) {
    return truncate(keys[0], maxLength);
  }
  for (var includedKeys = keys.length; includedKeys > 0; includedKeys--) {
    var serialized = keys.slice(0, includedKeys).join(", ");
    if (serialized.length > maxLength) {
      continue;
    }
    if (includedKeys === keys.length) {
      return serialized;
    }
    return truncate(serialized, maxLength);
  }
  return "";
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/stacktrace.js
var defaultFunctionName = "<anonymous>";
function getFunctionName(fn) {
  try {
    if (!fn || typeof fn !== "function") {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (e2) {
    return defaultFunctionName;
  }
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/memo.js
function memoBuilder() {
  var hasWeakSet = typeof WeakSet === "function";
  var inner = hasWeakSet ? /* @__PURE__ */ new WeakSet() : [];
  function memoize(obj) {
    if (hasWeakSet) {
      if (inner.has(obj)) {
        return true;
      }
      inner.add(obj);
      return false;
    }
    for (var i = 0; i < inner.length; i++) {
      var value = inner[i];
      if (value === obj) {
        return true;
      }
    }
    inner.push(obj);
    return false;
  }
  function unmemoize(obj) {
    if (hasWeakSet) {
      inner.delete(obj);
    } else {
      for (var i = 0; i < inner.length; i++) {
        if (inner[i] === obj) {
          inner.splice(i, 1);
          break;
        }
      }
    }
  }
  return [memoize, unmemoize];
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/normalize.js
function normalize(input, depth, maxProperties) {
  if (depth === void 0) {
    depth = Infinity;
  }
  if (maxProperties === void 0) {
    maxProperties = Infinity;
  }
  try {
    return visit("", input, depth, maxProperties);
  } catch (err) {
    return { ERROR: "**non-serializable** (" + err + ")" };
  }
}
function normalizeToSize(object, depth, maxSize) {
  if (depth === void 0) {
    depth = 3;
  }
  if (maxSize === void 0) {
    maxSize = 100 * 1024;
  }
  var normalized = normalize(object, depth);
  if (jsonSize(normalized) > maxSize) {
    return normalizeToSize(object, depth - 1, maxSize);
  }
  return normalized;
}
function visit(key, value, depth, maxProperties, memo) {
  if (depth === void 0) {
    depth = Infinity;
  }
  if (maxProperties === void 0) {
    maxProperties = Infinity;
  }
  if (memo === void 0) {
    memo = memoBuilder();
  }
  var _a = __read(memo, 2), memoize = _a[0], unmemoize = _a[1];
  var valueWithToJSON = value;
  if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") {
    try {
      return valueWithToJSON.toJSON();
    } catch (err) {
    }
  }
  if (value === null || ["number", "boolean", "string"].includes(typeof value) && !isNaN2(value)) {
    return value;
  }
  var stringified = stringifyValue(key, value);
  if (!stringified.startsWith("[object ")) {
    return stringified;
  }
  if (depth === 0) {
    return stringified.replace("object ", "");
  }
  if (memoize(value)) {
    return "[Circular ~]";
  }
  var normalized = Array.isArray(value) ? [] : {};
  var numAdded = 0;
  var visitable = isError(value) || isEvent(value) ? convertToPlainObject(value) : value;
  for (var visitKey in visitable) {
    if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
      continue;
    }
    if (numAdded >= maxProperties) {
      normalized[visitKey] = "[MaxProperties ~]";
      break;
    }
    var visitValue = visitable[visitKey];
    normalized[visitKey] = visit(visitKey, visitValue, depth - 1, maxProperties, memo);
    numAdded += 1;
  }
  unmemoize(value);
  return normalized;
}
function stringifyValue(key, value) {
  try {
    if (key === "domain" && value && typeof value === "object" && value._events) {
      return "[Domain]";
    }
    if (key === "domainEmitter") {
      return "[DomainEmitter]";
    }
    if (typeof globalThis !== "undefined" && value === globalThis) {
      return "[Global]";
    }
    if (typeof window !== "undefined" && value === window) {
      return "[Window]";
    }
    if (typeof document !== "undefined" && value === document) {
      return "[Document]";
    }
    if (isSyntheticEvent(value)) {
      return "[SyntheticEvent]";
    }
    if (typeof value === "number" && value !== value) {
      return "[NaN]";
    }
    if (value === void 0) {
      return "[undefined]";
    }
    if (typeof value === "function") {
      return "[Function: " + getFunctionName(value) + "]";
    }
    if (typeof value === "symbol") {
      return "[" + String(value) + "]";
    }
    if (typeof value === "bigint") {
      return "[BigInt: " + String(value) + "]";
    }
    return "[object " + Object.getPrototypeOf(value).constructor.name + "]";
  } catch (err) {
    return "**non-serializable** (" + err + ")";
  }
}
function utf8Length(value) {
  return ~-encodeURI(value).split(/%..|./).length;
}
function jsonSize(value) {
  return utf8Length(JSON.stringify(value));
}

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/syncpromise.js
var SyncPromise = function() {
  function SyncPromise2(executor) {
    var _this = this;
    this._state = 0;
    this._handlers = [];
    this._resolve = function(value) {
      _this._setResult(1, value);
    };
    this._reject = function(reason) {
      _this._setResult(2, reason);
    };
    this._setResult = function(state, value) {
      if (_this._state !== 0) {
        return;
      }
      if (isThenable(value)) {
        void value.then(_this._resolve, _this._reject);
        return;
      }
      _this._state = state;
      _this._value = value;
      _this._executeHandlers();
    };
    this._executeHandlers = function() {
      if (_this._state === 0) {
        return;
      }
      var cachedHandlers = _this._handlers.slice();
      _this._handlers = [];
      cachedHandlers.forEach(function(handler) {
        if (handler[0]) {
          return;
        }
        if (_this._state === 1) {
          handler[1](_this._value);
        }
        if (_this._state === 2) {
          handler[2](_this._value);
        }
        handler[0] = true;
      });
    };
    try {
      executor(this._resolve, this._reject);
    } catch (e2) {
      this._reject(e2);
    }
  }
  SyncPromise2.prototype.then = function(onfulfilled, onrejected) {
    var _this = this;
    return new SyncPromise2(function(resolve, reject) {
      _this._handlers.push([
        false,
        function(result) {
          if (!onfulfilled) {
            resolve(result);
          } else {
            try {
              resolve(onfulfilled(result));
            } catch (e2) {
              reject(e2);
            }
          }
        },
        function(reason) {
          if (!onrejected) {
            reject(reason);
          } else {
            try {
              resolve(onrejected(reason));
            } catch (e2) {
              reject(e2);
            }
          }
        }
      ]);
      _this._executeHandlers();
    });
  };
  SyncPromise2.prototype.catch = function(onrejected) {
    return this.then(function(val) {
      return val;
    }, onrejected);
  };
  SyncPromise2.prototype.finally = function(onfinally) {
    var _this = this;
    return new SyncPromise2(function(resolve, reject) {
      var val;
      var isRejected;
      return _this.then(function(value) {
        isRejected = false;
        val = value;
        if (onfinally) {
          onfinally();
        }
      }, function(reason) {
        isRejected = true;
        val = reason;
        if (onfinally) {
          onfinally();
        }
      }).then(function() {
        if (isRejected) {
          reject(val);
          return;
        }
        resolve(val);
      });
    });
  };
  return SyncPromise2;
}();

// ../../node_modules/.pnpm/@sentry+utils@6.19.6/node_modules/@sentry/utils/esm/time.js
var dateTimestampSource = {
  nowSeconds: function() {
    return Date.now() / 1e3;
  }
};
function getBrowserPerformance() {
  var performance = getGlobalObject().performance;
  if (!performance || !performance.now) {
    return void 0;
  }
  var timeOrigin = Date.now() - performance.now();
  return {
    now: function() {
      return performance.now();
    },
    timeOrigin
  };
}
function getNodePerformance() {
  try {
    var perfHooks = dynamicRequire(module, "perf_hooks");
    return perfHooks.performance;
  } catch (_) {
    return void 0;
  }
}
var platformPerformance = isNodeEnv() ? getNodePerformance() : getBrowserPerformance();
var timestampSource = platformPerformance === void 0 ? dateTimestampSource : {
  nowSeconds: function() {
    return (platformPerformance.timeOrigin + platformPerformance.now()) / 1e3;
  }
};
var dateTimestampInSeconds = dateTimestampSource.nowSeconds.bind(dateTimestampSource);
var timestampInSeconds = timestampSource.nowSeconds.bind(timestampSource);
var _browserPerformanceTimeOriginMode;
var browserPerformanceTimeOrigin = function() {
  var performance = getGlobalObject().performance;
  if (!performance || !performance.now) {
    _browserPerformanceTimeOriginMode = "none";
    return void 0;
  }
  var threshold = 3600 * 1e3;
  var performanceNow = performance.now();
  var dateNow = Date.now();
  var timeOriginDelta = performance.timeOrigin ? Math.abs(performance.timeOrigin + performanceNow - dateNow) : threshold;
  var timeOriginIsReliable = timeOriginDelta < threshold;
  var navigationStart = performance.timing && performance.timing.navigationStart;
  var hasNavigationStart = typeof navigationStart === "number";
  var navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
  var navigationStartIsReliable = navigationStartDelta < threshold;
  if (timeOriginIsReliable || navigationStartIsReliable) {
    if (timeOriginDelta <= navigationStartDelta) {
      _browserPerformanceTimeOriginMode = "timeOrigin";
      return performance.timeOrigin;
    } else {
      _browserPerformanceTimeOriginMode = "navigationStart";
      return navigationStart;
    }
  }
  _browserPerformanceTimeOriginMode = "dateNow";
  return dateNow;
}();

// ../../node_modules/.pnpm/@sentry+hub@6.19.6/node_modules/@sentry/hub/esm/scope.js
var MAX_BREADCRUMBS = 100;
var Scope = function() {
  function Scope3() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._eventProcessors = [];
    this._breadcrumbs = [];
    this._user = {};
    this._tags = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
  }
  Scope3.clone = function(scope) {
    var newScope = new Scope3();
    if (scope) {
      newScope._breadcrumbs = __spread(scope._breadcrumbs);
      newScope._tags = __assign({}, scope._tags);
      newScope._extra = __assign({}, scope._extra);
      newScope._contexts = __assign({}, scope._contexts);
      newScope._user = scope._user;
      newScope._level = scope._level;
      newScope._span = scope._span;
      newScope._session = scope._session;
      newScope._transactionName = scope._transactionName;
      newScope._fingerprint = scope._fingerprint;
      newScope._eventProcessors = __spread(scope._eventProcessors);
      newScope._requestSession = scope._requestSession;
    }
    return newScope;
  };
  Scope3.prototype.addScopeListener = function(callback) {
    this._scopeListeners.push(callback);
  };
  Scope3.prototype.addEventProcessor = function(callback) {
    this._eventProcessors.push(callback);
    return this;
  };
  Scope3.prototype.setUser = function(user) {
    this._user = user || {};
    if (this._session) {
      this._session.update({ user });
    }
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.getUser = function() {
    return this._user;
  };
  Scope3.prototype.getRequestSession = function() {
    return this._requestSession;
  };
  Scope3.prototype.setRequestSession = function(requestSession) {
    this._requestSession = requestSession;
    return this;
  };
  Scope3.prototype.setTags = function(tags) {
    this._tags = __assign(__assign({}, this._tags), tags);
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setTag = function(key, value) {
    var _a;
    this._tags = __assign(__assign({}, this._tags), (_a = {}, _a[key] = value, _a));
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setExtras = function(extras) {
    this._extra = __assign(__assign({}, this._extra), extras);
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setExtra = function(key, extra) {
    var _a;
    this._extra = __assign(__assign({}, this._extra), (_a = {}, _a[key] = extra, _a));
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setFingerprint = function(fingerprint) {
    this._fingerprint = fingerprint;
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setLevel = function(level) {
    this._level = level;
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setTransactionName = function(name) {
    this._transactionName = name;
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setTransaction = function(name) {
    return this.setTransactionName(name);
  };
  Scope3.prototype.setContext = function(key, context) {
    var _a;
    if (context === null) {
      delete this._contexts[key];
    } else {
      this._contexts = __assign(__assign({}, this._contexts), (_a = {}, _a[key] = context, _a));
    }
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.setSpan = function(span) {
    this._span = span;
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.getSpan = function() {
    return this._span;
  };
  Scope3.prototype.getTransaction = function() {
    var span = this.getSpan();
    return span && span.transaction;
  };
  Scope3.prototype.setSession = function(session) {
    if (!session) {
      delete this._session;
    } else {
      this._session = session;
    }
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.getSession = function() {
    return this._session;
  };
  Scope3.prototype.update = function(captureContext) {
    if (!captureContext) {
      return this;
    }
    if (typeof captureContext === "function") {
      var updatedScope = captureContext(this);
      return updatedScope instanceof Scope3 ? updatedScope : this;
    }
    if (captureContext instanceof Scope3) {
      this._tags = __assign(__assign({}, this._tags), captureContext._tags);
      this._extra = __assign(__assign({}, this._extra), captureContext._extra);
      this._contexts = __assign(__assign({}, this._contexts), captureContext._contexts);
      if (captureContext._user && Object.keys(captureContext._user).length) {
        this._user = captureContext._user;
      }
      if (captureContext._level) {
        this._level = captureContext._level;
      }
      if (captureContext._fingerprint) {
        this._fingerprint = captureContext._fingerprint;
      }
      if (captureContext._requestSession) {
        this._requestSession = captureContext._requestSession;
      }
    } else if (isPlainObject(captureContext)) {
      captureContext = captureContext;
      this._tags = __assign(__assign({}, this._tags), captureContext.tags);
      this._extra = __assign(__assign({}, this._extra), captureContext.extra);
      this._contexts = __assign(__assign({}, this._contexts), captureContext.contexts);
      if (captureContext.user) {
        this._user = captureContext.user;
      }
      if (captureContext.level) {
        this._level = captureContext.level;
      }
      if (captureContext.fingerprint) {
        this._fingerprint = captureContext.fingerprint;
      }
      if (captureContext.requestSession) {
        this._requestSession = captureContext.requestSession;
      }
    }
    return this;
  };
  Scope3.prototype.clear = function() {
    this._breadcrumbs = [];
    this._tags = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._level = void 0;
    this._transactionName = void 0;
    this._fingerprint = void 0;
    this._requestSession = void 0;
    this._span = void 0;
    this._session = void 0;
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.addBreadcrumb = function(breadcrumb, maxBreadcrumbs) {
    var maxCrumbs = typeof maxBreadcrumbs === "number" ? Math.min(maxBreadcrumbs, MAX_BREADCRUMBS) : MAX_BREADCRUMBS;
    if (maxCrumbs <= 0) {
      return this;
    }
    var mergedBreadcrumb = __assign({ timestamp: dateTimestampInSeconds() }, breadcrumb);
    this._breadcrumbs = __spread(this._breadcrumbs, [mergedBreadcrumb]).slice(-maxCrumbs);
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.clearBreadcrumbs = function() {
    this._breadcrumbs = [];
    this._notifyScopeListeners();
    return this;
  };
  Scope3.prototype.applyToEvent = function(event, hint) {
    if (this._extra && Object.keys(this._extra).length) {
      event.extra = __assign(__assign({}, this._extra), event.extra);
    }
    if (this._tags && Object.keys(this._tags).length) {
      event.tags = __assign(__assign({}, this._tags), event.tags);
    }
    if (this._user && Object.keys(this._user).length) {
      event.user = __assign(__assign({}, this._user), event.user);
    }
    if (this._contexts && Object.keys(this._contexts).length) {
      event.contexts = __assign(__assign({}, this._contexts), event.contexts);
    }
    if (this._level) {
      event.level = this._level;
    }
    if (this._transactionName) {
      event.transaction = this._transactionName;
    }
    if (this._span) {
      event.contexts = __assign({ trace: this._span.getTraceContext() }, event.contexts);
      var transactionName = this._span.transaction && this._span.transaction.name;
      if (transactionName) {
        event.tags = __assign({ transaction: transactionName }, event.tags);
      }
    }
    this._applyFingerprint(event);
    event.breadcrumbs = __spread(event.breadcrumbs || [], this._breadcrumbs);
    event.breadcrumbs = event.breadcrumbs.length > 0 ? event.breadcrumbs : void 0;
    event.sdkProcessingMetadata = this._sdkProcessingMetadata;
    return this._notifyEventProcessors(__spread(getGlobalEventProcessors(), this._eventProcessors), event, hint);
  };
  Scope3.prototype.setSDKProcessingMetadata = function(newData) {
    this._sdkProcessingMetadata = __assign(__assign({}, this._sdkProcessingMetadata), newData);
    return this;
  };
  Scope3.prototype._notifyEventProcessors = function(processors, event, hint, index) {
    var _this = this;
    if (index === void 0) {
      index = 0;
    }
    return new SyncPromise(function(resolve, reject) {
      var processor = processors[index];
      if (event === null || typeof processor !== "function") {
        resolve(event);
      } else {
        var result = processor(__assign({}, event), hint);
        if (isThenable(result)) {
          void result.then(function(final) {
            return _this._notifyEventProcessors(processors, final, hint, index + 1).then(resolve);
          }).then(null, reject);
        } else {
          void _this._notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
        }
      }
    });
  };
  Scope3.prototype._notifyScopeListeners = function() {
    var _this = this;
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach(function(callback) {
        callback(_this);
      });
      this._notifyingListeners = false;
    }
  };
  Scope3.prototype._applyFingerprint = function(event) {
    event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];
    if (this._fingerprint) {
      event.fingerprint = event.fingerprint.concat(this._fingerprint);
    }
    if (event.fingerprint && !event.fingerprint.length) {
      delete event.fingerprint;
    }
  };
  return Scope3;
}();
function getGlobalEventProcessors() {
  return getGlobalSingleton("globalEventProcessors", function() {
    return [];
  });
}

// ../../node_modules/.pnpm/@sentry+core@6.19.6/node_modules/@sentry/core/esm/api.js
var SENTRY_API_VERSION = "7";
var API = function() {
  function API2(dsn, metadata, tunnel) {
    if (metadata === void 0) {
      metadata = {};
    }
    this.dsn = dsn;
    this._dsnObject = makeDsn(dsn);
    this.metadata = metadata;
    this._tunnel = tunnel;
  }
  API2.prototype.getDsn = function() {
    return this._dsnObject;
  };
  API2.prototype.forceEnvelope = function() {
    return !!this._tunnel;
  };
  API2.prototype.getBaseApiEndpoint = function() {
    return getBaseApiEndpoint(this._dsnObject);
  };
  API2.prototype.getStoreEndpoint = function() {
    return getStoreEndpoint(this._dsnObject);
  };
  API2.prototype.getStoreEndpointWithUrlEncodedAuth = function() {
    return getStoreEndpointWithUrlEncodedAuth(this._dsnObject);
  };
  API2.prototype.getEnvelopeEndpointWithUrlEncodedAuth = function() {
    return getEnvelopeEndpointWithUrlEncodedAuth(this._dsnObject, this._tunnel);
  };
  return API2;
}();
function getBaseApiEndpoint(dsn) {
  var protocol = dsn.protocol ? dsn.protocol + ":" : "";
  var port = dsn.port ? ":" + dsn.port : "";
  return protocol + "//" + dsn.host + port + (dsn.path ? "/" + dsn.path : "") + "/api/";
}
function _getIngestEndpoint(dsn, target) {
  return "" + getBaseApiEndpoint(dsn) + dsn.projectId + "/" + target + "/";
}
function _encodedAuth(dsn) {
  return urlEncode({
    sentry_key: dsn.publicKey,
    sentry_version: SENTRY_API_VERSION
  });
}
function getStoreEndpoint(dsn) {
  return _getIngestEndpoint(dsn, "store");
}
function getStoreEndpointWithUrlEncodedAuth(dsn) {
  return getStoreEndpoint(dsn) + "?" + _encodedAuth(dsn);
}
function _getEnvelopeEndpoint(dsn) {
  return _getIngestEndpoint(dsn, "envelope");
}
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel) {
  return tunnel ? tunnel : _getEnvelopeEndpoint(dsn) + "?" + _encodedAuth(dsn);
}

// ../../node_modules/.pnpm/toucan-js@2.6.1/node_modules/toucan-js/dist/index.esm.js
var import_cookie = __toESM(require_cookie());
var import_stacktrace_js = __toESM(require_stacktrace());
var SentryScopeAdapter = class extends Scope {
  applyToEventSync(event) {
    var _a, _b, _c, _d;
    if (this._extra && Object.keys(this._extra).length) {
      event.extra = { ...this._extra, ...event.extra };
    }
    if (this._tags && Object.keys(this._tags).length) {
      event.tags = { ...this._tags, ...event.tags };
    }
    if (this._user && Object.keys(this._user).length) {
      event.user = { ...this._user, ...event.user };
    }
    event.fingerprint = [
      ...(_a = event.fingerprint) !== null && _a !== void 0 ? _a : [],
      ...(_b = this._fingerprint) !== null && _b !== void 0 ? _b : []
    ];
    event.fingerprint = event.fingerprint.length > 0 ? event.fingerprint : void 0;
    event.breadcrumbs = [
      ...(_c = event.breadcrumbs) !== null && _c !== void 0 ? _c : [],
      ...(_d = this._breadcrumbs) !== null && _d !== void 0 ? _d : []
    ];
    event.breadcrumbs = event.breadcrumbs.length > 0 ? event.breadcrumbs : void 0;
    return event;
  }
  static clone(scope) {
    const newScope = new SentryScopeAdapter();
    if (scope) {
      newScope._breadcrumbs = [...scope._breadcrumbs];
      newScope._tags = { ...scope._tags };
      newScope._extra = { ...scope._extra };
      newScope._contexts = { ...scope._contexts };
      newScope._user = scope._user;
      newScope._level = scope._level;
      newScope._span = scope._span;
      newScope._session = scope._session;
      newScope._transactionName = scope._transactionName;
      newScope._fingerprint = scope._fingerprint;
      newScope._eventProcessors = [...scope._eventProcessors];
    }
    return newScope;
  }
};
var Scope2 = class {
  constructor() {
    this.adapter = new SentryScopeAdapter();
  }
  addBreadcrumb(breadcrumb, maxBreadcrumbs) {
    return this.adapter.addBreadcrumb(breadcrumb, maxBreadcrumbs);
  }
  setTag(key, value) {
    this.adapter.setTag(key, value);
  }
  setTags(tags) {
    this.adapter.setTags(tags);
  }
  setExtra(key, extra) {
    this.adapter.setExtra(key, extra);
  }
  setExtras(extras) {
    this.adapter.setExtras(extras);
  }
  setFingerprint(fingerprint) {
    this.adapter.setFingerprint(fingerprint);
  }
  setUser(user) {
    this.adapter.setUser(user);
  }
  applyToEvent(event) {
    return this.adapter.applyToEventSync(event);
  }
  static clone(scope) {
    const newScope = new Scope2();
    if (scope) {
      newScope.adapter = SentryScopeAdapter.clone(scope.adapter);
    }
    return newScope;
  }
};
function isValidSampleRate(rate) {
  if (!(typeof rate === "number" && !isNaN(rate) || typeof rate === "boolean")) {
    return false;
  }
  if (rate < 0 || rate > 1) {
    return false;
  }
  return true;
}
function hasTracingEnabled(options) {
  return "sampleRate" in options || "tracesSampleRate" in options || "tracesSampler" in options;
}
var Toucan = class {
  constructor(options) {
    this.DEFAULT_BREADCRUMBS = 100;
    this.MAX_BREADCRUMBS = 100;
    this.scopes = [new Scope2()];
    this.options = options;
    if (!options.dsn || options.dsn.length === 0) {
      this.url = "";
      this.disabled = true;
      this.debug(() => this.log("dsn missing, SDK is disabled"));
    } else {
      this.url = new API(options.dsn).getStoreEndpointWithUrlEncodedAuth();
      this.disabled = false;
      this.debug(() => this.log(`dsn parsed, full store endpoint: ${this.url}`));
    }
    if ("context" in options && options.context.request) {
      this.request = this.toSentryRequest(options.context.request);
    } else if ("request" in options && options.request) {
      this.request = this.toSentryRequest(options.request);
    } else if ("event" in options && "request" in options.event) {
      this.request = this.toSentryRequest(options.event.request);
    }
    this.beforeSend = this.beforeSend.bind(this);
    return new Proxy(this, {
      get: (target, key, receiver) => {
        return (...args) => {
          if (this.disabled)
            return;
          try {
            return Reflect.get(target, key, receiver).apply(target, args);
          } catch (err) {
            this.debug(() => this.error(err));
          }
        };
      }
    });
  }
  setExtra(key, extra) {
    this.getScope().setExtra(key, extra);
  }
  setExtras(extras) {
    this.getScope().setExtras(extras);
  }
  setTag(key, value) {
    this.getScope().setTag(key, value);
  }
  setTags(tags) {
    this.getScope().setTags(tags);
  }
  setFingerprint(fingerprint) {
    this.getScope().setFingerprint(fingerprint);
  }
  addBreadcrumb(breadcrumb) {
    var _a;
    const maxBreadcrumbs = (_a = this.options.maxBreadcrumbs) !== null && _a !== void 0 ? _a : this.DEFAULT_BREADCRUMBS;
    const numberOfBreadcrumbs = Math.min(maxBreadcrumbs, this.MAX_BREADCRUMBS);
    if (numberOfBreadcrumbs <= 0)
      return;
    if (!breadcrumb.timestamp) {
      breadcrumb.timestamp = this.timestamp();
    }
    this.getScope().addBreadcrumb(breadcrumb, numberOfBreadcrumbs);
  }
  captureException(exception) {
    this.debug(() => this.log(`calling captureException`));
    const event = this.buildEvent({});
    if (!event)
      return;
    if ("context" in this.options) {
      this.options.context.waitUntil(this.reportException(event, exception));
    } else if ("event" in this.options) {
      this.options.event.waitUntil(this.reportException(event, exception));
    } else {
      this.reportException(event, exception);
    }
    return event.event_id;
  }
  captureMessage(message, level = "info") {
    this.debug(() => this.log(`calling captureMessage`));
    const event = this.buildEvent({ level, message });
    if (!event)
      return;
    if ("context" in this.options) {
      this.options.context.waitUntil(this.reportMessage(event));
    } else if ("event" in this.options) {
      this.options.event.waitUntil(this.reportMessage(event));
    } else {
      this.reportMessage(event);
    }
    return event.event_id;
  }
  setUser(user) {
    this.getScope().setUser(user);
  }
  setRequestBody(body) {
    if (this.request) {
      this.request.data = body;
    } else {
      this.request = { data: body };
    }
  }
  withScope(callback) {
    const scope = this.pushScope();
    try {
      callback(scope);
    } finally {
      this.popScope();
    }
  }
  async postEvent(data) {
    var _a, _b;
    let headers = {
      "Content-Type": "application/json",
      "User-Agent": "toucan-js/2.6.1"
    };
    if ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.transportOptions) === null || _b === void 0 ? void 0 : _b.headers) {
      headers = {
        ...headers,
        ...this.options.transportOptions.headers
      };
    }
    const body = JSON.stringify(data);
    this.debug(() => {
      this.log(`sending request to Sentry with headers: ${JSON.stringify(headers)} and body: ${body}`);
    });
    const response = await fetch(this.url, {
      method: "POST",
      body,
      headers
    });
    await this.debug(() => {
      return this.logResponse(response);
    });
    return response;
  }
  buildEvent(additionalData) {
    var _a;
    if (hasTracingEnabled(this.options)) {
      const sampleRate = typeof this.options.tracesSampler === "function" ? this.options.tracesSampler({ request: this.request }) : typeof this.options.tracesSampleRate === "number" ? this.options.tracesSampleRate : typeof this.options.sampleRate === "number" ? this.options.sampleRate : null;
      if (!isValidSampleRate(sampleRate)) {
        this.debug(() => this.log(`skipping this event because of invalid sample rate.`));
        return;
      }
      if (Math.random() >= Number(sampleRate)) {
        this.debug(() => this.log(`skipping this event (sampling rate ${Number(sampleRate)})`));
        return;
      }
    }
    const pkg = this.options.pkg;
    const release = this.options.release ? this.options.release : pkg ? `${pkg.name}-${pkg.version}` : void 0;
    const scope = this.getScope();
    const payload = {
      event_id: crypto.randomUUID().replace(/-/g, ""),
      logger: "EdgeWorker",
      platform: "node",
      release,
      environment: this.options.environment,
      timestamp: this.timestamp(),
      level: "error",
      modules: pkg ? {
        ...pkg.dependencies,
        ...pkg.devDependencies
      } : void 0,
      ...additionalData,
      request: this.request,
      sdk: {
        name: "toucan-js",
        version: "2.6.1"
      }
    };
    scope.applyToEvent(payload);
    const beforeSend = (_a = this.options.beforeSend) !== null && _a !== void 0 ? _a : this.beforeSend;
    return beforeSend(payload);
  }
  toSentryRequest(request) {
    const cookieString = request.headers.get("cookie");
    let cookies = void 0;
    if (cookieString) {
      try {
        cookies = (0, import_cookie.parse)(cookieString);
      } catch (e2) {
      }
    }
    const headers = {};
    for (const [k, v] of request.headers.entries()) {
      if (k !== "cookie") {
        headers[k] = v;
      }
    }
    const rv = {
      method: request.method,
      cookies,
      headers
    };
    try {
      const url = new URL(request.url);
      rv.url = `${url.protocol}//${url.hostname}${url.pathname}`;
      rv.query_string = url.search;
    } catch (e2) {
      const qi = request.url.indexOf("?");
      if (qi < 0) {
        rv.url = request.url;
      } else {
        rv.url = request.url.substr(0, qi);
        rv.query_string = request.url.substr(qi + 1);
      }
    }
    return rv;
  }
  beforeSend(event) {
    const request = event.request;
    if (request) {
      const allowedHeaders = this.options.allowedHeaders;
      const allowedCookies = this.options.allowedCookies;
      const allowedSearchParams = this.options.allowedSearchParams;
      if (allowedHeaders) {
        request.headers = this.applyAllowlist(request.headers, allowedHeaders);
      } else {
        delete request.headers;
      }
      if (allowedCookies) {
        request.cookies = this.applyAllowlist(request.cookies, allowedCookies);
      } else {
        delete request.cookies;
      }
      if (allowedSearchParams) {
        const params = Object.fromEntries(new URLSearchParams(request.query_string));
        const allowedParams = new URLSearchParams();
        Object.keys(this.applyAllowlist(params, allowedSearchParams)).forEach((allowedKey) => {
          allowedParams.set(allowedKey, params[allowedKey]);
        });
        request.query_string = allowedParams.toString();
      } else {
        delete request.query_string;
      }
    }
    event.request = request;
    return event;
  }
  applyAllowlist(obj = {}, allowlist) {
    let predicate = (item) => false;
    if (allowlist instanceof RegExp) {
      predicate = (item) => allowlist.test(item);
    } else if (Array.isArray(allowlist)) {
      const allowlistLowercased = allowlist.map((item) => item.toLowerCase());
      predicate = (item) => allowlistLowercased.includes(item);
    } else {
      this.debug(() => this.warn("allowlist must be an array of strings, or a regular expression."));
      return {};
    }
    return Object.keys(obj).map((key) => key.toLowerCase()).filter((key) => predicate(key)).reduce((allowed, key) => {
      allowed[key] = obj[key];
      return allowed;
    }, {});
  }
  timestamp() {
    return Date.now() / 1e3;
  }
  async reportMessage(event) {
    return this.postEvent(event);
  }
  async reportException(event, maybeError) {
    let error;
    if (isError(maybeError)) {
      error = maybeError;
    } else if (isPlainObject(maybeError)) {
      const message = `Non-Error exception captured with keys: ${extractExceptionKeysForMessage(maybeError)}`;
      this.setExtra("__serialized__", normalizeToSize(maybeError));
      error = new Error(message);
    } else {
      error = new Error(maybeError);
    }
    const stacktrace = await this.buildStackTrace(error);
    event.exception = {
      values: [{ type: error.name, value: error.message, stacktrace }]
    };
    return this.postEvent(event);
  }
  async buildStackTrace(error) {
    var _a;
    if (this.options.attachStacktrace === false) {
      return void 0;
    }
    try {
      const stack = await (0, import_stacktrace_js.fromError)(error);
      const rewriteFrames = (_a = this.options.rewriteFrames) !== null && _a !== void 0 ? _a : {
        root: "~/",
        iteratee: (frame) => frame
      };
      return {
        frames: stack.map((frame) => {
          var _a2;
          const filename = (_a2 = frame.fileName) !== null && _a2 !== void 0 ? _a2 : "";
          const stackFrame = {
            colno: frame.columnNumber,
            lineno: frame.lineNumber,
            filename,
            function: frame.functionName
          };
          if (!!rewriteFrames.root) {
            stackFrame.filename = `${rewriteFrames.root}${stackFrame.filename}`;
          }
          return !!rewriteFrames.iteratee ? rewriteFrames.iteratee(stackFrame) : stackFrame;
        }).reverse()
      };
    } catch (e2) {
      return void 0;
    }
  }
  debug(callback) {
    if (this.options.debug) {
      return callback();
    }
  }
  log(message) {
    console.log(`toucan-js: ${message}`);
  }
  warn(message) {
    console.warn(`toucan-js: ${message}`);
  }
  error(message) {
    console.error(`toucan-js: ${message}`);
  }
  async logResponse(response) {
    var _a;
    let responseText = "";
    try {
      responseText = await response.text();
    } catch (e2) {
      responseText += "";
    }
    let origin = "Sentry";
    try {
      const originUrl = new URL(response.url);
      origin = originUrl.origin;
    } catch (e2) {
      origin = (_a = response.url) !== null && _a !== void 0 ? _a : "Sentry";
    }
    const msg = `${origin} responded with [${response.status} ${response.statusText}]: ${responseText}`;
    if (response.ok) {
      this.log(msg);
    } else {
      this.error(msg);
    }
  }
  getScope() {
    return this.scopes[this.scopes.length - 1];
  }
  pushScope() {
    const scope = Scope2.clone(this.getScope());
    this.scopes.push(scope);
    return scope;
  }
  popScope() {
    if (this.scopes.length <= 1)
      return false;
    return !!this.scopes.pop();
  }
};

// ../../node_modules/.pnpm/nanoid@4.0.0/node_modules/nanoid/non-secure/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// ../../node_modules/.pnpm/@web3-storage+worker-utils@0.3.0-dev/node_modules/@web3-storage/worker-utils/src/loki.js
var Logging = class {
  constructor(request, context, opts) {
    this.request = request;
    this.context = context;
    this.opts = opts;
    this._times = /* @__PURE__ */ new Map();
    this._timesOrder = [];
    this.logEventsBatch = [];
    this.startTs = Date.now();
    this.currentTs = this.startTs;
    const cf = request.cf;
    let rCf;
    if (cf) {
      const { tlsClientAuth, tlsExportedAuthenticator, ...rest } = cf;
      rCf = rest;
    }
    this.metadata = {
      request: {
        url: request.url,
        method: request.method,
        headers: buildMetadataFromHeaders(request.headers),
        cf: rCf
      },
      cloudflare_worker: {
        version: this.opts.version,
        commit: this.opts.commit,
        branch: this.opts.branch,
        worker_id: nanoid(10),
        worker_started: this.startTs
      }
    };
  }
  setUser(user) {
    this.metadata = {
      ...this.metadata,
      user
    };
    if (this.opts.sentry) {
      this.opts.sentry.setUser({
        id: `${user.id}`
      });
    }
  }
  async postBatch() {
    if (this.logEventsBatch.length > 0) {
      const batchInFlight = [...this.logEventsBatch];
      this.logEventsBatch = [];
      const rHost = batchInFlight[0].metadata.request.headers.host;
      const lokiBody = {
        streams: [
          {
            stream: {
              worker: this.opts.worker,
              env: this.opts.env
            },
            values: batchInFlight.map((batch) => [
              String(new Date(batch.dt).getTime() * 1e6),
              JSON.stringify(batch)
            ])
          }
        ]
      };
      const resp = await fetch(`${this.opts.url}/loki/api/v1/push`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.opts?.token}`,
          "Content-Type": "application/json",
          "User-Agent": `Cloudflare Worker via ${rHost}`
        },
        body: JSON.stringify(lokiBody)
      });
      if (this.opts?.debug) {
        console.info(`[${this._date()}]`, `${batchInFlight.length} Logs pushed with status ${resp.status}.`);
      }
    }
  }
  async end(response) {
    if (this.opts?.debug) {
      response.headers.set("Server-Timing", this._timersString());
    }
    const run = async () => {
      const dt = this._date();
      const duration = Date.now() - this.startTs;
      const log = {
        message: "",
        dt,
        level: "info",
        metadata: {
          ...this.metadata,
          response: {
            headers: buildMetadataFromHeaders(response.headers),
            status_code: response.status,
            duration
          }
        }
      };
      this._add(log);
      await this.postBatch();
    };
    if (this.opts.token) {
      this.context.waitUntil(run());
    }
    return response;
  }
  log(message, level, context = "", metadata) {
    const dt = this._date();
    let log = {
      dt,
      level,
      metadata: { ...this.metadata, ...metadata },
      ...context
    };
    if (message instanceof Error) {
      log = {
        ...log,
        stack: message.stack,
        message: message.message
      };
      if (this.opts.sentry) {
        this.opts.sentry.captureException(message);
      }
      if (this.opts?.debug) {
        console[level](`[${dt}] `, message.stack, context);
      }
    } else {
      log = {
        ...log,
        message
      };
      if (this.opts?.debug) {
        console[level](`[${dt}] `, message, context);
      }
    }
    this._add(log);
  }
  _add(body) {
    this.logEventsBatch.push(body);
  }
  debug(message, context) {
    return this.log(message, "debug", context);
  }
  info(message, context) {
    return this.log(message, "info", context);
  }
  warn(message, context) {
    return this.log(message, "warn", context);
  }
  error(message, context) {
    return this.log(message, "error", context);
  }
  time(name, description) {
    this._times.set(name, {
      name,
      description,
      start: Date.now()
    });
    this._timesOrder.push(name);
  }
  timeEnd(name) {
    const timeObj = this._times.get(name);
    if (!timeObj) {
      return console.warn(`No such name ${name}`);
    }
    const end = Date.now();
    const duration = end - timeObj.start;
    const value = duration;
    timeObj.value = value;
    this._times.set(name, {
      ...timeObj,
      end,
      duration
    });
    if (this.opts?.debug) {
      console.log(`[${this._date()}]`, `${name}: ${duration} ms`);
    }
    return timeObj;
  }
  _date() {
    const now = Date.now();
    if (now === this.currentTs) {
      const dt = new Date().toISOString();
      const newDt = dt.replace(/\.(\d*)Z/, (s, p1, p2) => {
        return `.${String(Number(p1) + this.logEventsBatch.length)}Z`;
      });
      return new Date(newDt).toISOString();
    } else {
      this.currentTs = now;
      return new Date().toISOString();
    }
  }
  _timersString() {
    const result = [];
    for (const key of this._timesOrder) {
      const { name, duration, description } = this._times.get(key);
      result.push(description ? `${name};desc="${description}";dur=${duration}` : `${name};dur=${duration}`);
    }
    return result.join(",");
  }
};
var buildMetadataFromHeaders = (headers) => {
  const responseMetadata = {};
  for (const [key, value] of headers) {
    responseMetadata[key.replace(/-/g, "_")] = value;
  }
  return responseMetadata;
};

// package.json
var package_default = {
  name: "w3link-edge-gateway",
  version: "1.3.0",
  description: "IPFS edge gateway for web3.storage on leto.gg",
  private: true,
  type: "module",
  main: "./dist/worker.js",
  scripts: {
    build: "node scripts/cli.js build",
    dev: "miniflare dist/worker.js --watch --debug -m",
    deploy: "wrangler publish --env production",
    test: "npm run test:setup && npm run test:worker",
    "test:worker": "ava --verbose test/*.spec.js",
    "test:setup": "npm run build"
  },
  dependencies: {
    "itty-router": "^2.4.5",
    multiformats: "^9.6.4",
    "p-retry": "^5.1.2",
    "toucan-js": "^2.5.0"
  },
  devDependencies: {
    "@cloudflare/workers-types": "^3.7.1",
    "@types/git-rev-sync": "^2.0.0",
    "@sentry/cli": "^1.71.0",
    "@web-std/fetch": "^4.0.0",
    "@web3-storage/worker-utils": "^0.3.0-dev",
    ava: "^3.15.0",
    "browser-env": "^3.3.0",
    delay: "^5.0.0",
    esbuild: "^0.14.2",
    execa: "^5.1.1",
    "git-rev-sync": "^3.0.1",
    miniflare: "^2.5.0",
    sade: "^1.7.4",
    smoke: "^3.1.1",
    typescript: "4.7.3",
    toml: "^3.0.0"
  },
  author: "Vasco Santos <santos.vasco10@gmail.com>",
  license: "Apache-2.0 OR MIT"
};

// src/env.js
function envAll(request, env, ctx) {
  env.IPFS_GATEWAY_HOSTNAME = env.GATEWAY_HOSTNAME;
  env.IPNS_GATEWAY_HOSTNAME = env.GATEWAY_HOSTNAME.replace("ipfs", "ipns");
  env.BRANCH = "Gateway_Config_Two";
  env.VERSION = "1.3.0";
  env.COMMITHASH = "e260adadcb320685def3d770d9978f801b7ded0e";
  env.SENTRY_RELEASE = "w3link-edge-gateway@1.3.0-dev+e260ada";
  env.sentry = getSentry(request, env, ctx);
  env.log = new Logging(request, ctx, {
    url: env.LOKI_URL,
    token: env.LOKI_TOKEN,
    debug: Boolean(env.DEBUG),
    version: env.VERSION,
    commit: env.COMMITHASH,
    branch: env.BRANCH,
    worker: "leto.gg",
    env: env.ENV,
    sentry: env.sentry
  });
  env.log.time("request");
}
function getSentry(request, env, ctx) {
  if (!env.SENTRY_DSN) {
    return;
  }
  return new Toucan({
    request,
    dsn: env.SENTRY_DSN,
    context: ctx,
    allowedHeaders: ["user-agent"],
    allowedSearchParams: /(.*)/,
    debug: false,
    environment: env.ENV || "dev",
    rewriteFrames: {
      root: "/"
    },
    release: env.SENTRY_RELEASE,
    pkg: package_default
  });
}

// src/index.js
var router = e();
router.all("*", envAll).get("/version", withCorsHeaders(versionGet)).get("/ipfs/:cid", withCorsHeaders(ipfsGet)).get("/ipfs/:cid/*", withCorsHeaders(ipfsGet)).head("/ipfs/:cid", withCorsHeaders(ipfsGet)).head("/ipfs/:cid/*", withCorsHeaders(ipfsGet)).get("/ipns/:name", withCorsHeaders(ipnsGet)).get("/ipns/:name/*", withCorsHeaders(ipnsGet)).get("*", withCorsHeaders(gatewayGet)).head("*", withCorsHeaders(gatewayGet));
function serverError(error, request, env) {
  return addCorsHeaders(request, errorHandler(error, env));
}
var src_default = {
  async fetch(request, env, ctx) {
    try {
      const res = await router.handle(request, env, ctx);
      env.log.timeEnd("request");
      return env.log.end(res);
    } catch (error) {
      if (env.log) {
        env.log.timeEnd("request");
        return env.log.end(serverError(error, request, env));
      }
      return serverError(error, request, env);
    }
  }
};
export {
  src_default as default
};
