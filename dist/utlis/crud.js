'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promiseGenerator = require('./promiseGenerator');

var _promiseGenerator2 = _interopRequireDefault(_promiseGenerator);

var _getAllRequest = require('./getAllRequest');

var _getAllRequest2 = _interopRequireDefault(_getAllRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(dbValue, key, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var getRequest = transaction.objectStore(storeName).get(parseInt(key, 10)); // get it by index
  var successMessage = 'get ' + storeName + '\'s ' + getRequest.source.keyPath + ' = ' + key + ' data success';
  var data = { property: 'result' };

  return _promiseGenerator2.default.request(getRequest, successMessage, data);
}

// get conditional data (boolean condition)
function getWhetherCondition(dbValue, condition, whether, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var result = []; // use an array to storage eligible data
  var successMessage = 'get ' + storeName + '\'s ' + condition + ' = ' + whether + ' data success';

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

  return _promiseGenerator2.default.transaction(transaction, successMessage, result);
}

function getAll(dbValue, storeName) {
  var transaction = dbValue.transaction([storeName]);
  var result = [];
  var successMessage = 'get ' + storeName + '\'s all data success';

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref2) {
    var target = _ref2.target;

    var cursor = target.result;

    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }
  };

  return _promiseGenerator2.default.transaction(transaction, successMessage, result);
}

function add(dbValue, newData, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var addRequest = transaction.objectStore(storeName).add(newData);
  var successMessage = 'add ' + storeName + '\'s ' + addRequest.source.keyPath + '  = ' + newData[addRequest.source.keyPath] + ' data succeed';

  return _promiseGenerator2.default.request(addRequest, successMessage, newData);
}

function remove(dbValue, key, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var deleteRequest = transaction.objectStore(storeName).delete(key);
  var successMessage = 'remove ' + storeName + '\'s  ' + deleteRequest.source.keyPath + ' = ' + key + ' data success';

  return _promiseGenerator2.default.request(deleteRequest, successMessage, key);
}

function removeWhetherCondition(dbValue, condition, whether, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var successMessage = 'remove ' + storeName + '\'s ' + condition + ' = ' + whether + ' data success';

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

  return _promiseGenerator2.default.transaction(transaction, successMessage);
}

function clear(dbValue, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var successMessage = 'clear ' + storeName + '\'s all data success';

  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref4) {
    var target = _ref4.target;

    var cursor = target.result;

    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  return _promiseGenerator2.default.transaction(transaction, successMessage);
}

// update one
function update(dbValue, newData, storeName) {
  var transaction = dbValue.transaction([storeName], 'readwrite');
  var putRequest = transaction.objectStore(storeName).put(newData);
  var successMessage = 'update ' + storeName + '\'s ' + putRequest.source.keyPath + '  = ' + newData[putRequest.source.keyPath] + ' data success';

  return _promiseGenerator2.default.request(putRequest, successMessage, newData);
}

exports.default = {
  get: get,
  getWhetherCondition: getWhetherCondition,
  getAll: getAll,
  add: add,
  remove: remove,
  removeWhetherCondition: removeWhetherCondition,
  clear: clear,
  update: update
};
//# sourceMappingURL=crud.js.map