"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var log = {
  success: function success(message) {
    console.log("\u2713 " + message + " :)");
  },
  fail: function fail(message) {
    console.log("\u2714 " + message);
  }
};

exports.default = log;
//# sourceMappingURL=log.js.map