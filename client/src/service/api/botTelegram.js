import axios from "axios";

const API_BASE = import.meta.env.VITE_REACT_APP_API;

/**
 * Get list of bots for an apartment
 */
export const listBots = async (apartmentId) => {
    const response = await axios.get(`${API_BASE}/bots`, {
        params: { apartmentId }
    });
    return response.data;
};

/**
 * Create a new bot
 */
export const createBot = async (data) => {
    const response = await axios.post(`${API_BASE}/bots`, data);
    return response.data;
};

/**
 * Update a bot
 */
export const updateBot = async (botId, data) => {
    const response = await axios.put(`${API_BASE}/bots/${botId}`, data);
    return response.data;
};

/**
 * Delete a bot
 */
export const deleteBot = async (botId) => {
    const response = await axios.delete(`${API_BASE}/bots/${botId}`);
    return response.data;
};

/**
 * Sync bot updates (sync telegram updates)
 */
export const syncBot = async (botId) => {
    const response = await axios.get(`${API_BASE}/update-bot-telegram`, {
        params: { botId }
    });
    return response.data;
};

