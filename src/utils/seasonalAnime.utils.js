import axios from 'axios';

const ANILIST_API = 'https://graphql.anilist.co';

// Season mapping
const SEASON_MAP = {
  'WINTER': 'Winter',
  'SPRING': 'Spring',
  'SUMMER': 'Summer',
  'FALL': 'Fall'
};

export const fetchSeasonalAnime = async (season, year) => {
  const seasonUpper = season.toUpperCase();

  const query = `
    query ($season: MediaSeason, $seasonYear: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
          episodes
          duration
          status
          averageScore
          genres
          description
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          studios {
            nodes {
              name
            }
          }
        }
        pageInfo {
          hasNextPage
          currentPage
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API, {
      query,
      variables: {
        season: seasonUpper,
        seasonYear: year,
        page: 1
      }
    });

    const media = response.data.data.Page.media;

    // Transform AniList data to match our app's format
    return media.map(anime => ({
      id: `anilist-${anime.id}`,
      title: anime.title.english || anime.title.romaji,
      japanese_title: anime.title.romaji,
      poster: anime.coverImage.large || anime.coverImage.medium,
      description: anime.description,
      tvInfo: {
        showType: 'TV',
        duration: `${anime.duration}m`,
        sub: anime.episodes || 0,
        eps: anime.episodes,
        rating: anime.averageScore ? `${anime.averageScore}%` : null
      },
      genres: anime.genres,
      status: anime.status,
      releaseDate: anime.startDate.year ?
        `${anime.startDate.year}-${String(anime.startDate.month).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}` :
        null
    }));
  } catch (error) {
    console.error('Error fetching seasonal anime from AniList:', error);
    return [];
  }
};

export default fetchSeasonalAnime;