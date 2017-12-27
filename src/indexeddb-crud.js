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
