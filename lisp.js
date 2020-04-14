;(function(exports) {
  var mangle = function(token) {
    if (!isNaN(parseFloat(token))) {
      return parseFloat(token);
    }
    else if (token[0] === '"' && token.slice(-1) === '"') {
      return token.slice(1, -1);
    }
    else {
      return "'" + token;
    }
  }

  var read_bindings = function(input, list) {
    var binds = {};
    var has_args = true;
    var index = 0;

    while(has_args) {
      var token = input.shift();

      if (token === "|") {
        has_args = false;
      } else if (token !== undefined) {
        binds[index++] = mangle(token);
      } else {
        throw new Error("Unknown form in function literal: " + token);
      }
    }

    return binds;
  }
    
  var reader = function(input, list) {
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
        return read_bindings(input, list);
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
                       .replace(/\|/g, ' | ');
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

  var Thunk = function() {
  } 

  var make_thunk = function(body, expected, got) {
    var t = new Thunk();
    t.body = body;
    t.expected = expected;
    t.got = got;

    return t;
  }

  Thunk.prototype.apply = function() {
    var args  = Array.prototype.slice.call(arguments);
    var all_args = this.got.concat(args[1]);

    if (all_args.length < this.expected) {
      return make_thunk(this.body, this.expected, all_args);
    }
    else if (all_args.length > this.expected) {
      throw new Error("Invalid arity: " + args.length);
    }


    return this.body.apply(null, all_args);
  }

  function defun(body, expected) {
    return function() {
      var args = Array.prototype.slice.call(arguments);

      if (args.length < expected) {
        return make_thunk(body, expected, args);
      }
      else if (args.length > expected) {
        throw new Error("Invalid arity: " + args.length);
      }

      return body.apply(null, args);
    }
  }

  exports.lisp = {
    read: _read,
    defun: defun,
    Thunk: Thunk,
    make_thunk : make_thunk
  };
})(typeof exports === 'undefined' ? this : exports);
