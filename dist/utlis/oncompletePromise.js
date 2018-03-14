'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var promiseGenerator = {
  request: function request(_request, successMessage, data) {
    return new Promise(function (resolve, reject) {
      _request.onsuccess = function () {
        var successData = data;

        if (data.property) {
          successData = _request[data.property]; // for getItem
        }
        _log2.default.success(successMessage);
        resolve(successData);
      };
      _request.onerror = function () {
        _log2.default.fail(_request.error);
        reject();
      };
    });
  },
  transaction: function transaction(_transaction, successMessage) {
    return new Promise(function (resolve, reject) {
      _transaction.oncomplete = function () {
        _log2.default.success(successMessage);
        resolve();
      };
      _transaction.onerror = function () {
        reject();
      };
    });
  }
};

exports.default = promiseGenerator;
//# sourceMappingURL=oncompletePromise.js.map