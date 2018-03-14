const log = {
  success(message) {
    console.log(`\u2713 ${message} :)`);
  },
  fail(message) {
    console.log(`\u2714 ${message}`);
  },
};

export default log;
