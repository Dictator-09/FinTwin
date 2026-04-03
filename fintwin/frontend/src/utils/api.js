import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export const postProfile = async (formData) => {
  const response = await api.post('/api/profile', formData);
  return response.data;
};

// Legacy: string scenarioKey for predefined scenarios
export const postSimulate = async (userProfile, scenario, years = 15, iterations = 3000) => {
  const response = await api.post('/api/simulate', {
    userProfile,
    scenario,      // B1 fix: send only 'scenario'
    years,
    iterations
  });
  return response.data;
};

// New: full scenario object from AI parser
export const postSimulateScenario = async (scenario, userProfile, portfolio, profile) => {
  const response = await api.post('/api/simulate', {
    scenario,
    userProfile,
    portfolio,
    profile
  });
  return response.data;
};

export const postScenarioParse = async (userInput, portfolio, profile) => {
  const response = await api.post('/api/scenario-parse', { userInput, portfolio, profile });
  return response.data;
};

export const postHealthScore = async (profile, portfolio) => {
  const response = await api.post('/api/health-score', { profile, portfolio });
  return response.data;
};

export const postGoalsProject = async (goals, profile, portfolio) => {
  const response = await api.post('/api/goals/project', { goals, profile, portfolio });
  return response.data;
};

export const postTaxOptimize = async (portfolio, profile) => {
  const response = await api.post('/api/tax-optimize', { portfolio, profile });
  return response.data;
};

export const postReportGenerate = async (profile, portfolio, simulationResult, healthScore) => {
  const response = await api.post('/api/report/generate', { profile, portfolio, simulationResult, healthScore });
  return response.data;
};

export const getPortfolio = async () => {
  const response = await api.get('/api/portfolio');
  return response.data;
};

export const postRebalance = async (portfolio) => {
  const response = await api.post('/api/rebalance', { portfolio });
  return response.data;
};

export const postProject = async (currentPortfolio, rebalancedPortfolio) => {
  const response = await api.post('/api/project', { currentPortfolio, rebalancedPortfolio });
  return response.data;
};

export default api;
