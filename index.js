'use strict';
// use module pattern
var indexedDBHandler = (function indexedDBHandler() {
  // 5 private property
  var _db;
  var _storeName;
  var _configKey;
  var _presentKey;
  var _initialJSONData;
  var _initialJSONDataUseful;
  var _initialJSONDataLen;

  // init indexedDB
  function init(config, successCallback, failCallback) {
    // firstly inspect browser's support for indexedDB
    if (!window.indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
      failCallback();
      return 0;
    }
    _openDB(config, successCallback, failCallback);

    return 0;
  }

  function _openDB(config, successCallback, failCallback) {
    var request = indexedDB.open(config.name, config.version); // open indexedDB

    // OK
    _storeName = config.storeName; // storage storeName
    _configKey = config.key;
    _initialJSONData = _getJSONData(config.initialData);
    _initialJSONDataLen = _getinitialJSONDataLen(_initialJSONData);
    _initialJSONDataUseful = config.initialJSONDataUseful;

    request.onerror = function _openDBError() {
      console.log('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
      failCallback();
    };
    request.onsuccess = function _openDBSuccess(e) {
      _db = e.target.result;
      _db.onerror = function errorHandler(e) {
        // Generic error handler for all errors targeted at this database's requests
        window.alert('Database error: ' + e.target.errorCode);
      };
      successCallback();
      _getPresentKey();
    };

    // When you create a new database or increase the version number of an existing database
    request.onupgradeneeded = function schemaUp(e) {
      var i;
      var store;
      var initialJSONData;
      console.log(_initialJSONData);
      console.log(_initialJSONDataLen);
      _db = e.target.result;
      console.log('scheme up');
      if (!(_db.objectStoreNames.contains(_storeName))) {
        store = _db.createObjectStore(_storeName, { keyPath: _configKey, autoIncrement: true });
        console.log(initialJSONData);
        console.log(_initialJSONDataLen);
        if (initialJSONData) {
          for (i = 0; i < _initialJSONDataLen; i++) {
            store.add(initialJSONData[i]);
            console.log(initialJSONData[i]);
          }
          _presentKey = _presentKey + _initialJSONDataLen - 1;
          console.log(_presentKey);
          _getPresentKey();
        }
      }
    };
  }

  function _getJSONData(rawData) {
    var result;

    try {
      // OK
      result = JSON.parse(JSON.stringify(rawData));
    } catch (error) {
      window.alert('Please set correct JSON type :>');
      result = false;
    } finally {
      return result;
    }
  }

  function _getinitialJSONDataLen(JSONData) {
    if (JSONData) {
      if (JSONData.length) {
        return JSONData.length;
      }
      return 1;
    }
    return 0;
  }

  // set present key value to _presentKey (the private property) 
  function _getPresentKey() {
    var storeHander = _transactionGenerator(true);
    var range = IDBKeyRange.lowerBound(0);

    storeHander.openCursor(range, 'next').onsuccess = function _getPresentKeyHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        cursor.continue();
        _presentKey = cursor.value.id;
      } else {
        if (!_presentKey) {
          _presentKey = 0;
        }
        console.log('now key is:' +  _presentKey); // initial value is 0
      }
    };
  }

  /* CRUD */

  // use closure to keep _presentKey, you will need it in add
  function getNewKey() {
    _presentKey += 1;

    return _presentKey;
  }

  function addItem(newData, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var addOpt = storeHander.add(newData);

    addOpt.onsuccess = function success() {
      console.log('Bravo, success to add one data to indexedDB');
      if (successCallback) { // if has callback been input, execute it 
        _successCallbackHandler(successCallback, newData, successCallbackArrayParameter);
      }
    };
  }

  function getItem(key, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(false);
    var getDataKey = storeHander.get(key);  // get it by index

    getDataKey.onsuccess = function getDataSuccess() {
      console.log('Great, get (key:' + key + '\')s data succeed');
      _successCallbackHandler(successCallback, getDataKey.result, successCallbackArrayParameter);
    };
  }

  // retrieve eligible data (boolean condition)
  function getConditionItem(condition, whether, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var range = _rangeGenerator();
    var result = []; // use an array to storage eligible data

    storeHander.openCursor(range, 'next').onsuccess = function getConditionItemHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        if (whether) {
          if (cursor.value[condition]) {
            result.push(cursor.value);
          }
        } else if (!whether) {
          if (!cursor.value[condition]) {
            result.push(cursor.value);
          }
        }
        cursor.continue();
      } else {
        _successCallbackHandler(successCallback, result, successCallbackArrayParameter);
      }
    };
  }

  function getAll(successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var range = _rangeGenerator();
    var result = [];

    storeHander.openCursor(range, 'next').onsuccess = function getAllHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        result.push(cursor.value);
        cursor.continue();
      } else {
        _successCallbackHandler(successCallback, result, successCallbackArrayParameter);
      }
    };
  }

  // update one
  function updateItem(newData, successCallback, successCallbackArrayParameter) {
    // #TODO: update part
    var storeHander = _transactionGenerator(true);
    var putStore = storeHander.put(newData);

    putStore.onsuccess = function updateSuccess() {
      console.log('Aha, modify succeed');
      if (successCallback) {
        _successCallbackHandler(successCallback, newData, successCallbackArrayParameter);
      }
    };
  }

  function deleteOne(key, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var deleteOpt = storeHander.delete(key);

    deleteOpt.onsuccess = function deleteSuccess() {
      console.log('delete (key: ' + key +  '\')s value succeed');
      if (successCallback) {
        _successCallbackHandler(successCallback, key, successCallbackArrayParameter);
      }
    };
  }

  function clear(successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var range = _rangeGenerator();

    storeHander.openCursor(range, 'next').onsuccess = function clearHandler(e) {
      var cursor = e.target.result;
      var requestDel;

      if (cursor) {
        requestDel = cursor.delete();
        requestDel.onsuccess = function success() {
        };
        cursor.continue();
      } else if (successCallback) {
        _successCallbackHandler(successCallback, 'all data', successCallbackArrayParameter);
      }
    };
  }

  /* 3 private methods */

  function _transactionGenerator(whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = _db.transaction([_storeName], 'readwrite');
    } else {
      transaction = _db.transaction([_storeName]);
    }

    return transaction.objectStore(_storeName);
  }

  function _rangeGenerator() {
    if (_initialJSONDataUseful) {
      return IDBKeyRange.lowerBound(0);
    }
    // #FIXME: 
    // console.log(_initialJSONDataLen);
    return IDBKeyRange.lowerBound(1 - 1, true);
  }

  function _successCallbackHandler(successCallback, result, successCallbackArrayParameter) {
    if (successCallbackArrayParameter) {
      successCallbackArrayParameter.unshift(result);
      successCallback.apply(null, successCallbackArrayParameter);
    } else {
      successCallback(result);
    }
  }

  /* public interface */
  return {
    init: init,
    getNewKey: getNewKey,
    addItem: addItem,
    getItem: getItem,
    getConditionItem: getConditionItem,
    getAll: getAll,
    updateItem: updateItem,
    removeItem: deleteOne,
    clear: clear
  };
}());

module.exports = indexedDBHandler;
