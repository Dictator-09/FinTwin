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

export const postSimulate = async (userProfile, scenario) => {
  try {
    const response = await api.post('/api/simulate', { userProfile, scenario });
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
