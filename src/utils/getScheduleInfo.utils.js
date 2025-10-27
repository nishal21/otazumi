import axios from "axios";
import getAnimeInfo from "./getAnimeInfo.utils";

export default async function getSchedInfo(date) {
  try {
    const api_url = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${api_url}/schedule?date=${date}`);
    const scheduleData = response.data.results;

    // Enrich schedule data with anime info
    if (Array.isArray(scheduleData)) {
      const enrichedData = await Promise.all(
        scheduleData.map(async (item) => {
          try {
            const animeData = await getAnimeInfo(item.id, false);
            return {
              ...item,
              poster: animeData?.data?.poster,
              title: animeData?.data?.title || item.title,
              // Add other anime info as needed
            };
          } catch (error) {
            console.error(`Error fetching anime info for ${item.id}:`, error);
            return item; // Return original item if anime info fetch fails
          }
        })
      );
      return enrichedData;
    }

    return scheduleData;
  } catch (error) {
    console.error(error);
    return error;
  }
}
