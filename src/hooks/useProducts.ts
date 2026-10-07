import { useEffect, useState } from 'react';
import { API_URL } from '@/config/apiConfig';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  category: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setError(null);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { products, loading, error, refresh };
}