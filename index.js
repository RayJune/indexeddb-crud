'use strict';
// use module pattern
var indexedDBHandler = (function indexedDBHandler() {
  // 5 private property
  var _dbResult;
  var _presentKey;
  var _storeName;
  var _initialDataUseful;
  var _initialDataLen;

  // init indexedDB
  function init(dbConfig, callback) {
    // firstly inspect browser's support for indexedDB
    if (!window.indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.');

      return 0;
    }
    callback ? _openDB(dbConfig, callback) : _openDB(dbConfig);

    return 0;
  }

  function _openDB(dbConfig, callback) {
    var request = indexedDB.open(dbConfig.name, dbConfig.version); // open indexedDB

    _storeName = dbConfig.storeName; // storage storeName
    _initialDataLen = getLength(dbConfig.initialData);
    console.log(_initialDataLen);
    _initialDataUseful = dbConfig.initialDataUseful;

    request.onerror = function _openDBErrorHandler() {
      console.log('Pity, fail to load indexedDB');
    };
    request.onsuccess = function _openDBSuccessHandler(e) {
      _dbResult = e.target.result;
      callback();
      _getPresentKey();
    };

    // When you create a new database or increase the version number of an existing database
    request.onupgradeneeded = function schemaUp(e) {
      var i;
      var store;
      var initialData;

      _dbResult = e.target.result;
      if (!(_dbResult.objectStoreNames.contains(_storeName))) {
        store = _dbResult.createObjectStore(_storeName, { keyPath: dbConfig.key, autoIncrement: true });
        initialData = getData(dbConfig.initialData);
        console.log(initialData);
        if (initialData) {
          for (i = 0; i < _initialDataLen; i++) {
            store.add(initialData[i]);
            console.log(initialData[i]);
          }
          _presentKey += _initialDataLen - 1;
        }
      }
    };
  }

  function getData(initialData) {
    var result;

    try {
      result = JSON.parse(JSON.stringify(initialData));
    } catch (error) {
      window.alert('Please input JSON type initialData');

      result = false;
    } finally {
      return result;
    }
  }

  function getLength(initialData) {
    if (initialData) {
      if (initialData.length) {
        return initialData.length;
      }
      return 1;
    }
    return 0;
  }

  // set present key value to _presentKey (the private property) 
  function _getPresentKey() {
    var storeHander = _transactionHandler(true);
    var range = IDBKeyRange.lowerBound(0);

    storeHander.openCursor(range, 'next').onsuccess = function _getPresentKeyHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        cursor.continue();
        _presentKey = cursor.value.id;
      } else {
        console.log('now key is:' +  _presentKey);
      }
    };
  }

  /* CRUD */

  // get present id
  // use closure to keep _presentKey, you will need it in add
  function getNewDataKey() {
    _presentKey += 1;

    return _presentKey;
  }

  // Create 

  function add(newData, callback, callbackParaArr) {
    var storeHander = _transactionHandler(true);
    var addOpt = storeHander.add(newData);

    addOpt.onerror = function error() {
      console.log('Pity, failed to add one data to indexedDB');
    };
    addOpt.onsuccess = function success() {
      console.log('Bravo, success to add one data to indexedDB');
      if (callback) { // if has callback been input, execute it 
        _callbackHandler(callback, newData, callbackParaArr);
      }
    };
  }

  // Retrieve

  // retrieve one data
  function get(key, callback, callbackParaArr) {
    var storeHander = _transactionHandler(false);
    var getDataKey = storeHander.get(key);  // get it by index

    getDataKey.onerror = function getDataErrorHandler() {
      console.log('Pity, get (key:' + key + '\')s data' + ' faild');
    };
    getDataKey.onsuccess = function getDataSuccessHandler() {
      console.log('Great, get (key:' + key + '\')s data succeed');
      _callbackHandler(callback, getDataKey.result, callbackParaArr);
    };
  }

  // retrieve eligible data (boolean condition)
  function getWhether(whether, condition, callback, callbackParaArr) {
    var storeHander = _transactionHandler(true);
    var range = _rangeToAll();
    var result = []; // use an array to storage eligible data

    storeHander.openCursor(range, 'next').onsuccess = function getWhetherHandler(e) {
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
        _callbackHandler(callback, result, callbackParaArr);
      }
    };
  }

  // retrieve all
  function getAll(callback, callbackParaArr) {
    var storeHander = _transactionHandler(true);
    var range = _rangeToAll();
    var result = [];

    storeHander.openCursor(range, 'next').onsuccess = function getAllHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        result.push(cursor.value);
        cursor.continue();
      } else {
        _callbackHandler(callback, result, callbackParaArr);
      }
    };
  }

  // Update one
  function update(newData, callback, callbackParaArr) {
    var storeHander = _transactionHandler(true);
    var putStore = storeHander.put(newData);

    putStore.onerror = function updateErrorHandler() {
      console.log('Pity, modify failed');
    };
    putStore.onsuccess = function updateSuccessHandler() {
      console.log('Aha, modify succeed');
      if (callback) {
        _callbackHandler(callback, newData, callbackParaArr);
      }
    };
  }

  // Delete 

  // delete one
  function deleteOne(key, callback, callbackParaArr) {
    var storeHander = _transactionHandler(true);
    var deleteOpt = storeHander.delete(key);

    deleteOpt.onerror = function deleteErrorHandler() {
      console.log('delete (key:' + key + '\')s value faild');
    };
    deleteOpt.onsuccess = function deleteSuccessHandler() {
      console.log('delete (key: ' + key +  '\')s value succeed');
      if (callback) {
        _callbackHandler(callback, key, callbackParaArr);
      }
    };
  }

  // clear
  function clear(callback, callbackParaArr) {
    var storeHander = _transactionHandler(true);
    var range = _rangeToAll();

    storeHander.openCursor(range, 'next').onsuccess = function clearHandler(e) {
      var cursor = e.target.result;
      var requestDel;

      if (cursor) {
        requestDel = cursor.delete();
        requestDel.onsuccess = function success() {
        };
        requestDel.onerror = function error() {
          console.log('Pity, delete all data faild');
        };
        cursor.continue();
      } else if (callback) {
        _callbackHandler(callback, 'all data', callbackParaArr);
      }
    };
  }

  /* 3 private methods */

  function _transactionHandler(whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = _dbResult.transaction([_storeName], 'readwrite');
    } else {
      transaction = _dbResult.transaction([_storeName]);
    }

    return transaction.objectStore(_storeName);
  }

  function _rangeToAll() {
    if (_initialDataUseful) {
      return IDBKeyRange.lowerBound(0);
    }
    // console.log(_initialDataLen);
    return IDBKeyRange.lowerBound(1 - 1, true);
  }

  function _callbackHandler(callback, result, callbackParaArr) {
    if (callbackParaArr) {
      callbackParaArr.unshift(result);
      callback.apply(null, callbackParaArr);
    } else {
      callback(result);
    }
  }

  /* public interface */
  return {
    init: init,
    getNewDataKey: getNewDataKey,
    add: add,
    get: get,
    getWhether: getWhether,
    getAll: getAll,
    update: update,
    delete: deleteOne,
    clear: clear
  };
}());

module.exports = indexedDBHandler;
