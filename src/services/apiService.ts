import axios from "axios";

const API_BASE = "/api";

export const analyzeCSV = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API_BASE}/analyze`, formData);
    return response.data;
  } catch (error: any) {
    console.error("API Error [analyzeCSV]:", error.response?.data || error.message);
    throw error;
  }
};

export const getTelemetry = async () => {
  try {
    const response = await axios.get(`${API_BASE}/telemetry`);
    return response.data;
  } catch (error: any) {
    console.error("API Error [getTelemetry]:", error.response?.data || error.message);
    throw error;
  }
};

export const getCompliance = async () => {
  try {
    const response = await axios.get(`${API_BASE}/compliance/status`);
    return response.data;
  } catch (error: any) {
    console.error("API Error [getCompliance]:", error.response?.data || error.message);
    throw error;
  }
};

export const retrainModel = async (modelType: string, parameters: any) => {
  try {
    const response = await axios.post(`${API_BASE}/retrain`, {
      modelType,
      parameters
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error [retrainModel]:", error.response?.data || error.message);
    throw error;
  }
};

export const runSecurityScan = async () => {
  try {
    const response = await axios.get(`${API_BASE}/security/scan`);
    return response.data;
  } catch (error: any) {
    console.error("API Error [runSecurityScan]:", error.response?.data || error.message);
    throw error;
  }
};
