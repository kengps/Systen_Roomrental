import axios from "axios";

const API_BASE = import.meta.env.VITE_REACT_APP_API;

/**
 * Get Telegram updates for an apartment
 * @param {string} apartmentId - Apartment ID
 * @param {object} options - Query options (processed, startDate, endDate, limit, skip)
 */
export const getTelegramUpdates = async (apartmentId, options = {}) => {
    const params = {
        apartmentId,
        ...options
    };
    
    const response = await axios.get(`${API_BASE}/telegram-updates`, { params });
    return response.data;
};

