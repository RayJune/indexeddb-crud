module.exports = function open(config, successCallback, failCallback) {
  var request = indexedDB.open(config.name, config.version); // open indexedDB

  // OK
  _storeName = config.storeName; // storage storeName
  _configKey = config.key;
  _initialJSONData = _getJSONData(config.initialData);
  _initialJSONDataLen = _getinitialJSONDataLen(_initialJSONData);
  _initialJSONDataUseful = config.initialJSONDataUseful;

  request.onerror = function openError() {
    console.log('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
    failCallback();
  };
  request.onsuccess = function openSuccess(e) {
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
};
