'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./utlis/log');

var _log2 = _interopRequireDefault(_log);

var _crud = require('./utlis/crud');

var _crud2 = _interopRequireDefault(_crud);

var _getAllRequest = require('./utlis/getAllRequest');

var _getAllRequest2 = _interopRequireDefault(_getAllRequest);

var _parseJSONData = require('./utlis/parseJSONData');

var _parseJSONData2 = _interopRequireDefault(_parseJSONData);

var _promiseGenerator = require('./utlis/promiseGenerator');

var _promiseGenerator2 = _interopRequireDefault(_promiseGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _db = void 0;
var _defaultStoreName = void 0;
var _presentKey = {}; // store multi-objectStore's presentKey

/* first step, open it and use others API */

var open = function open(config) {
  return new Promise(function (resolve, reject) {
    if (window.indexedDB) {
      _openHandler(config, resolve);
    } else {
      _log2.default.fail('Your browser doesn\'t support a stable version of IndexedDB. You can install latest Chrome or FireFox to handler it');
      reject();
    }
  });
};

/* synchronous API */

var getLength = function getLength() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;
  return _presentKey[storeName];
};

var getNewKey = function getNewKey() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;

  _presentKey[storeName] += 1;

  return _presentKey[storeName];
};

/* asynchronous API: crud methods */

var getItem = function getItem(key) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.get(_db, key, storeName);
};

var getWhetherConditionItem = function getWhetherConditionItem(condition, whether) {
  var storeName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultStoreName;
  return _crud2.default.getWhetherCondition(_db, condition, whether, storeName);
};

var getAll = function getAll() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;
  return _crud2.default.getAll(_db, storeName);
};

var addItem = function addItem(newData) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.add(_db, newData, storeName);
};

var removeItem = function removeItem(key) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.remove(_db, key, storeName);
};

var removeWhetherConditionItem = function removeWhetherConditionItem(condition, whether) {
  var storeName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultStoreName;
  return _crud2.default.removeWhetherCondition(_db, condition, whether, storeName);
};

var clear = function clear() {
  var storeName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultStoreName;
  return _crud2.default.clear(_db, storeName);
};

var updateItem = function updateItem(newData) {
  var storeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultStoreName;
  return _crud2.default.update(_db, newData, storeName);
};

function _openHandler(config, successCallback) {
  var openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

  // an onblocked event is fired until they are closed or reloaded
  openRequest.onblocked = function () {
    // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
    _log2.default.fail('Please close all other tabs with this site open');
  };

  // Creating or updating the version of the database
  openRequest.onupgradeneeded = function (_ref) {
    var target = _ref.target;

    // All other databases have been closed. Set everything up.
    _db = target.result;
    _log2.default.success('onupgradeneeded in');
    _createObjectStoreHandler(config.storeConfig);
  };

  openRequest.onsuccess = function (_ref2) {
    var target = _ref2.target;

    _db = target.result;
    _db.onversionchange = function () {
      _db.close();
      _log2.default.fail('A new version of this page is ready. Please reload');
    };
    _openSuccessCallbackHandler(config.storeConfig, successCallback);
  };

  // use error events bubble to handle all error events
  openRequest.onerror = function (_ref3) {
    var target = _ref3.target;

    _log2.default.fail('Something is wrong with indexedDB, for more information, checkout console');
    _log2.default.fail(target.error);
    throw new Error(target.error);
  };
}

function _openSuccessCallbackHandler(configStoreConfig, successCallback) {
  var objectStoreList = (0, _parseJSONData2.default)(configStoreConfig, 'storeName');

  objectStoreList.forEach(function (storeConfig, index) {
    if (index === 0) {
      _defaultStoreName = storeConfig.storeName; // PUNCHLINE: the last storeName is defaultStoreName
    }
    if (index === objectStoreList.length - 1) {
      _getPresentKey(storeConfig.storeName, function () {
        successCallback();
        _log2.default.success('open indexedDB success');
      });
    } else {
      _getPresentKey(storeConfig.storeName);
    }
  });
}

// set present key value to _presentKey (the private property)
function _getPresentKey(storeName, successCallback) {
  var transaction = _db.transaction([storeName]);
  var successMessage = 'now ' + storeName + ' \'s max key is ' + _presentKey[storeName]; // initial value is 0

  _presentKey[storeName] = 0;
  (0, _getAllRequest2.default)(transaction, storeName).onsuccess = function (_ref4) {
    var target = _ref4.target;

    var cursor = target.result;

    if (cursor) {
      _presentKey[storeName] = cursor.value.id;
      cursor.continue();
    }
  };
  _promiseGenerator2.default.transaction(transaction, successMessage).then(successCallback);
}

function _createObjectStoreHandler(configStoreConfig) {
  (0, _parseJSONData2.default)(configStoreConfig, 'storeName').forEach(function (storeConfig) {
    if (!_db.objectStoreNames.contains(storeConfig.storeName)) {
      _createObjectStore(storeConfig);
    }
  });
}

function _createObjectStore(_ref5) {
  var storeName = _ref5.storeName,
      key = _ref5.key,
      initialData = _ref5.initialData;

  var store = _db.createObjectStore(storeName, { keyPath: key, autoIncrement: true });
  var transaction = store.transaction;

  var successMessage = 'create ' + storeName + ' \'s object store succeed';

  _promiseGenerator2.default.transaction(transaction, successMessage).then(function () {
    if (initialData) {
      // Store initial values in the newly created object store.
      _initialDataHandler(storeName, initialData);
    }
  });
}

function _initialDataHandler(storeName, initialData) {
  var transaction = _db.transaction([storeName], 'readwrite');
  var objectStore = transaction.objectStore(storeName);
  var successMessage = 'add all ' + storeName + ' \'s initial data done';

  (0, _parseJSONData2.default)(initialData, 'initial').forEach(function (data, index) {
    var addRequest = objectStore.add(data);

    addRequest.onsuccess = function () {
      _log2.default.success('add initial data[' + index + '] successed');
    };
  });
  _promiseGenerator2.default.transaction(transaction, successMessage).then(function () {
    _getPresentKey(storeName);
  });
}

exports.default = {
  open: open,
  getLength: getLength,
  getNewKey: getNewKey,
  getItem: getItem,
  getWhetherConditionItem: getWhetherConditionItem,
  getAll: getAll,
  addItem: addItem,
  removeItem: removeItem,
  removeWhetherConditionItem: removeWhetherConditionItem,
  clear: clear,
  updateItem: updateItem
};
//# sourceMappingURL=indexeddb-crud.js.map