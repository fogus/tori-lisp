;(function(exports) {
  var sym = function(token) {
    return "'" + token;
  }

  var _first  = function(seq) { return seq[0] };
  var _second = function(seq) { return seq[1] };
  var _rest   = function(seq) { return seq.slice(1) };
  var _head   = function(seq) { return [seq[0]]; };
  // TODO curry this
  var _cons   = function(elem, seq) {
    return [elem].concat(seq);
  };

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

  var autoCurry = (function () {
    var toArray = function toArray(arr, from) {
      return Array.prototype.slice.call(arr, from || 0);
    };
	
    var curry = function curry(fn /* variadic number of args */) {
      var args = toArray(arguments, 1);
      return function curried() {
        return fn.apply(this, args.concat(toArray(arguments)));
      };
    };
    
    return function autoCurry(fn, numArgs) {
      numArgs = numArgs || fn.length;
      return function autoCurried() {
        if (arguments.length < numArgs) {
          return numArgs - arguments.length > 0 ?
            autoCurry(curry.apply(this, [fn].concat(toArray(arguments))), numArgs - arguments.length) :
            curry.apply(this, [fn].concat(toArray(arguments)));
        }
        else {
          return fn.apply(this, arguments);
        }
      };
    };
    
  }());
  
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

  var SPECIAL_FORMS = {
    "'do": function(env, form) {
      var ret = null;
      var body = _rest(form);

      for (var i = 0; i < body.length; i++) {
	ret = _eval(env, body[i]);
      }

      return ret;
    },
    "'if": function(env, form) {
      return _eval(env, form[1]) ? _eval(env, form[2]) : _eval(env, form[3]);
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

      var ret =  autoCurry(function() {
	var args = arguments;
	var context = params.reduce(function(ctx, param, index) {
	  ctx[param] = args[index];
	  return ctx;
	}, {});

	context[PARENT_ID] = env;
	return _eval(context, doify(_rest(_rest(form))));
      }, params.length);

      return ret;
    }
  };
  
  var CORE = {
    "'first": _first,
    "'rest":  _rest,
    "'head":  _head,
    "'cons":  _cons,
    "'LIST":  [1,2,3]
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
    return garner_type(form) == "[object Boolean]";
  }
  
  var is_seq = function(env, form) {
    return garner_type(form) == "[object Array]";
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
    var head = form[0];
    
    if ((form.length > 0) && (head in SPECIAL_FORMS)) {
      return SPECIAL_FORMS[form[0]](env, form);
    }
    else {
      var fn = _eval(env, head);

      if (is_fun(env, fn)) {
	var args = form.slice(1).map(e => _eval(env, e));
	return fn.apply(undefined, args);
      }
      else {
	throw new Error("Non-function found in head of array: " + head);
      }
    }
  }
    
  var _eval = function(env, form) {
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
  
  var read_quotation = function(input, list) {
    var binds = {};
    var has_elems = true;
    var index = 0;

    while(has_elems) {
      var token = input.shift();

      if (token === "|") {
        has_elems = false;
      } else if (token !== undefined) {
        binds[index++] = mangle(token);
      } else {
        throw new Error("Unknown form in quotation: " + token);
      }
    }

    return binds;
  }
    
  var reader = function(input, list, qdepth = 0) {
    if (list === undefined) {
      return reader(input, []);
    } else {
      var token = input.shift();
      if (token === undefined) {
        return list.pop();
      } else if (token === "(") {
        list.push(reader(input, []));
        return reader(input, list);
      } else if (token === ")") {
        return list;
      } else if (token === "{") {
        list.push("'λ");
        list.push(reader(input, list));
        return reader(input, list);
      } else if (token === "}") {
        return list;
      } else if (token === "|") {
        return read_quotation(input, list);
      } else if (token === "'") {
        list.push("'quote");
        list.push(reader(input, []));
        return list;
      } else {
        return reader(input, list.concat(mangle(token)));
      }
    }
  };

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
    return reader(tokenize(s));
  };

  exports.lisp = {
    VERSION: "0.0.5",
    read: _read,
    evil: _eval,
    core: CORE,
  };
})(typeof exports === 'undefined' ? this : exports);
