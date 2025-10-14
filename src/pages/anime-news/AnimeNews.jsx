import { useState, useEffect } from 'react';
import Loader from '../../components/Loader/Loader';
import Error from '../../components/error/Error';

function AnimeNews() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'anime', 'manga'

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const proxyUrl = import.meta.env.VITE_PROXY_URL;
        const feeds = [
          'https://www.animenewsnetwork.com/news/rss.xml'
        ];

        const fetchPromises = feeds.map(async (feedUrl) => {
          try {
            const response = await fetch(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
            if (!response.ok) {
              console.warn(`Failed to fetch ${feedUrl}: ${response.status}`);
              return []; // Return empty array for failed feeds
            }
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            return Array.from(items).map(item => {
              const description = item.querySelector('description')?.textContent || '';
              let imageUrl = null;

              // Try to find image in description HTML
              const descImgMatch = description.match(/<img[^>]+src="([^">]+)"/);
              if (descImgMatch) {
                imageUrl = descImgMatch[1];
              }

              // Try to find media:content
              const mediaContent = item.querySelector('media\\:content') || item.querySelector('[url]');
              if (mediaContent && mediaContent.getAttribute('url')) {
                imageUrl = mediaContent.getAttribute('url');
              }

              // Try enclosure
              const enclosure = item.querySelector('enclosure');
              if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
                imageUrl = enclosure.getAttribute('url');
              }

              // Make sure URL is absolute
              if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = 'https://www.animenewsnetwork.com' + imageUrl;
              }

              const title = item.querySelector('title')?.textContent || '';
              const content = (title + ' ' + description).toLowerCase();
              
              let category = 'Other';
              if (content.includes('anime') || content.includes('tv series') || content.includes('ova') || content.includes('ona')) {
                category = 'Anime';
              } else if (content.includes('manga') || content.includes('manhwa') || content.includes('manhua')) {
                category = 'Manga';
              }

              return {
                title: title,
                link: item.querySelector('link')?.textContent || '',
                description: description.replace(/<[^>]*>/g, '').trim(),
                pubDate: item.querySelector('pubDate')?.textContent || '',
                image: imageUrl,
                category: category,
              };
            });
          } catch (err) {
            console.warn(`Error fetching ${feedUrl}:`, err);
            return []; // Return empty array on error
          }
        });

        const results = await Promise.all(fetchPromises);
        const allNews = results.flat();

        // Sort by date (newest first)
        allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        setNews(allNews);
        setFilteredNews(allNews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category.toLowerCase() === filter));
    }
  }, [filter, news]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Loader type="home" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Error />
      </div>
    );
  }

  return (
    <div className="pt-16 w-full min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <style>
        {`
          .radio-button-container {
            display: flex;
            align-items: center;
            gap: 24px;
          }

          .radio-button {
            display: inline-block;
            position: relative;
            cursor: pointer;
          }

          .radio-button__input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }

          .radio-button__label {
            display: inline-block;
            padding-left: 30px;
            margin-bottom: 10px;
            position: relative;
            font-size: 15px;
            color: #f2f2f2;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.3s ease;
          }

          .radio-button__custom {
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #555;
            transition: all 0.3s ease;
          }

          .radio-button__input:checked + .radio-button__label .radio-button__custom {
            background-color: #4c8bf5;
            border-color: transparent;
            transform: scale(0.8);
            box-shadow: 0 0 20px #4c8bf580;
          }

          .radio-button__input:checked + .radio-button__label {
            color: #4c8bf5;
          }

          .radio-button__label:hover .radio-button__custom {
            transform: scale(1.2);
            border-color: #4c8bf5;
            box-shadow: 0 0 20px #4c8bf580;
          }
        `}
      </style>
      <div className="text-white p-4">
        <h1 className="text-3xl font-bold mb-6">Anime & Manga News</h1>
        
        {/* Filter Radio Buttons */}
        <div className="radio-button-container mb-6">
          <div className="radio-button">
            <input 
              type="radio" 
              className="radio-button__input" 
              id="radio-all" 
              name="filter-group"
              value="all"
              checked={filter === 'all'}
              onChange={(e) => setFilter(e.target.value)}
            />
            <label className="radio-button__label" htmlFor="radio-all">
              <span className="radio-button__custom"></span>
              All News
            </label>
          </div>
          <div className="radio-button">
            <input 
              type="radio" 
              className="radio-button__input" 
              id="radio-anime" 
              name="filter-group"
              value="anime"
              checked={filter === 'anime'}
              onChange={(e) => setFilter(e.target.value)}
            />
            <label className="radio-button__label" htmlFor="radio-anime">
              <span className="radio-button__custom"></span>
              Anime
            </label>
          </div>
          <div className="radio-button">
            <input 
              type="radio" 
              className="radio-button__input" 
              id="radio-manga" 
              name="filter-group"
              value="manga"
              checked={filter === 'manga'}
              onChange={(e) => setFilter(e.target.value)}
            />
            <label className="radio-button__label" htmlFor="radio-manga">
              <span className="radio-button__custom"></span>
              Manga
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
              {item.image ? (
                <>
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${item.category === 'Anime' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                      {item.category}
                    </span>
                    <p className="text-gray-400 text-sm">{new Date(item.pubDate).toLocaleDateString()}</p>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{item.description}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${item.category === 'Anime' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                      {item.category}
                    </span>
                    <p className="text-gray-400 text-sm">{new Date(item.pubDate).toLocaleDateString()}</p>
                  </div>
                  <h2 className="text-xl font-semibold leading-tight">{item.title}</h2>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              )}
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-400 hover:text-blue-300 font-medium">
                Read more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnimeNews;