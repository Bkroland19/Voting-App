import { createStore, createHook } from 'react-sweet-state';

const Store = createStore({
  // value of the store on initialisation
  initialState: {
    user: null,
    drawerState: false,
    addPositionModal: false,
    listPositionModal : false,
    positions: [],
    refreshDrawer : false,
    addNomineeModal: false,
  },
  // actions that trigger store mutation
  actions: { 
    addDrawerState: (value) =>
    ({ setState, getState }) => {
      setState({
        drawerState: value,
      });
    },
    
    addUser: 
      (userData) =>
      ({ setState, getState }) => {
        setState({
          user: userData,
        });
      },

      addPosition:
      (value) =>
      ({ setState, getState }) => {
        setState({
          addPositionModal: value,
        });
      },

      listPositions:
      (value) =>
      ({ setState, getState }) => {
        setState({
          listPositionModal: value,
        });
      },
      getPositions:
      (value) =>
      ({ setState, getState }) => {
        setState({
          positions: value,
        });
      },
      refreshDrawer:
      (value) =>
      ({ setState, getState }) => {
        setState({
          refreshDrawer: !getState().refreshDrawer,
        });
      },

      addNominee:
      (value) =>
      ({ setState, getState }) => {
        setState({
          addNomineeModal: value,
        });
      },
  },
});

export const useCounter = createHook(Store);