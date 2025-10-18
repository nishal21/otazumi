import axios from "axios";

const getSearch = async (keyword, page, filters = {}) => {
  const api_url = import.meta.env.VITE_API_URL;
  if (!page) page = 1;

  // Build query parameters
  const params = new URLSearchParams();
  params.append('page', page);

  if (keyword && keyword.trim()) {
    params.append('keyword', keyword.trim());
  }

  // Add filter parameters
  if (filters.season) {
    params.append('season', filters.season);
  }
  if (filters.year) {
    params.append('year', filters.year);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.type) {
    params.append('type', filters.type);
  }
  if (filters.genre) {
    params.append('genre', filters.genre);
  }

  try {
    const response = await axios.get(
      `${api_url}/search?${params.toString()}`
    );
    return response.data.results;
  } catch (err) {
    console.error("Error fetching search results:", err);
    return err;
  }
};

export default getSearch;
