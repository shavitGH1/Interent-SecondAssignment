const initialState = () => ({
  items: [],
  nextItemId: 1,
  posts: [],
  comments: [],
  users: [],
  sessions: [],
  nextSenderId: 1
});

const state = initialState();

const resetStore = () => {
  const fresh = initialState();
  Object.keys(fresh).forEach((key) => {
    state[key] = fresh[key];
  });
};

module.exports = { state, resetStore };
