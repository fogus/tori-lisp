const repl = require("repl");
var 鳥 = require("./lisp").lisp;

console.log("Starting tori-lisp version " + 鳥.VERSION + "...\n");

repl.start({
  prompt: "鳥 ",
    eval: function(cmd, context, filename, callback) {
	var ret = 鳥.evil(鳥.core, 鳥.read(cmd));
	callback(null, ret);
  }
});

