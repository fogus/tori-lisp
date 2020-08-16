const repl = require('repl');
const fs = require('fs');
const util = require('util');

var 鳥 = require("./lisp").lisp;

const writer = (obj) => ";;=> " + util.inspect(obj, writer.options);
writer.options = { ...util.inspect.defaultOptions, showProxy: true, colors: true };

console.log("Starting tori-lisp v" + 鳥.VERSION + "...");
process.argv.slice(2).forEach(function(infile) {
  var src = fs.readFileSync(infile, "utf8");
  console.log("...loading " + infile);
  鳥.evil(鳥.core, 鳥.read("(do " + src + ")"));
});
console.log("done\n");

repl.start({
  prompt: "鳥>  ",
  eval: function(cmd, context, filename, callback) {
    var ret = 鳥.evil(鳥.core, 鳥.read(cmd));
    callback(null, ret);
  },
  writer: writer
});

