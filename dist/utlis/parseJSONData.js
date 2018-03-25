"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function parseJSONData(rawdata, name) {
  try {
    var parsedData = JSON.parse(JSON.stringify(rawdata));

    return parsedData;
  } catch (error) {
    window.alert("please set correct " + name + " array object");
    console.log(error);
    throw error;
  }
}

exports.default = parseJSONData;
//# sourceMappingURL=parseJSONData.js.map