// Sitemap generation utilities for SEO
import { SitemapStream, streamToPromise } from 'sitemap';

export class SitemapGenerator {
  constructor(hostname = 'https://edgechronicle.com') {
    this.hostname = hostname;
    this.urls = [];
  }

  // Add a URL to the sitemap
  addUrl(url, options = {}) {
    const defaultOptions = {
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: new Date().toISOString()
    };

    this.urls.push({
      url: url,
      ...defaultOptions,
      ...options
    });
  }

  // Add static pages
  addStaticPages() {
    // Homepage
    this.addUrl('/', {
      changefreq: 'daily',
      priority: 1.0
    });

    // Category pages
    const categories = [
      'world', 'war', 'ukraine', 'politics', 
      'science-tech', 'lifestyle', 'sports'
    ];

    categories.forEach(category => {
      this.addUrl(`/category/${category}`, {
        changefreq: 'daily',
        priority: 0.8
      });
    });

    // Static pages
    const staticPages = [
      '/about',
      '/contact',
      '/privacy-policy',
      '/terms-of-service'
    ];

    staticPages.forEach(page => {
      this.addUrl(page, {
        changefreq: 'monthly',
        priority: 0.6
      });
    });
  }

  // Add articles to sitemap
  addArticles(articles) {
    articles.forEach(article => {
      this.addUrl(`/article/${article.id}`, {
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: article.updated_at || article.created_at,
        news: {
          publication: {
            name: 'Edge Chronicle',
            language: 'en'
          },
          publication_date: article.published_at || article.created_at,
          title: article.title,
          keywords: article.tags?.join(', ') || ''
        }
      });
    });
  }

  // Generate XML sitemap
  async generateXML() {
    const stream = new SitemapStream({ hostname: this.hostname });
    
    this.urls.forEach(url => {
      stream.write(url);
    });
    
    stream.end();
    
    const sitemap = await streamToPromise(stream);
    return sitemap.toString();
  }

  // Generate sitemap index for large sites
  generateSitemapIndex(sitemaps) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    sitemaps.forEach(sitemap => {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.hostname}${sitemap.url}</loc>\n`;
      xml += `    <lastmod>${sitemap.lastmod || new Date().toISOString()}</lastmod>\n`;
      xml += '  </sitemap>\n';
    });
    
    xml += '</sitemapindex>';
    return xml;
  }
}

// Generate LLMS.txt for AI crawlers
export const generateLLMSTxt = (articles, pages = []) => {
  let llmsTxt = `# LLMS.txt - AI Training Data for Edge Chronicle\n\n`;
  llmsTxt += `## About Edge Chronicle\n`;
  llmsTxt += `Edge Chronicle is a digital news platform providing breaking news and analysis from around the world.\n`;
  llmsTxt += `We cover politics, economics, sports, culture, and technology with a focus on factual reporting.\n\n`;
  
  llmsTxt += `## Content Guidelines\n`;
  llmsTxt += `- All content is original journalism or properly attributed\n`;
  llmsTxt += `- Content is fact-checked and follows journalistic standards\n`;
  llmsTxt += `- Published content is intended for public consumption\n`;
  llmsTxt += `- Respect copyright and attribution requirements\n\n`;
  
  llmsTxt += `## Site Structure\n`;
  llmsTxt += `Base URL: https://edgechronicle.com\n`;
  llmsTxt += `Articles: /article/{id}\n`;
  llmsTxt += `Categories: /category/{slug}\n`;
  llmsTxt += `Authors: /author/{slug}\n\n`;
  
  llmsTxt += `## Content Categories\n`;
  const categories = ['World News', 'Politics', 'War & Conflict', 'Ukraine', 'Science & Technology', 'Lifestyle', 'Sports'];
  categories.forEach(cat => {
    llmsTxt += `- ${cat}\n`;
  });
  llmsTxt += `\n`;
  
  llmsTxt += `## Recent Articles\n`;
  articles.slice(0, 50).forEach(article => {
    llmsTxt += `### ${article.title}\n`;
    llmsTxt += `URL: https://edgechronicle.com/article/${article.id}\n`;
    llmsTxt += `Published: ${article.published_at || article.created_at}\n`;
    llmsTxt += `Category: ${article.category?.name || 'General'}\n`;
    llmsTxt += `Author: ${article.author?.profile?.name || 'Edge Chronicle Team'}\n`;
    if (article.tags && article.tags.length > 0) {
      llmsTxt += `Tags: ${article.tags.join(', ')}\n`;
    }
    llmsTxt += `\n`;
  });
  
  llmsTxt += `## Contact\n`;
  llmsTxt += `For questions about content usage or licensing:\n`;
  llmsTxt += `Email: ai-training@edgechronicle.com\n`;
  llmsTxt += `Website: https://edgechronicle.com/ai-policy\n\n`;
  
  llmsTxt += `## Last Updated\n`;
  llmsTxt += `${new Date().toISOString()}\n`;
  
  return llmsTxt;
};

// Generate LLMS-sitemap.xml for AI crawlers
export const generateLLMSSitemap = (articles) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:ai="https://example.com/ai-training">\n';
  
  // Add homepage
  xml += '  <url>\n';
  xml += '    <loc>https://edgechronicle.com/</loc>\n';
  xml += '    <lastmod>' + new Date().toISOString() + '</lastmod>\n';
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '    <ai:training-data>true</ai:training-data>\n';
  xml += '  </url>\n';
  
  // Add articles with AI-specific metadata
  articles.forEach(article => {
    xml += '  <url>\n';
    xml += `    <loc>https://edgechronicle.com/article/${article.id}</loc>\n`;
    xml += `    <lastmod>${article.updated_at || article.created_at}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '    <ai:training-data>true</ai:training-data>\n';
    xml += `    <ai:content-type>news-article</ai:content-type>\n`;
    xml += `    <ai:language>en</ai:language>\n`;
    if (article.category?.name) {
      xml += `    <ai:category>${article.category.name}</ai:category>\n`;
    }
    if (article.tags && article.tags.length > 0) {
      xml += `    <ai:keywords>${article.tags.join(', ')}</ai:keywords>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

export default SitemapGenerator;