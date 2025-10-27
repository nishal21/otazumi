import axios from "axios";

const getQtip = async (id) => {
  try {
    const api_url = import.meta.env.VITE_API_URL;
    if (!api_url) throw new Error("No API endpoint defined.");
    const response = await axios.get(`${api_url}/info?id=${id}`, { timeout: 5000 });
    return response.data.results.data;
  } catch (err) {
    console.error("Error fetching qtip info:", err);
    return null; 
  }
};

export default getQtip;
