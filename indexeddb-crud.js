'use strict';
var IndexedDBHandler = (function generator() {
  // private properties
  var _db;
  var _key;
  var _storeName;
  var _presentKey = 0;
  var Handler = function handlerGenerator(config, openSuccessCallback, openFailCallback) {
    /* init indexedDB */
    // firstly inspect browser's support for indexedDB
    if (!Window.indexedDB) {
      Window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
      if (openFailCallback) {
        openFailCallback(); // PUNCHLINE: offer without-DB handler
      }
      return 0;
    }
    _presentKey = 0;
    _key = config.key;
    _storeName = config.storeName;
    _openHandler();

    function _openHandler() {
      var openRequest = Window.indexedDB.open(config.name, config.version); // open indexedDB

      // an onblocked event is fired until they are closed or reloaded
      openRequest.onblocked = function blockedSchemeUp() {
        // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
        Window.alert('Please close all other tabs with this site open');
      };

      // Creating or updating the version of the database
      openRequest.onupgradeneeded = function schemaUp(e) {
        // All other databases have been closed. Set everything up.
        _db = e.target.result;
        console.log('onupgradeneeded in');
        if (!(_db.objectStoreNames.contains(_storeName))) {
          _createStoreHandler();
        }
      };

      openRequest.onsuccess = function openSuccess(e) {
        _db = e.target.result;
        console.log('\u2713 open storeName = ' + _storeName + ' indexedDB objectStore success');
        _getPresentKey();
      };

      openRequest.onerror = function openError(e) {
        // Window.alert('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
        Window.alert('Something is wrong with indexedDB, for more information, checkout console');
        console.log(e.target.error);
      };
    }

    // set present key value to _presentKey (the private property)
    function _getPresentKey() {
      _getAllRequest().onsuccess = function getAllSuccess(e) {
        var cursor = e.target.result;

        if (cursor) {
          _presentKey = cursor.value.id;
          cursor.continue();
        } else {
          console.log('\u2713 now key = ' +  _presentKey); // initial value is 0
          if (openSuccessCallback) {
            openSuccessCallback();
            console.log('\u2713 openSuccessCallback finished');
          }
        }
      };
    }

    function _createStoreHandler() {
      var objectStore = _db.createObjectStore(_storeName, { keyPath: _key, autoIncrement: true });

      // Use transaction oncomplete to make sure the objectStore creation is
      objectStore.transaction.oncomplete = function addinitialData() {
        var addRequest;

        console.log('create ' + _storeName + '\'s objectStore succeed');
        if (config.initialData) {
          addRequest = function addRequestGenerator(data) {
            _whetherWriteTransaction().add(data);
          };
          // Store initial values in the newly created objectStore.
          try {
            JSON.parse(JSON.stringify(config.initialData)).forEach(function addEveryInitialData(data, index) {
              addRequest(data).success = function addInitialSuccess() {
                console.log('add initial data[' + index + '] successed');
              };
            });
          } catch (error) {
            Window.alert('please set correct initial array object data :)');
            console.log(error);
            throw error;
          }
        }
      };
    }

    return this;
  };

  Handler.prototype = (function prototypeGenerator() {
    function getLength() {
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
        console.log('\u2713 add ' + _key + ' = ' + newData[_key] + ' data succeed :)');
        if (successCallback) {
          successCallback(newData);
        }
      };
    }

    function getItem(key, successCallback) {
      var getRequest = _whetherWriteTransaction(false).get(parseInt(key, 10));  // get it by index

      getRequest.onsuccess = function getSuccess() {
        console.log('\u2713 get '  + _key + ' = ' + key + ' data success :)');
        if (successCallback) {
          successCallback(getRequest.result);
        }
      };
    }

    // get conditional data (boolean condition)
    function getConditionItem(condition, whether, successCallback) {
      var result = []; // use an array to storage eligible data

      _getAllRequest().onsuccess = function getAllSuccess(e) {
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

    function removeItem(key, successCallback) {
      var deleteRequest = _whetherWriteTransaction(true).delete(key);

      deleteRequest.onsuccess = function deleteSuccess() {
        console.log('\u2713 remove ' + _key + ' = ' + key + ' data success :)');
        if (successCallback) {
          successCallback(key);
        }
      };
    }

    function removeConditionItem(condition, whether, successCallback) {
      _getAllRequest().onsuccess = function getAllSuccess(e) {
        var cursor = e.target.result;

        if (cursor) {
          if (whether) {
            if (cursor.value[condition]) {
              cursor.delete();
            }
          } else if (!whether) {
            if (!cursor.value[condition]) {
              cursor.delete();
            }
          }
          cursor.continue();
        } else if (successCallback) {
          successCallback();
        }
      };
    }

    function clear(successCallback) {
      _getAllRequest().onsuccess = function getAllSuccess(e) {
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

    // update one
    function updateItem(newData, successCallback) {
      var putRequest = _whetherWriteTransaction(true).put(newData);

      putRequest.onsuccess = function putSuccess() {
        console.log('\u2713 update ' + _key + ' = ' + newData[_key] + ' data success :)');
        if (successCallback) {
          successCallback(newData);
        }
      };
    }

    return {
      constructor: IndexedDBHandler,
      /* public interface */
      getLength: getLength,
      getNewKey: getNewKey,
      getItem: getItem,
      getConditionItem: getConditionItem,
      getAll: getAll,
      addItem: addItem,
      removeItem: removeItem,
      removeConditionItem: removeConditionItem,
      clear: clear,
      updateItem: updateItem
    };
  }());

  // private methods

  function _whetherWriteTransaction(whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = _db.transaction([_storeName], 'readwrite');
    } else {
      transaction = _db.transaction([_storeName]);
    }

    return transaction.objectStore(_storeName);
  }

  function _getAllRequest() {
    return _whetherWriteTransaction(true).openCursor(IDBKeyRange.lowerBound(1), 'next');
  }

  // return Class
  return Handler;
}());


module.exports = IndexedDBHandler;
