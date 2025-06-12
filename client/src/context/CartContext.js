import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1) => {
    if (!item || !item._id) {
      console.error('Invalid item added to cart:', item);
      return;
    }

    console.log('Adding item to cart:', item); // Debug log

    setCart(prevCart => {
      // Ensure item has all required fields
      const menuItem = {
        _id: item._id,
        menuItemId: item._id,
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        image: item.image || 'https://source.unsplash.com/200x200/?food',
        restaurantId: item.restaurantId || item.restaurant, // Support both formats
        quantity: quantity
      };

      console.log('Processed menu item:', menuItem); // Debug log

      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { 
                ...cartItem, 
                quantity: cartItem.quantity + quantity,
                menuItemId: cartItem.menuItemId || cartItem._id,
                restaurantId: cartItem.restaurantId || cartItem.restaurant // Support both formats
              }
            : cartItem
        );
      }
      return [...prevCart, menuItem];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (!itemId) {
      console.error('Invalid itemId in updateQuantity:', itemId);
      return;
    }

    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item._id === itemId 
          ? { 
              ...item, 
              quantity,
              menuItemId: item.menuItemId || item._id
            } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 