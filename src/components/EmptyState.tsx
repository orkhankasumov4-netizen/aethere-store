import React from 'react';
import { Search, ShoppingCart, Package, Scale, Heart } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'cart' | 'orders' | 'comparison' | 'wishlist' | 'products';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action
}) => {
  const configs: Record<EmptyStateProps['type'], { icon: React.ReactNode; defaultTitle: string; defaultDescription: string }> = {
    search: {
      icon: <Search size={48} className="text-gray-700" aria-hidden="true" />,
      defaultTitle: 'No results found',
      defaultDescription: 'Try adjusting your search terms or browse our categories'
    },
    cart: {
      icon: <ShoppingCart size={48} className="text-gray-700" aria-hidden="true" />,
      defaultTitle: 'Your cart is empty',
      defaultDescription: 'Discover our exclusive collection and add some items'
    },
    orders: {
      icon: <Package size={48} className="text-gray-700" aria-hidden="true" />,
      defaultTitle: 'No orders yet',
      defaultDescription: 'Start shopping to see your orders here'
    },
    comparison: {
      icon: <Scale size={48} className="text-gray-700" aria-hidden="true" />,
      defaultTitle: 'No products to compare',
      defaultDescription: 'Add products to compare their features side by side'
    },
    wishlist: {
      icon: <Heart size={48} className="text-gray-700" aria-hidden="true" />,
      defaultTitle: 'Your wishlist is empty',
      defaultDescription: 'Save items you love to your wishlist'
    },
    products: {
      icon: <ShoppingCart size={48} className="text-gray-700" aria-hidden="true" />,
      defaultTitle: 'No products available',
      defaultDescription: 'Check back later for new arrivals'
    }
  };

  const config = configs[type];

  return (
    <div className="text-center py-20" role="status" aria-label={title || config.defaultTitle}>
      <div className="mb-6" aria-hidden="true">
        {config.icon}
      </div>
      <h3 className="text-2xl text-white font-medium mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-500 mb-6">
        {description || config.defaultDescription}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
