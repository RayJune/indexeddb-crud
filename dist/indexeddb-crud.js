(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var indexedDBHandler = (function indexedDBHandler() {
  var _db;
  var _presentKey;
  var _operateGenerator = require('./utils/operateGenerator.js');
  var operate;

  /* init indexedDB */

  function open(config, successCallback, failCallback) {
    // firstly inspect browser's support for indexedDB
    if (!window.indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
      failCallback();
      return 0;
    }
    _openHandler(config, successCallback, failCallback);

    return 0;
  }

  function _openHandler(config, successCallback, failCallback) {
    var openRequest = indexedDB.open(config.name, config.version); // open indexedDB

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
      if (!(_db.objectStoreNames.contains(config.storeName))) {
        _createStoreHandler(config.storeName, config.key, config.initialData);
      }
    };

    openRequest.onsuccess = function _openSuccess(e) {
      _db = e.target.result;
      operate = _operateGenerator(_db, config.storeName, config.key);
      operate._getPresentKey(_presentKey);
      successCallback();
    };

    openRequest.onerror = function _openError(e) {
      // window.alert('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
      window.alert('Something is wrong with indexedDB, we offer you the without DB mode, for more information, checkout console');
      console.log(e.target.error);
      failCallback();
    };
  }

  function _createStoreHandler(storeName, key, initialData) {
    var objectStore = _db.createObjectStore(storeName, { keyPath: key, autoIncrement: true });

    // Use transaction oncomplete to make sure the objectStore creation is
    objectStore.transaction.oncomplete = function addInitialData() {
      var addRequest = function addRequestGenerator(data) {
        _db.transaction([storeName], 'readwrite').add(data);
      };

      console.log('create ' + storeName + '\'s objectStore succeed');
      if (initialData) {
        // Store initial values in the newly created objectStore.
        try {
          initialData.forEach(function addEveryInitialData(data, index) {
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

  function getNewKey() {
    _presentKey += 1;

    return _presentKey;
  }


  /* public interface */
  return {
    open: open,
    getNewKey: getNewKey,
    addItem: operate.add,
    getItem: operate.get,
    getConditionItem: operate.getCondition,
    getAll: operate.getAll,
    updateItem: operate.update,
    removeItem: operate.remove,
    clear: operate.clear
  };
}());

module.exports = indexedDBHandler;

},{"./utils/operateGenerator.js":2}],2:[function(require,module,exports){
module.exports = function operateGenerator(db, storeName, configKey) {
  var _transactionGenerator = require('./transactionGenerator.js');

  // set present key value to presentKey (the private property)
  function getPresentKey(presentKey) {
    _getAllRequest().onsuccess = function getPresentKeyHandler(e) {
      var cursor = e.target.result;

      if (cursor) {
        presentKey = cursor.value.id;
        cursor.continue();
      } else {
        if (!presentKey) {
          presentKey = 0;
        }
        console.log('now key = ' +  presentKey); // initial value is 0
      }
    };
  }

  function _getAllRequest() {
    return _transactionGenerator(db, storeName, true).openCursor(IDBKeyRange.lowerBound(1), 'next');
  }

  /* CRUD */

  function add(newData, successCallback) {
    var addRequest = _transactionGenerator(db, storeName, true).add(newData);

    addRequest.onsuccess = function success() {
      console.log('\u2713 add ' + configKey + ' = ' + newData[configKey] + ' data succeed :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function get(key, successCallback) {
    var getRequest = _transactionGenerator(db, storeName, false).get(parseInt(key, 10));  // get it by index

    getRequest.onsuccess = function getDataSuccess() {
      console.log('\u2713 get '  + configKey + ' = ' + key + ' data success :)');
      successCallback(getRequest.result);
    };
  }

  // retrieve eligible data (boolean condition)
  function getCondition(condition, whether, successCallback) {
    var result = []; // use an array to storage eligible data

    _getAllRequest().onsuccess = function getConditionSuccess(e) {
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

    _getAllRequest().onsuccess = function getAllSuccess(e) {
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
  function update(newData, successCallback) {
    var putRequest = _transactionGenerator(db, storeName, true).put(newData);

    putRequest.onsuccess = function putSuccess() {
      console.log('\u2713 update ' + configKey + ' = ' + newData[configKey] + ' data success :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function remove(key, successCallback) {
    var deleteRequest = _transactionGenerator(db, storeName, true).delete(key);

    deleteRequest.onsuccess = function deleteSuccess() {
      console.log('\u2713 remove ' + configKey + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(key);
      }
    };
  }

  function clear(successCallback) {
    _getAllRequest().onsuccess = function clearSuccess(e) {
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

  return {
    getPresentKey: getPresentKey,
    add: add,
    get: get,
    getAll: getAll,
    getCondition: getCondition,
    update: update,
    remove: remove,
    clear: clear
  };
};

},{"./transactionGenerator.js":3}],3:[function(require,module,exports){
module.exports = function transactionGenerator(db, storeName, whetherWrite) {
  var transaction;

  if (whetherWrite) {
    transaction = db.transaction([storeName], 'readwrite');
  } else {
    transaction = db.transaction([storeName]);
  }

  return transaction.objectStore(storeName);
};

},{}]},{},[1]);
