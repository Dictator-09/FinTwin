import { create } from 'zustand';

const initialState = {
  userProfile: null,
  twinState: null,
  simulationResult: null,
  portfolio: [],
  rebalanceActions: [],
  projectionResult: null,
  isLoading: false,
  error: null,
};

export const useTwinStore = create((set) => ({
  ...initialState,

  setUserProfile: (profile) => set({ userProfile: profile }),
  setTwinState: (state) => set({ twinState: state }),
  setSimulationResult: (result) => set({ simulationResult: result }),
  setPortfolio: (holdings) => set({ portfolio: holdings }),
  setRebalanceActions: (actions) => set({ rebalanceActions: actions }),
  setProjectionResult: (result) => set({ projectionResult: result }),
  setLoading: (bool) => set({ isLoading: bool }),
  setError: (msg) => set({ error: msg }),
  resetAll: () => set(initialState),
}));
