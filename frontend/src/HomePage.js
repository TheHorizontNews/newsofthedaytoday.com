import React from 'react';
import { HeroSection, MainNews, SidebarNews, TrendingSection, PublicationsSection } from './components';

// Mock data for the news website
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
    },
    {
      id: 4,
      title: "Climate Solution: New Carbon Capture Technology Removes CO2 at Record Efficiency",
      category: "Environment",
      time: "13:45, 23.06.25", 
      views: 1876,
      author: "Andrew Petrenko",
      image: "https://images.unsplash.com/photo-1569163139394-de44cb5cd02c",
      url: "/article/4"
    },
    {
      id: 5,
      title: "Medical Breakthrough: Lab-Grown Organs Successfully Transplanted in Human Patients",
      category: "Medicine",
      time: "12:15, 23.06.25",
      views: 4562,
      author: "Marina Gavrilenko",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063",
      url: "/article/5"
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
    },
    {
      id: 4,
      title: "Space Exploration: New Exoplanet Shows Signs of Atmospheric Water Vapor",
      time: "01:30, 24.06.25",
      views: 567,
      url: "/article/sidebar-4"
    },
    {
      id: 5,
      title: "Biotech Innovation: 3D-Printed Heart Tissue Successfully Tested in Laboratory",
      time: "01:15, 24.06.25",
      views: 789,
      url: "/article/sidebar-5"
    },
    {
      id: 6,
      title: "Renewable Energy: Solar Panel Efficiency Reaches New Record of 47%",
      time: "01:00, 24.06.25",
      views: 2345,
      url: "/article/sidebar-6"
    },
    {
      id: 7,
      title: "AI Research: Machine Learning Algorithm Predicts Protein Folding with 95% Accuracy",
      time: "00:45, 24.06.25",
      views: 1567,
      url: "/article/sidebar-7"
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
    },
    {
      id: 3, 
      title: "Страхи за наше майбутнє: чому медлич деян воду до парообразних олив",
      time: "19:22, 23.06.25",
      views: 6543,
      image: "https://images.pexels.com/photos/32636715/pexels-photo-32636715.jpeg",
      url: "/article/trending-3"
    },
    {
      id: 4,
      title: "Автомобіль був одного разу розвинений програмні частини будинку",
      time: "18:55, 23.06.25",
      views: 4321,
      image: "https://images.unsplash.com/photo-1601132531233-0b5e07c99b57",
      url: "/article/trending-4"
    },
    {
      id: 5,
      title: "Лекарства Росія Польща 2 році є тим пікніком крон в пострадання",
      time: "18:30, 23.06.25",
      views: 9876,
      image: "https://images.unsplash.com/photo-1645940516176-895efb443c1f",
      url: "/article/trending-5"
    },
    {
      id: 6,
      title: "Астрологічний пореми-метод очілен надмуванням зі Львова",
      time: "18:15, 23.06.25",
      views: 5432,
      image: "https://images.pexels.com/photos/5725589/pexels-photo-5725589.jpeg",
      url: "/article/trending-6"
    }
  ],
  publications: [
    {
      id: 1,
      title: "Від партизанщини до військової елітн як \"Азов\" більशого змінив українську армію",
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
    },
    {
      id: 3,
      title: "Вчені виявили найстаріший загублений континент на Землі",
      time: "15:20, 23.06.25", 
      views: 12300,
      category: "Наука",
      author: "Дмитро Ковальчук",
      image: "https://images.unsplash.com/photo-1601132531233-0b5e07c99b57",
      url: "/article/pub-3"
    }
  ]
};

function HomePage() {
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
      "headline": mockNewsData.hero.title,
      "image": mockNewsData.hero.image,
      "author": {
        "@type": "Person",
        "name": mockNewsData.hero.author
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
        <HeroSection heroData={mockNewsData.hero} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MainNews newsData={mockNewsData.mainNews} />
              <TrendingSection trendingData={mockNewsData.trending} />
              <PublicationsSection publicationsData={mockNewsData.publications} />
            </div>
            <div className="lg:col-span-1">
              <SidebarNews sidebarData={mockNewsData.sidebarNews} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default HomePage;