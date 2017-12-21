'use strict';
var indexedDBHandler = (function indexedDBHandler() {
  var _db;
  var _storeName;
  var _presentKey;
  var _configKey;

  /* init indexedDB */
  
  function init(config, successCallback, failCallback) {
    // firstly inspect browser's support for indexedDB
    if (!window.indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
      failCallback();
      return 0;
    }
    _storeName = config.storeName; // storage storeName
    _configKey = config.key;
    _openDB(config, successCallback, failCallback);

    return 0;
  }

  function _openDB(config, successCallback, failCallback) {
    var request = indexedDB.open(config.name, config.version); // open indexedDB

    request.onerror = function _openDBError(e) {
      // window.alert('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
      window.alert('Something is wrong with indexedDB, we offer you the without DB mode, for more information, checkout console');
      console.log(e.target.error);
      failCallback();
    };
    request.onsuccess = function _openDBSuccess(e) {
      _db = e.target.result;
      successCallback();
      _getPresentKey();
    };

    // Creating or updating the version of the database
    request.onupgradeneeded = function schemaUp(e) {
      _db = e.target.result;
      console.log('onupgradeneeded in');
      if (!(_db.objectStoreNames.contains(_storeName))) {
        _createStoreHandler(config.key, config.initialData);
      }
    };
  }

  function _createStoreHandler(key, initialData) {
    var objectStore = _db.createObjectStore(_storeName, { keyPath: key, autoIncrement: true });
    // Use transaction oncomplete to make sure the objectStore creation is
    objectStore.transaction.oncomplete = function addInitialData() {
      var storeHander;

      console.log('create ' + _storeName + '\'s objectStore succeed');
      if (initialData) {
        // Store initial values in the newly created objectStore.
        storeHander = _transactionGenerator(true);
        try {
          initialData.forEach(function addEveryInitialData(data, index) {
            storeHander.add(data);
            console.log('add initial data[' + index + '] successed');
          });
        } catch (error) {
          console.log(error);
          window.alert('please set correct initial array object data :)');
        }
      }
    };
  }

  // set present key value to _presentKey (the private property)
  function _getPresentKey() {
    var storeHandler = _transactionGenerator(true);
    var range = IDBKeyRange.lowerBound(0);

    storeHandler.openCursor(range, 'next').onsuccess = function _getPresentKeyHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        cursor.continue();
        _presentKey = cursor.value.id;
      } else {
        if (!_presentKey) {
          _presentKey = 0;
        }
        console.log('now key = ' +  _presentKey); // initial value is 0
      }
    };
  }

  function getNewKey() {
    _presentKey += 1;

    return _presentKey;
  }


  /* CRUD */

  function addItem(newData, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var addRequest = storeHander.add(newData);

    addRequest.onsuccess = function success() {
      console.log('\u2713 add ' + _configKey + ' = ' + newData[_configKey] + ' data succeed :)');
      _presentKey += 1;
      if (successCallback) {
        _successCallbackHandler(successCallback, newData, successCallbackArrayParameter);
      }
    };
  }

  function getItem(key, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(false);
    var getRequest = storeHander.get(key);  // get it by index

    getRequest.onsuccess = function getDataSuccess() {
      console.log('\u2713 get '  + _configKey + ' = ' + key + ' data success :)');
      _successCallbackHandler(successCallback, getRequest.result, successCallbackArrayParameter);
    };
  }

  // retrieve eligible data (boolean condition)
  function getConditionItem(condition, whether, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var range = _rangeToAll();
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
    var range = _rangeToAll();
    var result = [];

    storeHander.openCursor(range, 'next').onsuccess = function getAllHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        result.push(cursor.value);
        cursor.continue();
      } else {
        console.log('\u2713 get all data success :)')
        _successCallbackHandler(successCallback, result, successCallbackArrayParameter);
      }
    };
  }

  // update one
  function updateItem(newData, successCallback, successCallbackArrayParameter) {
    // #TODO: update part
    var storeHander = _transactionGenerator(true);
    var putRequest = storeHander.put(newData);

    putRequest.onsuccess = function updateSuccess() {
      console.log('\u2713 update ' + _configKey + ' = ' + newData[_configKey] + ' data success :)');
      if (successCallback) {
        _successCallbackHandler(successCallback, newData, successCallbackArrayParameter);
      }
    };
  }

  function removeItem(key, successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var removeRequest = storeHander.delete(key);

    removeRequest.onsuccess = function deleteSuccess() {
      console.log('\u2713 remove ' + _configKey + ' = ' + key + ' data success :)');
      if (successCallback) {
        _successCallbackHandler(successCallback, key, successCallbackArrayParameter);
      }
    };
  }

  function clear(successCallback, successCallbackArrayParameter) {
    var storeHander = _transactionGenerator(true);
    var range = _rangeToAll();

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
      } else {
        console.log('\u2713 clear all data success :)')
      }
    };
  }


  function _transactionGenerator(whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = _db.transaction([_storeName], 'readwrite');
    } else {
      transaction = _db.transaction([_storeName]);
    }

    return transaction.objectStore(_storeName);
  }

  function _rangeToAll() {
    return IDBKeyRange.lowerBound(0, true);
  }

  function _successCallbackHandler(successCallback, result, successCallbackArrayParameter) {
    if (successCallbackArrayParameter) {
      if (Array.isArray(successCallbackArrayParameter)) {
        successCallbackArrayParameter.unshift(result);
        successCallback.apply(null, successCallbackArrayParameter);
      } else {
        throw new TypeError('please set correct array type of callback parameter');
      }
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
    removeItem: removeItem,
    clear: clear
  };
}());

module.exports = indexedDBHandler;
