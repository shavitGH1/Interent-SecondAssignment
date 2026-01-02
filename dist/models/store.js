"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetStore = exports.state = void 0;
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
exports.state = state;
const resetStore = () => {
    const fresh = initialState();
    Object.keys(fresh).forEach((key) => {
        state[key] = fresh[key];
    });
};
exports.resetStore = resetStore;
