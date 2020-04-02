var repl = require("repl");
var L = require("./lisp").lisp;

repl.start({
  prompt: "鳥 ",
  eval: function(cmd, context, filename, callback) {
    var ret = L.read(cmd);
    callback(null, ret);
  }
});

