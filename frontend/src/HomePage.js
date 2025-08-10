import React, { useState, useEffect } from 'react';
import { HeroSection, MainNews, SidebarNews, TrendingSection, PublicationsSection } from './components';

// Mock data for fallback
const mockNewsData = {
  hero: {
    id: 'hero-1',
    title: "Revolutionary AI Discovery: Scientists Create First Artificial Neural Network That Dreams",
    category: "AI & Computing",
    time: "18:15, 23.06.25",
    views: 2690,
    author: "Dr. Christina Zelenya",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=480&fit=crop&crop=entropy&fm=webp&q=75",
    url: "/article/hero-1"
  },
  mainNews: [
    {
      id: 1,
      title: "Mars Rover Discovers Evidence of Ancient Water Reservoirs Beneath Polar Ice Caps",
      category: "Space & Physics",
      time: "16:25, 23.06.25",
      views: 1456,
      author: "Alexander Kvasha",
      image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=300&fit=crop&crop=entropy&fm=webp&q=75",
      url: "/article/1"
    },
    {
      id: 2,
      title: "CRISPR Breakthrough: First Successful Treatment of Genetic Blindness in Clinical Trial",
      category: "Medicine",
      time: "15:18, 23.06.25",
      views: 2187,
      author: "Vera Khmelnitsky",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=entropy&fm=webp&q=75",
      url: "/article/2"
    },
    {
      id: 3,
      title: "Quantum Computing Milestone: IBM Achieves 1000-Qubit Processor Breakthrough",
      category: "Technology", 
      time: "14:32, 23.06.25",
      views: 3521,
      author: "Maxim Borisenko",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop&crop=entropy&fm=webp&q=75",
      url: "/article/3"
    }
  ],
  sidebarNews: [
    {
      id: 1,
      title: "New Study Reveals How Sleep Patterns Affect Cognitive Performance in Scientists",
      time: "02:23, 24.06.25",
      views: 98000,
      url: "/article/sidebar-1"
    },
    {
      id: 2,
      title: "Fusion Energy Breakthrough: ITER Project Achieves Sustained Plasma Reaction",
      time: "02:00, 24.06.25", 
      views: 826,
      url: "/article/sidebar-2"
    },
    {
      id: 3,
      title: "Neuroscience Discovery: Brain Cells Found to Regenerate at Higher Rates Than Expected",
      time: "01:45, 24.06.25",
      views: 1234,
      url: "/article/sidebar-3"
    }
  ],
  trending: [
    {
      id: 1,
      title: "Час від часу баюсь новинної думанки працює чи ще бактерії",
      time: "20:15, 23.06.25",
      views: 12432,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
      url: "/article/trending-1"
    },
    {
      id: 2,
      title: "5 корисна страва поніжчення тільки тієї кухетує сутичний мотикул",
      time: "19:45, 23.06.25", 
      views: 8765,
      image: "https://images.pexels.com/photos/5702098/pexels-photo-5702098.jpeg",
      url: "/article/trending-2"
    }
  ],
  publications: [
    {
      id: 1,
      title: "Від партизанщини до військової елітн як \"Азов\" більшого змінив українську армію",
      time: "17:30, 23.06.25",
      views: 15000,
      category: "Військо",
      author: "Сергій Казанський",
      image: "https://images.pexels.com/photos/11477798/pexels-photo-11477798.jpeg",
      url: "/article/pub-1"
    },
    {
      id: 2,
      title: "Люди-ту хто рятує глобальна катастрофа: смерч на Землі стрімко впевнимо киснів",
      time: "16:45, 23.06.25",
      views: 8750,
      category: "Екологія",
      author: "Ольга Романенко",
      image: "https://images.pexels.com/photos/32636715/pexels-photo-32636715.jpeg",
      url: "/article/pub-2"
    }
  ]
};

function HomePage() {
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/homepage/public`);
        const config = await response.json();
        
        if (config && config.blocks && config.blocks.length > 0) {
          // Convert homepage config to component data format
          const data = {
            hero: config.blocks.find(b => b.id === 'hero')?.articles[0] || mockNewsData.hero,
            mainNews: config.blocks.find(b => b.id === 'main')?.articles || mockNewsData.mainNews,
            sidebarNews: config.blocks.find(b => b.id === 'sidebar')?.articles || mockNewsData.sidebarNews,
            trending: config.blocks.find(b => b.id === 'trending')?.articles || mockNewsData.trending,
            publications: config.blocks.find(b => b.id === 'featured')?.articles || mockNewsData.publications
          };
          setHomepageData(data);
        } else {
          // Use mock data if no configuration
          setHomepageData(mockNewsData);
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
        // Fallback to mock data
        setHomepageData(mockNewsData);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const data = homepageData || mockNewsData;

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Science Digest News",
    "url": "https://sciencedigestnews.com",
    "logo": "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=200&h=200&fit=crop&crop=entropy&fm=webp&q=85",
    "description": "Останні наукові відкриття та дослідження з усього світу. Технології, медицина, космос, ШІ та інновації.",
    "mainEntity": {
      "@type": "NewsArticle",
      "headline": data.hero?.title || "Science News",
      "image": data.hero?.image || "",
      "author": {
        "@type": "Person",
        "name": data.hero?.author || "Science Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Science Digest News"
      },
      "datePublished": "2025-06-23T18:15:00Z",
      "dateModified": "2025-06-23T18:15:00Z"
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Main Content */}
      <main id="main-content" role="main">
        <HeroSection heroData={data.hero} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MainNews newsData={data.mainNews} />
              <TrendingSection trendingData={data.trending} />
              <PublicationsSection publicationsData={data.publications} />
            </div>
            <div className="lg:col-span-1">
              <SidebarNews sidebarData={data.sidebarNews} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default HomePage;