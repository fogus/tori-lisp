const repl = require('repl');
const fs = require('fs');
const util = require('util');

var 鳥 = require("./lisp").lisp;
var rdr = new 鳥.Rdr();

const writer = (obj) => ";;=> " + util.inspect(obj, writer.options);
writer.options = { ...util.inspect.defaultOptions, showProxy: true, colors: true };

console.log("Starting tori-lisp reader v" + 鳥.VERSION + "...");

repl.start({
  prompt: "鳥r>  ",
  eval: function(cmd, context, filename, callback) {
    var ret = rdr.read_sexpr(cmd, { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid');
    callback(null, ret);
  },
  writer: writer
});

