import { create } from 'zustand';

const initialState = {
  userProfile: null,
  twinState: null,
  simulationResult: null,
  portfolio: [],
  rebalanceActions: [],
  projectionResult: null,
  healthScore: null,
  goalsResult: null,
  isLoading: false,
  error: null,
};

export const useTwinStore = create((set, get) => ({
  ...initialState,

  setUserProfile: (profile) => set({ userProfile: profile }),
  updateProfile: (partial) => set((state) => ({
    userProfile: { ...state.userProfile, ...partial }
  })),
  setTwinState: (state) => set({ twinState: state }),
  setSimulationResult: (result) => set({ simulationResult: result }),
  setPortfolio: (holdings) => set({ portfolio: holdings }),
  setRebalanceActions: (actions) => set({ rebalanceActions: actions }),
  setProjectionResult: (result) => set({ projectionResult: result }),
  setHealthScore: (score) => set({ healthScore: score }),
  setGoalsResult: (result) => set({ goalsResult: result }),
  setLoading: (bool) => set({ isLoading: bool }),
  setError: (msg) => set({ error: msg }),
  resetAll: () => set(initialState),
}));

