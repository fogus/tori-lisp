;(function(exports) {
  var sym = function(token) {
    return "'" + token;
  }

  var CRLF = sym("crlf");
  
  var _array = function(arr, from) {
    return Array.prototype.slice.call(arr, from || 0);
  };

  var garner_params = function(fn) {  
    return (fn + '')
      .replace(/[/][/].*$/mg,'') // strip single-line comments
      .replace(/\s+/g, '') // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
      .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
      .replace(/=[^,]+/g, '') // strip any ES6 defaults  
      .split(',').filter(Boolean); // split & filter [""]
  }

  var compareObjects = function(l, r) {
    if (Array.isArray(l) && Array.isArray(r)) {
      // a man's array does not look like a girl's array
      if (l.length !== r.length) return false
    }

    const keys = Object.keys(l)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (Array.isArray(l[key])) {
	if (Array.isArray(r[key])) {
          // a man has an array, a girl has a different array
          if (!_eqvp(l[key], r[key])) return false
          // a man may share an array with a girl
          continue
	}
	// a man has an array, a girl does not
	return false
      }

      // account for date objects
      if (l[key] instanceof Date) {
	if (r[key] instanceof Date) {
          if (l[key].valueOf() !== r[key].valueOf()) return false
          continue
	}
	return false
      }

      // account for regexp
      if (l[key] instanceof RegExp) {
	if (r[key] instanceof RegExp) {
          if (l[key].toString() !== r[key].toString()) return false
          continue
	}
	return false
      }

      if (typeof l[key] === 'object') {
	if (typeof r[key] === 'object' && !Array.isArray(r[key])) {
          // a man has an object, a girl has a different object
          if (!_compare(l[key], r[key])) return false
          continue
	}
	// a man has an object, a girl does not
	return false
      }
      // a man has values that a girl does not share
      if (l[key] !== r[key]) return false
    }

    return true
  }
  
  var flip = function(fn) {
    return function(first, second) {
      var rest = [].slice.call(arguments, 2)
      return fn.apply(null, [second, first].concat(rest))
    }
  }
  
  var mangle = function(token) {
    if (!isNaN(parseFloat(token))) {
      return parseFloat(token);
    }
    else if (token[0] === '"' && token.slice(-1) === '"') {
      return token.slice(1, -1);
    }
    else if (token == "#t") {
      return true;
    }
    else if (token == "#f") {
      return false;
    }
    else {
      return sym(token);
    }
  }

  var procedure = function(env, params, body) {
    var fn = function() {
      var args = arguments;
      var context = params.reduce(function(ctx, param, index) {
	ctx[param] = args[index];
	return ctx;
      }, {});
      
      context[PARENT_ID] = env;
      return _eval(context, body);
    }

    fn.body   = body;
    fn.params = params;

    return fn;
  }
  
  var auto_curry = (function () {
    var curry = function curry(fn /* variadic number of args */) {
      var args = _array(arguments, 1);
      return function curried() {
        return fn.apply(this, args.concat(_array(arguments)));
      };
    };
    
    return function auto_curry(fn, expectedArgs) {
      var params = fn.params || garner_params(fn);
      var body   = fn.body   || fn;
      
      expectedArgs = expectedArgs || fn.length;
      var ret =  function curried() {
	var remaining = expectedArgs - arguments.length;
	
        if (arguments.length < expectedArgs) {
	  if (remaining > 0) {
	    return auto_curry(curry.apply(this, [fn].concat(_array(arguments))), expectedArgs - arguments.length);
	  }
	  else {
            return curry.apply(this, [fn].concat(_array(arguments)));
	  }
        }
        else if (arguments.length > expectedArgs) {
	  throw new Error("Too many arguments to function: expected " + expectedArgs + ", got " + arguments.length);
	}
	else {
          return fn.apply(this, arguments);
        }
      };

      ret.body   = body;
      ret.params = params; // TODO: calculate the remaining args and only return those.
      return ret;
    };
  }());

  var _apply  = auto_curry(function(fn, args) {
    return fn.apply(null, args);
  }, 2);

  var _eqvp = auto_curry(function(l, r) {
    if (l && r && ((Array.isArray(l) && Array.isArray(r)) || (typeof l === 'object' && typeof r === 'object')) && (l.length === r.length)) {
      return compareObjects(l, r)
    }

    return l === r;
  }, 2);
  
  var _first  = function(seq) { return seq[0] };
  var _second = function(seq) { return seq[1] };
  var _rest   = function(seq) { return seq.slice(1) };
  var _head   = function(seq) { return [seq[0]]; };
  var _last   = function(seq) { return seq[seq.length - 1]; };
  var _cons   = auto_curry(function(elem, seq) {
    return [elem].concat(seq);
  }, 2);

  var _plus = auto_curry(function(l, r) {
    return l + r;
  }, 2);

  var _minus = auto_curry(function(l, r) {
    return l - r;
  }, 2);
  
  var _div = auto_curry(function(l, r) {
    return l / r;
  }, 2);

  var _mult = auto_curry(function(l, r) {
    return l * r;
  }, 2);

  var _lt = auto_curry(function(l, r) {
    return l < r;
  }, 2);

  var _gt = auto_curry(function(l, r) {
    return l > r;
  }, 2);

  var _oddp  = function(n) { return (n % 2) > 0 };
  var _evenp = function(n) { return (n % 2) === 0 };

  var _isp = auto_curry(function(l, r) {
    return l === r;
  }, 2);
  
  var _len   = function(thing) {
    if (existy(thing)) {
      return thing.length || thing.size || thing.params.length;
    }

    return undefined;
  }

  var comparator = function(pred) {
    return function(l, r) {
      if (pred(l, r)) return -1;

      return 1;
    };
  }
  
  var _sort = auto_curry(function(pred, ary) {
    
    var ret = ary.slice(0).sort(comparator(pred));
    return ret;
  }, 2);
  
  var _str   = function() {
    return Array.from(arguments).map(e => toS(e)).join("");
  }
  
  var _no    = function(thing) {
    if (existy(thing) && existy(thing.length)) {
      return thing.length === 0;
    }

    if (is_bool(null, thing)) return !thing;

    return false;
  };
  
  /** I/O functions **/
  var _out = function(to) {
    var rest = [].slice.call(arguments, 1);
    var ret = true;

    for (var elem of rest) {
      if(elem.valueOf() == CRLF) {
	ret = to.call(this, "\n");
      }
      else {
	ret = to.call(this, toS(elem));
      }
    }

    return ret;
  }

  /** Combinators **/
  
  var _comp = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
  var _juxt = (...fns) => x => fns.map((f) => f(x));

  /** Array manipulation **/

  var _push = auto_curry(function(ary, elem) {
    return _cons(elem, ary);
  }, 2);

  var _pop = function(ary) {
    return _rest(ary);
  };
  
  /** Hash Maps **/

  var _hash = function(...elems) {
    var pairs = part(2, elems);
    var last  = _last(pairs);

    if (!existy(last)) return new Map();
    if (last.length === 1) throw new Error("hash expects an even number of arguments");
    
    return new Map(pairs);
  }

  var _set = function(target, key, value) {
    var copy = new Map(target);
    copy.set(key, value);
    return copy;
  }

  var _get = function(target, key) {
    return target.get(key);
  }

  var _keys  = (hash) => Array.from(hash.keys());
  var _vals  = (hash) => Array.from(hash.values());
  var _pairs = (hash) => Array.from(hash.entries());
  
  /** Meta functions **/
  var _body = function(fn) {
    return _rest(fn.body);
  }

  var _params = function(fn) {
    return fn.params;
  }

  var part = function(n, array) {
    var i, j;
    var res = [];
    
    for (i = 0, j = array.length; i < j; i += n) {
      res.push(array.slice(i, i+n));
    }

    return res;
  }

  var garner_bindings = function(env, binds) {
    if (is_seq(env, binds)) {
      return binds;
    }
    else {
      var keys = [];
      for (var key in binds) {
	keys.push(key);
      }
      
      return keys.map(index => binds[index]);
    }
  }

  var doify = function(form) {
    return _cons("'do", form);
  }
  
  var PARENT_ID = "'_PARENT";
  
  var lookup = function(env, id) {
    if (id in env) {
      return env[id];
    } else if (PARENT_ID in env) {
      return lookup(env[PARENT_ID], id);
    }
    console.log(id + " not set in " + Object.keys(env));
  };

  var existy = function(val) { return val != null; };
  
  var truthy = function(val) {
    return (val !== false) && existy(val) && (val.length !== 0);
  }
  
  var SPECIAL_FORMS = {
    "'quote": function(env, form) {
      return _second(form);
    },
    "'do": function(env, form) {
      var ret = null;
      var body = _rest(form);

      for (var i = 0; i < body.length; i++) {
	ret = _eval(env, body[i]);
      }

      return ret;
    },
    "'if": function(env, form) {
      return truthy(_eval(env, form[1])) ? _eval(env, form[2]) : _eval(env, form[3]);
    },
    "'cond": function(env, form) {
      var pairs = part(2, _rest(form));
      if (pairs[pairs.length - 1].length === 1) throw new Error("cond expects an even number of condition pairs");

      for (var i = 0; i < pairs.length; i++) {
	var elem = pairs[i];
	var condition = _eval(env, elem[0]);

	if (truthy(condition)) return _eval(env, elem[1]);
      };
      
      return null;
    },
    "'let": function(env, form) {
      var binds = part(2, form[1]);

      var scope = binds.reduce(function (acc, pair) {
        acc[pair[0]] = _eval(env, pair[1]);
        return acc;
      }, {"'_PARENT": env});

      return _eval(scope, form[2]); // TODO doify 
    },
    "'def": function(env, form) {
      var bind = _rest(form);
      var name = _first(bind);

      if (!is_symbol(env, name)) throw new Error("Non-symbol found in LHS of `def` form: " + name);

      var val  = _eval(env, _second(bind));

      env[name] = val;
      return val;
    },
    "'λ": function(env, form) {
      var params = garner_bindings(env, _second(form));
      var body   = doify(_rest(_rest(form)));

      if (params.length < 2) return procedure(env, params, body);

      return auto_curry(procedure(env, params, body), params.length);
    },
    "'and": function(env, form) {
      var args = _rest(form);
      var ret = true;

      for (var i=0; i < args.length; i++) {
	ret = _eval(env, args[i]);
	if (!truthy(ret)) return ret;
      }
	
      return ret;
    },
    "'or": function(env, form) {
      var args = _rest(form);
      var ret = false;

      for (var i=0; i < args.length; i++) {
	ret = _eval(env, args[i]);
	if (truthy(ret)) return ret;
      }
	
      return ret;
    }      
  };
  
  var toString = Object.prototype.toString;

  var garner_type = function(obj) {
    return toString.call(obj);
  };

  var is_number = function (env, form) {
    return garner_type(form) == "[object Number]";
  }
  
  var is_string = function(env, form) {
    return garner_type(form) == "[object String]";
  }

  var is_bool = function(env, form) {
    return form === true || form === false || (garner_type(form) == "[object Boolean]");
  }
  
  var is_seq = function(env, form) {
    return Array.isArray(form);
  }

  var is_hash = function(env, form) {
    return garner_type(form) == "[object Map]";
  }
  
  var is_fun = function(env, form) {
    return garner_type(form) == "[object Function]";
  }
  
  var is_symbol = function (env, form) {
    if (is_string(env, form)) {
      return form.charAt(0) == "'";
    }
    else {
      return false;
    }
  }

  var is_self_evaluating = function (env, form) {
    return is_number(env, form)
      || is_string(env, form)
      || is_bool(env, form);
  }

  var evlis = function(env, form) {
    var op = form[0];

    if ((form.length > 0) && (op in SPECIAL_FORMS)) {
      return SPECIAL_FORMS[form[0]](env, form);
    }
    else if (!is_symbol(env,op) && is_string(env, op)) {
      var args = _rest(form);

      if (args.length === 1) 
	return op.charAt(_second(form));
      else
	return op.slice.apply(op, args);
    }
    else {
      var callable = _eval(env, op);

      if (is_fun(env, callable)) {
	var args = form.slice(1).map(e => _eval(env, e));
	return callable.apply(undefined, args);
      }
      else if (is_hash(env, callable)) {
	var args = form.slice(1).map(e => _eval(env, e));
	return Map.prototype.get.apply(callable, args);
      }
      else {
	throw new Error("Non-function found in head of array: " + op);
      }
    }
  }
  
  var _eval = function(env, form) {
    if (env === undefined) return _eval(CORE, form);
    
    var type = garner_type(form);
    
    if (is_symbol(env, form)) {
      return lookup(env, form);
    }
    else if (is_self_evaluating(env, form)) {
      return form;
    }
    else if (is_seq(env, form)) {
      return evlis(env, form);
    }
  }
  
  var toS = function(obj) {
    if (is_seq({}, obj)) {
      return "[" + obj.map(toS) + "]";
    }
    else if (is_symbol({}, obj)) {
      return obj.substring(1);
    }
    else {
      return "" + obj;
    }
  }

  var tokenize = function(input) {
    return input.split('"')
      .map(function(x, i) {
        if (i % 2 === 0) { // not in string
          return x.replace(/\(/g, ' ( ')
            .replace(/\)/g, ' ) ')
            .replace(/\{/g, ' { ')
            .replace(/\}/g, ' } ')
            .replace(/\|/g, ' | ')
            .replace(/\'/g, " ' ");
        } else { // in string
          return x.replace(/ /g, "!whitespace!");
        }
      })
      .join('"')
      .trim()
      .split(/\s+/)
      .map(function(x) {
        return x.replace(/!whitespace!/g, " ");
      });
  };

  var _read = function(s) {
    var rdr = new Rdr();
    return rdr.read_sexpr(s);
  };

  var CORE = {
    "'apply":     _apply,
    "'first":  	  _first,
    "'rest":   	  _rest,
    "'head":   	  _head,
    "'last":      _last,
    "'cons":   	  _cons,
    "'meta/body	  ":   _body,
    "'meta/para	  ms": _params,    
    "'read":   	  _read,
    "'eval":   	  flip(_eval),
    "'nil":       [],
    "'true":      true,
    "'false":     false,
    "'undefined": undefined,
    "'out":    	  _out,
    "'<c>":    	  process.stdout.write.bind(process.stdout),
    "'crlf":   	  CRLF,
    "'+":      	  _plus,
    "'-":      	  _minus,
    "'*":      	  _mult,    
    "'/":      	  _div,
    "'<":      	  _lt,
    "'>":      	  _gt,
    "'even?":  	  _evenp,
    "'odd?":   	  _oddp,
    "'len":       _len,
    "'no":        _no,
    "'is?":       _isp,
    "'eqv?":      _eqvp,
    "'comp":      _comp,
    "'juxt":      _juxt,
    "'hash":      _hash,
    "'set":       _set,
    "'get":       _get,
    "'keys":      _keys,
    "'vals":      _vals,
    "'pairs":     _pairs,
    "'str":       _str,
    "'push":      _push,
    "'pop":       _pop,
    "'sort":      _sort
  };

  /* Lisp reader */
  
  var Rdr = function(str = null) {
    this.raw = str;
    this.index = 0;
    this.length = 0;
    this.sexpr = [];
    this.SPECIAL = ['(', ')', '{', '}'];
    this.CONTEXT = {};

    if (str) {
      this.sexpr = this.read_sexpr();
    }
  };

  Rdr.prototype.read_sexpr = function(src=null) {
    if (src) {
      this.raw = tokenize(src);
      this.length = this.raw.length;
      this.index = 0;
    }

    var token = this.read_token();
    var expr = null;

    if ((token === ')') || (token === '}')) {
      throw new Error("Unexpected closing bracket '" + token + "'");
    }

    if (token === '(') {
      expr = [];

      token = this.read_token();

      while (token !== ')') {
	if (token === '(') {
	  this.prev();
	  expr.push(this.read_sexpr());
	}
	else if (token === null) {
	  throw new Error("Invalid end of s-expression!");
	}
	else {
	  this.prev();
	  expr.push(this.read_sexpr());
	}

	token = this.read_token();
      }

      return expr;
    }
    else if (token === "'") {
      expr = ["'quote"];
      sexpr = this.read_sexpr();
      expr.push(sexpr);
      return expr;
    }
    else if (token === '{') {
      var fn = ["'λ"];
      var params = [];
      var expr = params;
      var body = [];
      var hasParams = false;

      token = this.read_token();

      while (token !== '}') {
	if (token === '(') {
	  this.prev();
	  expr.push(this.read_sexpr());
	}
	else if (token === null) {
	  throw new Error("Invalid end of s-expression!");
	}
	else if (token === "'|") {
	  hasParams = true;
	  expr = body;
	}
	else {
	  this.prev();
	  expr.push(this.read_sexpr());
	}

	token = this.read_token();
      }

      if (hasParams) {
	fn.push(params);
        return fn.concat(body);
      }
      else {
	fn.push([]);
        return fn.concat(params);
      }	
    }
    
    return token;
  }

  Rdr.prototype.read_token = function() {
    if (this.index >= this.length) return null;

    var ret = null;

    if (this.SPECIAL.includes(this.current())) {      
      ret = this.current();
      this.next();
      return ret;
    }
    else if(is_string(this.CONTEXT, this.current())) {
      ret = this.current();
      this.next();

      if (ret === "'") return "'";
      
      return mangle(ret);
    }

    return null;
  }

  Rdr.prototype.current = function() {
    return this.raw[this.index];
  }

  Rdr.prototype.next = function() {
    return this.index += 1;
  }

  Rdr.prototype.prev = function() {
    return this.index -= 1;
  }
  
  exports.lisp = {
    VERSION: "0.4.5",
    read: _read,
    evil: _eval,
    Rdr: Rdr,
    core: CORE,
  };
})(typeof exports === 'undefined' ? this : exports);
