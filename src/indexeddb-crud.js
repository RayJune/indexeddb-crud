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
    _transactionGenerator(true).openCursor(_rangeGenerator(), 'next').onsuccess = function _getPresentKeyHandler(e) {
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

  function _rangeGenerator() {
    return IDBKeyRange.lowerBound(1);
  }

  function getNewKey() {
    _presentKey += 1;

    return _presentKey;
  }


  /* CRUD */

  function addItem(newData, successCallback) {
    var addRequest = _transactionGenerator(true).add(newData);

    addRequest.onsuccess = function success() {
      console.log('\u2713 add ' + _configKey + ' = ' + newData[_configKey] + ' data succeed :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function getItem(key, successCallback) {
    var getRequest = _transactionGenerator(false).get(parseInt(key, 10));  // get it by index

    getRequest.onsuccess = function getDataSuccess() {
      console.log('\u2713 get '  + _configKey + ' = ' + key + ' data success :)');
      successCallback(getRequest.result);
    };
  }

  // retrieve eligible data (boolean condition)
  function getConditionItem(condition, whether, successCallback) {
    var result = []; // use an array to storage eligible data

    _transactionGenerator(true).openCursor(_rangeGenerator(), 'next').onsuccess = function getConditionItemHandler(e) {
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
      } else if (successCallback) {
        successCallback(result);
      }
    };
  }

  function getAll(successCallback) {
    var result = [];

    _transactionGenerator(true).openCursor(_rangeGenerator(), 'next').onsuccess = function getAllHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        result.push(cursor.value);
        cursor.continue();
      } else {
        console.log('\u2713 get all data success :)');
        if (successCallback) {
          successCallback(result);
        }
      }
    };
  }

  // update one
  function updateItem(newData, successCallback) {
    var putRequest = _transactionGenerator(true).put(newData);

    putRequest.onsuccess = function putSuccess() {
      console.log('\u2713 update ' + _configKey + ' = ' + newData[_configKey] + ' data success :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function removeItem(key, successCallback) {
    var deleteRequest = _transactionGenerator(true).delete(key);

    deleteRequest.onsuccess = function deleteSuccess() {
      console.log('\u2713 remove ' + _configKey + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(key);
      }
    };
  }

  function clear(successCallback) {
    _transactionGenerator(true).openCursor(_rangeGenerator(), 'next').onsuccess = function clearHandler(e) {
      var cursor = e.target.result;
      var deleteRequest;

      if (cursor) {
        deleteRequest = cursor.delete();
        deleteRequest.onsuccess = function success() {
        };
        cursor.continue();
      } else {
        console.log('\u2713 clear all data success :)');
        if (successCallback) {
          successCallback('clear all data success');
        }
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
