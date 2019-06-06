const logExecutionTime = () => {
  return (handler) => {
    before(() => {
      console.time('EXECUTION TIME');
    });

    after(() => {
      console.timeEnd('EXECUTION TIME');
    });

    handler();
  }
}

module.exports = logExecutionTime;