interface State {
  posts: any[];
  comments: any[];
  users: any[];
  sessions: any[];
  nextSenderId: number;
}

const initialState = (): State => ({
  posts: [],
  comments: [],
  users: [],
  sessions: [],
  nextSenderId: 1
});

const state: State = initialState();

const resetStore = (): void => {
  const fresh = initialState();
  (Object.keys(fresh) as Array<keyof State>).forEach((key) => {
    (state as any)[key] = fresh[key];
  });
};

export { state, resetStore };
