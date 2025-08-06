import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

const SEOManager = ({ 
  title,
  description,
  keywords,
  image,
  article,
  author,
  publishedTime,
  modifiedTime,
  category,
  tags = [],
  canonicalUrl,
  noIndex = false,
  customSchema,
  articleId
}) => {
  const location = useLocation();
  
  // Default values
  const siteTitle = "Science Digest News";
  const siteDescription = "Останні наукові відкриття та дослідження з усього світу. Технології, медицина, космос, ШІ та інновації.";
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://sciencedigestnews.com";
  const defaultImage = "https://images.unsplash.com/photo-1576086213369-97a306d36557?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwcmVzZWFyY2h8ZW58MHx8fHwxNzU0NTE5MDEwfDA&ixlib=rb-4.1.0&q=85";
  const gaTrackingId = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-PLACEHOLDER123';
  
  // Build full title
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Build canonical URL
  const canonical = canonicalUrl || `${siteUrl}${location.pathname}`;
  
  // Build meta keywords from tags and keywords
  const metaKeywords = [
    ...(keywords ? keywords.split(',').map(k => k.trim()) : []),
    ...tags,
    'Science Digest News',
    'наука',
    'дослідження',
    'технології',
    'ШІ',
    'медицина'
  ].filter(Boolean).slice(0, 10).join(', ');

  // Track article view when component mounts
  useEffect(() => {
    if (article && articleId && title) {
      analytics.trackArticleView(articleId, title, category, author);
    }
  }, [article, articleId, title, category, author]);
  
  // Build structured data
  const generateStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@graph": [
        // Website schema
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          "url": siteUrl,
          "name": siteTitle,
          "description": siteDescription,
          "publisher": {
            "@id": `${siteUrl}/#organization`
          },
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          ]
        },
        // Organization schema
        {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          "name": siteTitle,
          "url": siteUrl,
          "description": siteDescription,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`,
            "width": 512,
            "height": 512
          },
          "sameAs": [
            "https://twitter.com/sciencedigestnews",
            "https://facebook.com/sciencedigestnews",
            "https://linkedin.com/company/sciencedigestnews"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+380-44-000-0000",
            "contactType": "customer service",
            "email": "contact@sciencedigestnews.com"
          }
        }
      ]
    };

    // Add article schema if this is an article page
    if (article) {
      baseSchema["@graph"].push({
        "@type": "NewsArticle",
        "@id": `${canonical}/#article`,
        "url": canonical,
        "headline": title,
        "description": description,
        "image": {
          "@type": "ImageObject",
          "url": image || defaultImage,
          "width": 1200,
          "height": 630
        },
        "author": {
          "@type": "Person",
          "name": author || "Science Digest News Team",
          "url": `${siteUrl}/author/${author?.toLowerCase().replace(/\s+/g, '-') || 'team'}`
        },
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical
        },
        "articleSection": category,
        "keywords": tags.join(', '),
        "inLanguage": "en-US"
      });

      // Add breadcrumb schema for articles
      baseSchema["@graph"].push({
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category || "News",
            "item": `${siteUrl}/category/${category?.toLowerCase().replace(/\s+/g, '-') || 'news'}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": title,
            "item": canonical
          }
        ]
      });
    }

    // Add WebPage schema for non-article pages
    if (!article) {
      baseSchema["@graph"].push({
        "@type": "WebPage",
        "@id": `${canonical}/#webpage`,
        "url": canonical,
        "name": title || siteTitle,
        "description": description || siteDescription,
        "isPartOf": {
          "@id": `${siteUrl}/#website`
        },
        "about": {
          "@id": `${siteUrl}/#organization`
        },
        "inLanguage": "en-US"
      });
    }

    // Merge custom schema if provided
    if (customSchema) {
      baseSchema["@graph"] = [...baseSchema["@graph"], ...customSchema];
    }

    return baseSchema;
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || siteDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="author" content={author || "Science Digest News"} />
      <link rel="canonical" href={canonical} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || siteDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph */}
      {article && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {category && <meta property="article:section" content={category} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@edgechronicle" />
      <meta name="twitter:creator" content="@edgechronicle" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || siteDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="theme-color" content="#dc2626" />
      
      {/* Google Analytics */}
      {gaTrackingId && gaTrackingId !== 'G-PLACEHOLDER123' && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaTrackingId}', {
                page_title: '${fullTitle}',
                page_location: '${canonical}'
              });
            `}
          </script>
        </>
      )}
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
    </Helmet>
  );
};

export default SEOManager;