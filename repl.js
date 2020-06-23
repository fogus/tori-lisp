const repl = require("repl");
const fs = require('fs');

var 鳥 = require("./lisp").lisp;

console.log("Starting tori-lisp v" + 鳥.VERSION + "...");
process.argv.slice(2).forEach(function(infile) {
    var src = fs.readFileSync(infile, "utf8");
    console.log("...loading " + infile);
    console.log(src);
});
console.log("done\n");

repl.start({
  prompt: "鳥 ",
    eval: function(cmd, context, filename, callback) {
	var ret = 鳥.evil(鳥.core, 鳥.read(cmd));
	callback(null, ret);
  }
});

