const fs = require('fs');
const path = require('path');
const config = require('../config/keywordConfig.json');
const industryKeywords = require('../config/industryKeywords.json');

/**
 * Dynamic Keyword Service - Uses comprehensive local industry keyword database
 * No external API dependencies - fast and reliable
 */
class DynamicKeywordService {
  constructor() {
    this.cacheFile = path.join(__dirname, '../cache/industryKeywords.json');
    this.cacheExpiry = config.cacheSettings.expiryTime;
    this.industryKeywords = industryKeywords;
  }

  /**
   * Get industry keywords from comprehensive local database
   */
  async getIndustryKeywords(industry, role = 'Senior') {
    try {
      // Get keywords from our comprehensive local database
      const keywords = this.industryKeywords[industry];
      
      if (keywords && keywords.length > 0) {
        console.log(`📊 Local Database (${industry}): Found ${keywords.length} industry keywords`);
        
        // Update cache for consistency
        await this.updateCache(industry, keywords);
        return keywords;
      }
      
      // If no keywords found for industry, return empty array
      console.warn(`⚠️ No keywords found for ${industry} in local database`);
      return [];
    } catch (error) {
      console.warn('⚠️ Local keyword fetch failed:', error.message);
      return [];
    }
  }

  /**
   * Get keywords from cache
   */
  async getFromCache(industry) {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        return [];
      }

      const cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      const industryData = cache[industry];

      if (!industryData || this.isCacheExpired(industryData.timestamp)) {
        return [];
      }

      return industryData.keywords;
    } catch (error) {
      console.warn('Cache read failed:', error.message);
      return [];
    }
  }

  /**
   * Update cache with new keywords
   */
  async updateCache(industry, keywords) {
    try {
      const cacheDir = path.dirname(this.cacheFile);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      let cache = {};
      if (fs.existsSync(this.cacheFile)) {
        cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      }

      cache[industry] = {
        keywords: keywords,
        timestamp: Date.now()
      };

      fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.warn('Cache update failed:', error.message);
    }
  }

  /**
   * Check if cache is expired
   */
  isCacheExpired(timestamp) {
    return Date.now() - timestamp > this.cacheExpiry;
  }

  /**
   * Get action verbs dynamically
   */
  async getActionVerbs() {
    try {
      // Return enhanced static list
      return [
        'achieved', 'accomplished', 'administered', 'analyzed', 'built', 'created',
        'developed', 'designed', 'executed', 'implemented', 'improved', 'increased',
        'led', 'managed', 'optimized', 'produced', 'reduced', 'streamlined',
        'transformed', 'delivered', 'established', 'expanded', 'generated', 'initiated',
        'innovated', 'orchestrated', 'pioneered', 'revolutionized', 'spearheaded',
        'accelerated', 'boosted', 'enhanced', 'maximized', 'minimized', 'scaled'
      ];
    } catch (error) {
      console.warn('Action verbs fetch failed:', error.message);
      return this.getFallbackActionVerbs();
    }
  }

  getFallbackActionVerbs() {
    return config.actionVerbs;
  }
}

module.exports = DynamicKeywordService;