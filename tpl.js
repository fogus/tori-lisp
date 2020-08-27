const repl = require('repl');
const fs = require('fs');
const util = require('util');

var 鳥 = require("./lisp").lisp;

const writer = (obj) => ";;=> " + util.inspect(obj, writer.options);
writer.options = { ...util.inspect.defaultOptions, showProxy: true, colors: true };

console.log("Starting tori-lisp tokenizer v" + 鳥.VERSION + "...");

repl.start({
  prompt: "鳥t>  ",
  eval: function(cmd, context, filename, callback) {
    var ret = {"1" : 鳥.tokenize1(cmd, { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid'),
	       "2" : 鳥.tokenize2(cmd, { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid')};
    callback(null, ret);
  },
  writer: writer
});

