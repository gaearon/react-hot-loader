export const createQueue = (runner = a => a()) => {
  let promise;
  let queue = [];

  const runAll = () => {
    const oldQueue = queue;
    oldQueue.forEach(cb => cb());
    queue = [];
  };

  const add = cb => {
    if (queue.length === 0) {
      promise = Promise.resolve().then(() => runner(runAll()));
    }
    queue.push(cb);

    return promise;
  };

  return add;
};
