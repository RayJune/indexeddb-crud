'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function requestPromise(request, successMessage, data) {
  return new Promise(function (resolve, reject) {
    request.onsuccess = function () {
      var successData = data;

      if (data.property) {
        successData = request[data.property]; // for getItem
      }
      _log2.default.success(successMessage);
      resolve(successData);
    };
    request.onerror = function () {
      _log2.default.fail(request.error);
      reject();
    };
  });
}

function transactionPromise(transaction, successMessage, data) {
  return new Promise(function (resolve, reject) {
    transaction.oncomplete = function () {
      _log2.default.success(successMessage);
      resolve(data);
    };
    transaction.onerror = function () {
      _log2.default.fail(transaction.error);
      reject();
    };
  });
}

exports.default = {
  request: requestPromise,
  transaction: transactionPromise
};
//# sourceMappingURL=promiseGenerator.js.map