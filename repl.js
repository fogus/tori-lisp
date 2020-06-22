const repl = require("repl");
var 鳥 = require("./lisp").lisp;

repl.start({
  prompt: "鳥 ",
  eval: function(cmd, context, filename, callback) {
    var ret = 鳥.evil(L.core, 鳥.read(cmd));
    callback(null, ret);
  }
});

