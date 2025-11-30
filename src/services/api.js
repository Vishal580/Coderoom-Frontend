import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Compile code endpoint
export const compileCode = async (code, language) => {
  try {
    const response = await api.post("/compile", {
      code,
      language,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to compile code" };
  }
};




