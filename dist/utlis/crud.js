'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _requestPromise = require('./requestPromise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _getAllRequest = require('./getAllRequest');

var _getAllRequest2 = _interopRequireDefault(_getAllRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(dbValue, key, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var getRequest = transaction.objectStore(storeName).get(parseInt(key, 10)); // get it by index
  var successMessage = 'get ' + storeName + '\'s ' + getRequest.source.keyPath + ' = ' + key + ' data success';
  var data = { property: 'result' };

  return (0, _requestPromise2.default)(getRequest, successMessage, data);
}

// get conditional data (boolean condition)
function getWhetherCondition(dbValue, condition, whether, successCallback, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var result = []; // use an array to storage eligible data

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref) {
    var target = _ref.target;

    var cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        result.push(cursor.value);
      }
      cursor.continue();
    }
  };
  transaction.oncomplete = function () {
    _log2.default.success('get ' + storeName + '\'s ' + condition + ' = ' + whether + ' data success');
    if (successCallback) {
      successCallback(result);
    }
  };
}

function getAll(dbValue, successCallback, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var result = [];

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref2) {
    var target = _ref2.target;

    var cursor = target.result;

    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }
  };
  transaction.oncomplete = function () {
    _log2.default.success('get ' + storeName + '\'s all data success');
    if (successCallback) {
      successCallback(result);
    }
  };
}

function add(dbValue, newData, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var addRequest = transaction.objectStore(storeName).add(newData);
  var successMessage = 'add ' + storeName + '\'s ' + addRequest.source.keyPath + '  = ' + newData[addRequest.source.keyPath] + ' data succeed';

  return (0, _requestPromise2.default)(addRequest, successMessage, newData);
}

function remove(dbValue, key, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var deleteRequest = transaction.objectStore(storeName).delete(key);
  var successMessage = 'remove ' + storeName + '\'s  ' + deleteRequest.source.keyPath + ' = ' + key + ' data success';

  return (0, _requestPromise2.default)(deleteRequest, successMessage, key);
}

function removeWhetherCondition(dbValue, condition, whether, successCallback, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref3) {
    var target = _ref3.target;

    var cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        cursor.delete();
      }
      cursor.continue();
    }
  };
  transaction.oncomplete = function () {
    _log2.default.success('remove ' + storeName + '\'s ' + condition + ' = ' + whether + ' data success');
    if (successCallback) {
      successCallback();
    }
  };
}

function clear(dbValue, successCallback, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref4) {
    var target = _ref4.target;

    var cursor = target.result;

    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };
  transaction.oncomplete = function () {
    _log2.default.success('clear ' + storeName + '\'s all data success');
    if (successCallback) {
      successCallback('clear all data success');
    }
  };
}

// update one
function update(dbValue, newData, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var putRequest = transaction.objectStore(storeName).put(newData);
  var successMessage = 'update ' + storeName + '\'s ' + putRequest.source.keyPath + '  = ' + newData[putRequest.source.keyPath] + ' data success';

  return (0, _requestPromise2.default)(putRequest, successMessage, newData);
}

var crud = {
  get: get,
  getWhetherCondition: getWhetherCondition,
  getAll: getAll,
  add: add,
  remove: remove,
  removeWhetherCondition: removeWhetherCondition,
  clear: clear,
  update: update
};

exports.default = crud;
//# sourceMappingURL=crud.js.map