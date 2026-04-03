import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const postProfile = async (formData) => {
  try {
    const response = await api.post('/api/profile', formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Legacy: string scenarioKey for predefined scenarios
export const postSimulate = async (userProfile, scenario, years = 15, iterations = 3000) => {
  try {
    const response = await api.post('/api/simulate', {
      userProfile,
      scenario,      // B1 fix: send only 'scenario'
      years,
      iterations
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// New: full scenario object from AI parser
export const postSimulateScenario = async (scenario, userProfile, portfolio, profile) => {
  try {
    const response = await api.post('/api/simulate', {
      scenario,
      userProfile,
      portfolio,
      profile
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postScenarioParse = async (userInput, portfolio, profile) => {
  try {
    const response = await api.post('/api/scenario-parse', { userInput, portfolio, profile });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postHealthScore = async (profile, portfolio) => {
  try {
    const response = await api.post('/api/health-score', { profile, portfolio });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postGoalsProject = async (goals, profile, portfolio) => {
  try {
    const response = await api.post('/api/goals/project', { goals, profile, portfolio });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postTaxOptimize = async (portfolio, profile) => {
  try {
    const response = await api.post('/api/tax-optimize', { portfolio, profile });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postReportGenerate = async (profile, portfolio, simulationResult, healthScore) => {
  try {
    const response = await api.post('/api/report/generate', { profile, portfolio, simulationResult, healthScore });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPortfolio = async () => {
  try {
    const response = await api.get('/api/portfolio');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postRebalance = async (portfolio) => {
  try {
    const response = await api.post('/api/rebalance', { portfolio });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postProject = async (currentPortfolio, rebalancedPortfolio) => {
  try {
    const response = await api.post('/api/project', { currentPortfolio, rebalancedPortfolio });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
