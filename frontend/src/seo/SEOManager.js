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
  const siteTitle = "Edge Chronicle";
  const siteDescription = "Breaking news and analysis from around the world. Stay informed with the latest developments in politics, economics, sports, and culture.";
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://edgechronicle.com";
  const defaultImage = `${siteUrl}/og-default.jpg`;
  const gaTrackingId = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-PLACEHOLDER123';
  
  // Build full title
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Build canonical URL
  const canonical = canonicalUrl || `${siteUrl}${location.pathname}`;
  
  // Build meta keywords from tags and keywords
  const metaKeywords = [
    ...(keywords ? keywords.split(',').map(k => k.trim()) : []),
    ...tags,
    'Edge Chronicle',
    'news',
    'breaking news'
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
          }
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
          "name": author || "Edge Chronicle Team"
        },
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "articleSection": category,
        "keywords": tags.join(', ')
      });
    }

    return baseSchema;
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || siteDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="author" content={author || "Edge Chronicle"} />
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
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || siteDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
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
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
    </Helmet>
  );
};

export default SEOManager;
