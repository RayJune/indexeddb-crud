(function initialDataHandler() {
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

  return {
    getData: getData,
    getLength: getLength
  };
}());
