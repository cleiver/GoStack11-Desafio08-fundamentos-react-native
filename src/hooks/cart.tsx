import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Executa no carregamento, carrega os produtos do carrinho
  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartItems = await AsyncStorage.getItem('@GoMarketPlace:cart');
      const cart: Product[] = (cartItems && JSON.parse(cartItems)) || [];

      setProducts(cart);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      let itemFound = false;

      const updatedCart = products.map(item => {
        if (item.id === product.id) {
          itemFound = true;
          return { ...item, quantity: item.quantity + 1 };
        }

        return item;
      });

      if (!itemFound) {
        updatedCart.push({ ...product, quantity: 1 });
      }

      setProducts(updatedCart);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(updatedCart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedProducts = products
        .map(item =>
          item.id === id && item.quantity > 0
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter(product => product.quantity > 0);

      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
