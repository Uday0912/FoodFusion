const restaurants = [
  {
    name: "Spice Garden",
    description: "Authentic Indian cuisine with a modern twist. Our chefs use traditional spices and cooking techniques to create unforgettable dishes.",
    cuisine: ["Indian", "Asian"],
    rating: 4.5,
    images: [{ url: "http://localhost:5001/images/r1.jpg", public_id: "indian-restaurant-1" }],
    email: "info@spicegarden.com",
    phone: "555-0101",
    address: {
      street: "123 Curry Lane",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001"
    },
    menu: [
      {
        name: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato sauce",
        price: 499,
        image: "http://localhost:5001/images/m1.jpg",
        category: "Main Course"
      },
      {
        name: "Vegetable Biryani",
        description: "Fragrant basmati rice with mixed vegetables and spices",
        price: 399,
        image: "http://localhost:5001/images/m2.jpg",
        category: "Main Course"
      }
    ]
  },
  {
    name: "Pasta Paradise",
    description: "Italian restaurant serving homemade pasta and wood-fired pizzas in a cozy atmosphere.",
    cuisine: ["Italian", "Mediterranean"],
    rating: 4.3,
    images: [{ url: "http://localhost:5001/images/r2.jpg", public_id: "italian-restaurant-1" }],
    email: "info@pastaparadise.com",
    phone: "555-0102",
    address: {
      street: "456 Pasta Street",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001"
    },
    menu: [
      {
        name: "Fettuccine Alfredo",
        description: "Fresh pasta in a creamy parmesan sauce",
        price: 599,
        image: "http://localhost:5001/images/m3.jpg",
        category: "Pasta"
      },
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 449,
        image: "http://localhost:5001/images/m4.jpg",
        category: "Pizza"
      }
    ]
  },
  {
    name: "Sushi Master",
    description: "Contemporary Japanese restaurant offering fresh sushi and sashimi prepared by master chefs.",
    cuisine: ["Japanese", "Asian"],
    rating: 4.7,
    images: [{ url: "http://localhost:5001/images/r3.jpg", public_id: "sushi-restaurant-1" }],
    email: "info@sushimaster.com",
    phone: "555-0103",
    address: {
      street: "789 Sushi Avenue",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001"
    },
    menu: [
      {
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll",
        price: 699,
        image: "http://localhost:5001/images/m5.jpg",
        category: "Sushi"
      },
      {
        name: "Salmon Sashimi",
        description: "Fresh salmon slices served with wasabi and soy sauce",
        price: 899,
        image: "http://localhost:5001/images/m6.jpg",
        category: "Sashimi"
      }
    ]
  },
  {
    name: "Taco Fiesta",
    description: "Vibrant Mexican restaurant serving authentic tacos, burritos, and margaritas.",
    cuisine: ["Mexican", "Latin"],
    rating: 4.4,
    images: [{ url: "http://localhost:5001/images/r4.jpg", public_id: "mexican-restaurant-1" }],
    email: "info@tacofiesta.com",
    phone: "555-0104",
    address: {
      street: "321 Taco Boulevard",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500001"
    },
    menu: [
      {
        name: "Street Tacos",
        description: "Three corn tortillas with your choice of meat, onions, and cilantro",
        price: 349,
        image: "http://localhost:5001/images/m7.jpg",
        category: "Tacos"
      },
      {
        name: "Chicken Burrito",
        description: "Large flour tortilla filled with rice, beans, chicken, and salsa",
        price: 449,
        image: "http://localhost:5001/images/m8.jpg",
        category: "Burritos"
      }
    ]
  },
  {
    name: "Golden Dragon",
    description: "Traditional Chinese restaurant offering a wide selection of authentic dishes.",
    cuisine: ["Chinese", "Asian"],
    rating: 4.2,
    images: [{ url: "http://localhost:5001/images/r5.jpg", public_id: "chinese-restaurant-1" }],
    email: "info@goldendragon.com",
    phone: "555-0105",
    address: {
      street: "654 Dragon Street",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001"
    },
    menu: [
      {
        name: "Kung Pao Chicken",
        description: "Spicy diced chicken with peanuts and vegetables",
        price: 549,
        image: "http://localhost:5001/images/m9.jpg",
        category: "Spicy Dishes"
      },
      {
        name: "Vegetable Lo Mein",
        description: "Stir-fried noodles with mixed vegetables",
        price: 399,
        image: "http://localhost:5001/images/m11.jpg",
        category: "Noodles"
      }
    ]
  },
  {
    name: "Burger Haven",
    description: "Classic American diner serving gourmet burgers and milkshakes.",
    cuisine: ["American", "Fast Food"],
    rating: 4.6,
    images: [{ url: "http://localhost:5001/images/r6.jpg", public_id: "burger-restaurant-1" }],
    email: "info@burgerhaven.com",
    phone: "555-0106",
    address: {
      street: "987 Burger Lane",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001"
    },
    menu: [
      {
        name: "Classic Cheeseburger",
        description: "Angus beef patty with cheese, lettuce, tomato, and special sauce",
        price: 299,
        image: "http://localhost:5001/images/m1.jpg",
        category: "Burgers"
      },
      {
        name: "Truffle Fries",
        description: "Crispy fries tossed with truffle oil and parmesan",
        price: 199,
        image: "http://localhost:5001/images/m2.jpg",
        category: "Sides"
      }
    ]
  }
];

module.exports = restaurants; 