// ---------- Product data ----------
// HOW TO ADD YOUR OWN PHOTOS:
// 1. Create a folder called "images" next to this file (same folder as
//    index.html, catalog.html, styles.css, products.js, script.js).
// 2. Drop your perfume photos in there, e.g. images/bloom-and-bone.jpg
// 3. Below, change that product's `image:` line from the placeholder URL
//    to the local path, e.g.  image: "images/bloom-and-bone.jpg"
// That's it — no other code needs to change. Any image size works; a
// tall/portrait photo (roughly 4:5, like 800x1000px) will fit the cards best.

const PRODUCTS = [
  {
    id: 1,
    name: "Bloom & Bone",
    brand: "Ember & Oak",
    family: "floral",
    notes: "Jasmine, Tuberose, White Musk",
    rating: 4.8,
    reviewCount: 212,
    sizes: { 30: 1800, 50: 2900, 100: 4200 },
    bestseller: true,
    image: "images/bloom.png",
  },
  {
    id: 2,
    name: "Salted Caramel Skin",
    brand: "Ember & Oak",
    family: "gourmand",
    notes: "Caramel, Sea Salt, Vanilla, Musk",
    rating: 4.9,
    reviewCount: 340,
    sizes: { 30: 1700, 50: 2700, 100: 3900 },
    newArrival: true,
    image: "images/caramel.png",
  },
  {
    id: 3,
    name: "Cedar & Smoke",
    brand: "Ember & Oak",
    family: "woody",
    notes: "Cedarwood, Vetiver, Oud, Leather",
    rating: 4.7,
    reviewCount: 198,
    sizes: { 30: 1900, 50: 3100, 100: 4500 },
    bestseller: true,
    image: "images/cedar.png",
  },
  {
    id: 4,
    name: "Ember Clove",
    brand: "Ember & Oak",
    family: "spicy",
    notes: "Clove, Cardamom, Amber, Black Pepper",
    rating: 4.6,
    reviewCount: 150,
    sizes: { 30: 1750, 50: 2850, 100: 4100 },
    bestseller: true,
    seasonal: true,
    image: "images/ember.png",
  },
  {
    id: 5,
    name: "Salt & Ash",
    brand: "Ember & Oak",
    family: "elemental",
    notes: "Sea Salt, Ambergris, Mineral Accord",
    rating: 4.5,
    reviewCount: 120,
    sizes: { 30: 1850, 50: 2950, 100: 4300 },
    bestseller: true,
    image: "images/salt.png",
  },
  {
    id: 6,
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    family: "floral",
    notes: "Saffron, Jasmine, Amberwood",
    rating: 4.9,
    reviewCount: 890,
    sizes: { 30: 9500, 50: 15900, 100: 23500 },
    newArrival: true,
    image: "images/540.png",
  },
  {
    id: 7,
    name: "Black Orchid",
    brand: "Tom Ford",
    family: "woody",
    notes: "Black Truffle, Ylang-Ylang, Patchouli",
    rating: 4.7,
    reviewCount: 670,
    sizes: { 30: 5200, 50: 8200, 100: 12500 },
    image: "images/black.png",
  },
  {
    id: 8,
    name: "Santal 33",
    brand: "Le Labo",
    family: "woody",
    notes: "Sandalwood, Cardamom, Violet",
    rating: 4.8,
    reviewCount: 540,
    sizes: { 30: 7200, 50: 11500, 100: 16500 },
    newArrival: true,
    image: "images/sandal.png",
  },
  {
    id: 9,
    name: "Aventus",
    brand: "Creed",
    family: "spicy",
    notes: "Pineapple, Birch, Musk, Oakmoss",
    rating: 4.8,
    reviewCount: 1020,
    sizes: { 30: 9800, 50: 18500, 100: 26500 },
    image: "images/aventus.png",
  },
  {
    id: 10,
    name: "Honey Fig Tart",
    brand: "Ember & Oak",
    family: "gourmand",
    notes: "Fig, Honey, Tonka Bean, Cream Accord",
    rating: 4.6,
    reviewCount: 88,
    sizes: { 30: 1650, 50: 2650, 100: 3800 },
    newArrival: true,
    seasonal: true,
    image: "images/honey.png",
  },
];

// Quiz family -> recommended product
const QUIZ_MATCH = {
  gourmand:  PRODUCTS.find(p => p.id === 2),
  floral:    PRODUCTS.find(p => p.id === 1),
  woody:     PRODUCTS.find(p => p.id === 3),
  elemental: PRODUCTS.find(p => p.id === 5),
};

const FAMILY_LABEL = {
  floral: "Floral", gourmand: "Gourmand", woody: "Woody",
  spicy: "Spicy", elemental: "Elemental",
};