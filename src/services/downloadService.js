/**
 * Download Service
 * Handles downloading and uploading user data, subtitles, and other files
 */

export class DownloadService {
  /**
   * Download user data as JSON file
   * @param {Object} userData - User data to download
   * @param {string} fileName - Name of the file (default: otazumi-data-backup)
   */
  static downloadUserData(userData, fileName = null) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFileName = `otazumi-data-backup-${timestamp}.json`;
      
      // Format the data nicely
      const dataToDownload = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        user: {
          uid: userData.uid || null,
          email: userData.email || null,
          displayName: userData.displayName || null,
        },
        watchlist: userData.watchlist || [],
        favorites: userData.favorites || [],
        history: userData.history || [],
        preferences: userData.preferences || {},
        continueWatching: userData.continueWatching || [],
      };

      const jsonString = JSON.stringify(dataToDownload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || defaultFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('✅ User data downloaded successfully');
      return { success: true, message: 'Data downloaded successfully' };
    } catch (error) {
      console.error('❌ Error downloading user data:', error);
      throw error;
    }
  }

  /**
   * Parse and validate uploaded user data JSON file
   * @param {File} file - The uploaded JSON file
   * @returns {Promise<Object>} Parsed and validated user data
   */
  static async uploadUserData(file) {
    return new Promise((resolve, reject) => {
      try {
        if (!file) {
          reject(new Error('No file provided'));
          return;
        }

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
          reject(new Error('Invalid file type. Please upload a JSON file.'));
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const data = JSON.parse(content);

            // Validate the data structure
            if (!data.version) {
              reject(new Error('Invalid backup file: missing version'));
              return;
            }

            // Validate required fields
            const validatedData = {
              watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
              favorites: Array.isArray(data.favorites) ? data.favorites : [],
              history: Array.isArray(data.history) ? data.history : [],
              preferences: typeof data.preferences === 'object' ? data.preferences : {},
              continueWatching: Array.isArray(data.continueWatching) ? data.continueWatching : [],
            };

            console.log('✅ User data uploaded and validated successfully');
            resolve({
              success: true,
              data: validatedData,
              importDate: data.exportDate,
            });
          } catch (parseError) {
            reject(new Error('Invalid JSON file: ' + parseError.message));
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
      } catch (error) {
        console.error('❌ Error uploading user data:', error);
        reject(error);
      }
    });
  }

  /**
   * Download subtitle/caption file
   * @param {string} subtitleUrl - URL of the subtitle file
   * @param {string} fileName - Name for the downloaded file
   * @param {string} animeTitle - Anime title for filename
   * @param {string} episode - Episode number
   */
  static async downloadSubtitle(subtitleUrl, fileName = null, animeTitle = null, episode = null) {
    try {
      // Generate a sensible filename
      let downloadFileName = fileName;
      if (!downloadFileName) {
        const cleanTitle = animeTitle 
          ? animeTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()
          : 'subtitle';
        const episodeStr = episode ? `-episode-${episode}` : '';
        const extension = subtitleUrl.includes('.vtt') ? '.vtt' : '.srt';
        downloadFileName = `${cleanTitle}${episodeStr}${extension}`;
      }

      // Fetch the subtitle file
      const response = await fetch(subtitleUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subtitle file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('✅ Subtitle downloaded successfully:', downloadFileName);
      return { success: true, message: 'Subtitle downloaded successfully' };
    } catch (error) {
      console.error('❌ Error downloading subtitle:', error);
      
      // Fallback: try to open in new tab if direct download fails
      try {
        window.open(subtitleUrl, '_blank');
        return { 
          success: true, 
          message: 'Subtitle opened in new tab (direct download not available)' 
        };
      } catch (fallbackError) {
        throw new Error('Unable to download subtitle. The subtitle may not be available for download.');
      }
    }
  }

  /**
   * Download any text content as a file
   * @param {string} content - Text content to download
   * @param {string} fileName - Name of the file
   * @param {string} mimeType - MIME type (default: text/plain)
   */
  static downloadTextFile(content, fileName, mimeType = 'text/plain') {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('✅ File downloaded successfully:', fileName);
      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Download data as CSV file
   * @param {Array} data - Array of objects to convert to CSV
   * @param {string} fileName - Name of the CSV file
   */
  static downloadCSV(data, fileName) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data to export');
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          let value = row[header];
          
          // Handle special characters in CSV
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""'); // Escape quotes
            if (value.includes(',') || value.includes('\n') || value.includes('"')) {
              value = `"${value}"`; // Wrap in quotes if contains special chars
            }
          }
          
          return value;
        });
        
        csvContent += values.join(',') + '\n';
      });

      return this.downloadTextFile(csvContent, fileName, 'text/csv');
    } catch (error) {
      console.error('❌ Error downloading CSV:', error);
      throw error;
    }
  }

  /**
   * Export watchlist as readable text file
   * @param {Array} watchlist - User's watchlist
   * @param {string} userName - User's name
   */
  static downloadWatchlistAsText(watchlist, userName = 'User') {
    try {
      const timestamp = new Date().toLocaleString();
      
      let content = `${userName}'s Anime Watchlist\n`;
      content += `Exported: ${timestamp}\n`;
      content += `Total Anime: ${watchlist.length}\n`;
      content += `${'='.repeat(50)}\n\n`;

      watchlist.forEach((anime, index) => {
        content += `${index + 1}. ${anime.title || anime.name || 'Unknown'}\n`;
        if (anime.status) content += `   Status: ${anime.status}\n`;
        if (anime.episodes) content += `   Episodes: ${anime.episodes}\n`;
        if (anime.rating) content += `   Rating: ${anime.rating}\n`;
        content += '\n';
      });

      const fileName = `watchlist-${new Date().toISOString().split('T')[0]}.txt`;
      return this.downloadTextFile(content, fileName, 'text/plain');
    } catch (error) {
      console.error('❌ Error downloading watchlist:', error);
      throw error;
    }
  }
}

export default DownloadService;
