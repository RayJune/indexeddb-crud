const parseJSONData = (rawdata, name) => {
  try {
    const parsedData = JSON.parse(JSON.stringify(rawdata));

    return parsedData;
  } catch (error) {
    window.alert(`please set correct ${name} array object`);
    console.log(error);
    throw error;
  }
};

export default parseJSONData;
