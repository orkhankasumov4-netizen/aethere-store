import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'AETHER - Curated luxury products delivered with intent. Shop electronics, fashion, home & living, and accessories.',
  canonical,
  ogImage = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
  ogType = 'website',
  jsonLd,
  noIndex = false
}) => {
  useEffect(() => {
    // Set document title
    document.title = `${title} | AETHER`;

    // Meta description
    updateMeta('description', description);
    
    // Canonical URL
    if (canonical) {
      updateMeta('canonical', canonical, 'rel');
    }

    // Robots
    updateMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMeta('og:title', `${title} | AETHER`);
    updateMeta('og:description', description);
    updateMeta('og:type', ogType);
    updateMeta('og:image', ogImage);
    updateMeta('og:site_name', 'AETHER');
    updateMeta('og:url', canonical || window.location.href);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', `${title} | AETHER`);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Favicon accent color
    updateMeta('theme-color', '#7C3AED');

    // JSON-LD structured data
    if (jsonLd) {
      const scriptId = 'json-ld-structured-data';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      
      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup
    return () => {
      if (jsonLd) {
        const script = document.getElementById('json-ld-structured-data');
        if (script) {
          script.textContent = '';
        }
      }
    };
  }, [title, description, canonical, ogImage, ogType, jsonLd, noIndex]);

  return null;
};

function updateMeta(nameOrRel: string, content: string, attribute: 'name' | 'property' | 'rel' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${nameOrRel}"]`) as HTMLMetaElement | null;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, nameOrRel);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

// Helper function to create product JSON-LD
export const createProductJsonLd = (product: {
  id: string | number;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  brand: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  url?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  productID: String(product.id),
  name: product.name,
  description: product.description,
  image: product.image,
  brand: {
    '@type': 'Brand',
    name: product.brand
  },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'USD',
    availability: product.inStock !== false 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock',
    url: product.url || window.location.href
  },
  aggregateRating: product.rating ? {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviewCount || 0
  } : undefined,
  ...(product.originalPrice && product.originalPrice > product.price ? {
    priceRange: `$${product.price} - $${product.originalPrice}`
  } : {})
});

// Helper function to create breadcrumb JSON-LD
export const createBreadcrumbJsonLd = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});
