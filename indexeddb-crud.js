'use strict';
var indexedDBHandler = (function indexedDBHandler() {
  var _db;
  var _storeName;
  var _presentKey;
  var _configKey;

  /* init indexedDB */

  function open(config, openSuccessCallback, openFailCallback) {
    // firstly inspect browser's support for indexedDB
    if (!window.indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
      openFailCallback(); // PUNCHLINE: offer without-DB mode
      return 0;
    }
    _openHandler(config, openSuccessCallback);

    return 0;
  }

  function _openHandler(config, openSuccessCallback) {
    var openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

    _storeName = config.storeName;
    _configKey = config.key;

    // an onblocked event is fired until they are closed or reloaded
    openRequest.onblocked = function blockedSchemeUp() {
      // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      window.alert('Please close all other tabs with this site open');
    };

    // Creating or updating the version of the database
    openRequest.onupgradeneeded = function schemaUp(e) {
      // All other databases have been closed. Set everything up.
      _db = e.target.result;
      console.log('onupgradeneeded in');
      if (!(_db.objectStoreNames.contains(_storeName))) {
        _createStoreHandler(config.initialData);
      }
    };

    openRequest.onsuccess = function openSuccess(e) {
      _db = e.target.result;
      console.log('\u2713 open storeName = ' + _storeName + ' indexedDB objectStore success');
      _getPresentKey(openSuccessCallback);
    };

    openRequest.onerror = function openError(e) {
      // window.alert('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
      window.alert('Something is wrong with indexedDB, for more information, checkout console');
      console.log(e.target.error);
    };
  }

  function _createStoreHandler(initialData) {
    var objectStore = _db.createObjectStore(_storeName, { keyPath: _configKey, autoIncrement: true });

    // Use transaction oncomplete to make sure the objectStore creation is
    objectStore.transaction.oncomplete = function addInitialData() {
      var addRequest;

      console.log('create ' + _storeName + '\'s objectStore succeed');
      if (initialData) {
        addRequest = function addRequestGenerator(data) {
          _whetherWriteTransaction(true).add(data);
        };
        // Store initial values in the newly created objectStore.
        try {
          JSON.parse(JSON.stringify(initialData)).forEach(function addEveryInitialData(data, index) {
            addRequest(data).success = function addInitialSuccess() {
              console.log('add initial data[' + index + '] successed');
            };
          });
        } catch (error) {
          window.alert('please set correct initial array object data :)');
          console.log(error);
          throw error;
        }
      }
    };
  }

  function _whetherWriteTransaction(whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = _db.transaction([_storeName], 'readwrite');
    } else {
      transaction = _db.transaction([_storeName]);
    }

    return transaction.objectStore(_storeName);
  }

  // set present key value to _presentKey (the private property)
  function _getPresentKey(openSuccessCallback) {
    getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        _presentKey = cursor.value.id;
        cursor.continue();
      } else {
        if (!_presentKey) {
          _presentKey = 0;
        }
        console.log('\u2713 now key = ' +  _presentKey); // initial value is 0
        openSuccessCallback();
        console.log('\u2713 openSuccessCallback finished');
      }
    };
  }

  function length() {
    return _presentKey;
  }

  function getNewKey() {
    _presentKey += 1;

    return _presentKey;
  }


  /* CRUD */

  function addItem(newData, successCallback) {
    var addRequest = _whetherWriteTransaction(true).add(newData);

    addRequest.onsuccess = function addSuccess() {
      console.log('\u2713 add ' + _configKey + ' = ' + newData[_configKey] + ' data succeed :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function getItem(key, successCallback) {
    var getRequest = _whetherWriteTransaction(false).get(parseInt(key, 10));  // get it by index

    getRequest.onsuccess = function getSuccess() {
      console.log('\u2713 get '  + _configKey + ' = ' + key + ' data success :)');
      successCallback(getRequest.result);
    };
  }

  // retrieve conditional data (boolean condition)
  function getConditionItem(condition, whether, successCallback) {
    var result = []; // use an array to storage eligible data

    getAllRequest().onsuccess = function getAllSuccess(e) {
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

    getAllRequest().onsuccess = function getAllSuccess(e) {
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
    var putRequest = _whetherWriteTransaction(true).put(newData);

    putRequest.onsuccess = function putSuccess() {
      console.log('\u2713 update ' + _configKey + ' = ' + newData[_configKey] + ' data success :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function removeItem(key, successCallback) {
    var deleteRequest = _whetherWriteTransaction(true).delete(key);

    deleteRequest.onsuccess = function deleteSuccess() {
      console.log('\u2713 remove ' + _configKey + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(key);
      }
    };
  }

  function clear(successCallback) {
    getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        console.log('\u2713 clear all data success :)');
        if (successCallback) {
          successCallback('clear all data success');
        }
      }
    };
  }

  function getAllRequest() {
    return _whetherWriteTransaction(true).openCursor(IDBKeyRange.lowerBound(1), 'next');
  }


  /* public interface */
  return {
    open: open,
    length: length,
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
