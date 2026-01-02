export interface Product {
  id: string;
  name: string;
  price: number;
  weight: string;
  image: string;
  rating: number;
  description: string;
  ingredients: string[];
  healthBenefits: string[];
  howToUse: string[];
  nutritionFacts: {
    servingSize: string;
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Moringa Powder',
    price: 299,
    weight: '100g',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
    rating: 4.5,
    description: 'Pure organic moringa powder, rich in vitamins and minerals. Premium quality assurance.',
    ingredients: ['100% Organic Moringa Leaves'],
    healthBenefits: [
      'Rich in Vitamin A, C, and E',
      'High in antioxidants',
      'Supports immune system',
      'Natural energy booster',
      'Promotes healthy digestion'
    ],
    howToUse: [
      'Mix 1 teaspoon in smoothies or juices',
      'Add to soups and curries',
      'Sprinkle over salads',
      'Take with warm water on empty stomach'
    ],
    nutritionFacts: {
      servingSize: '1 tsp (2g)',
      calories: 8,
      protein: '0.6g',
      carbs: '1.2g',
      fat: '0.1g',
      fiber: '0.4g'
    }
  },
  {
    id: '2',
    name: 'Organic Chia Seeds',
    price: 349,
    weight: '250g',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4b942e55?w=400&h=400&fit=crop',
    rating: 4.7,
    description: 'Premium quality organic chia seeds, packed with omega-3 fatty acids and fiber.',
    ingredients: ['100% Organic Chia Seeds'],
    healthBenefits: [
      'High in Omega-3 fatty acids',
      'Rich in fiber',
      'Supports heart health',
      'Helps in weight management',
      'Promotes bone health'
    ],
    howToUse: [
      'Soak in water or milk for 15 minutes',
      'Add to smoothies and yogurt',
      'Sprinkle over oatmeal',
      'Use as egg substitute in baking'
    ],
    nutritionFacts: {
      servingSize: '1 tbsp (15g)',
      calories: 60,
      protein: '2g',
      carbs: '5g',
      fat: '4g',
      fiber: '5g'
    }
  },
  {
    id: '3',
    name: 'Organic Quinoa',
    price: 399,
    weight: '500g',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop',
    rating: 4.6,
    description: 'Premium organic quinoa, a complete protein source with all essential amino acids.',
    ingredients: ['100% Organic Quinoa'],
    healthBenefits: [
      'Complete protein source',
      'Gluten-free',
      'High in fiber',
      'Rich in minerals',
      'Supports muscle growth'
    ],
    howToUse: [
      'Rinse thoroughly before cooking',
      'Cook 1 cup quinoa with 2 cups water',
      'Use as rice substitute',
      'Add to salads and soups'
    ],
    nutritionFacts: {
      servingSize: '1 cup cooked (185g)',
      calories: 222,
      protein: '8g',
      carbs: '39g',
      fat: '4g',
      fiber: '5g'
    }
  },
  {
    id: '4',
    name: 'Organic Flax Seeds',
    price: 249,
    weight: '250g',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4b942e55?w=400&h=400&fit=crop',
    rating: 4.4,
    description: 'Organic golden flax seeds, rich in omega-3 and lignans.',
    ingredients: ['100% Organic Flax Seeds'],
    healthBenefits: [
      'High in Omega-3',
      'Rich in lignans',
      'Supports digestive health',
      'May reduce cholesterol',
      'Promotes healthy skin'
    ],
    howToUse: [
      'Grind before consumption',
      'Add to smoothies',
      'Sprinkle over cereals',
      'Mix in baked goods'
    ],
    nutritionFacts: {
      servingSize: '1 tbsp (10g)',
      calories: 55,
      protein: '1.9g',
      carbs: '3g',
      fat: '4.3g',
      fiber: '2.8g'
    }
  },
  {
    id: '5',
    name: 'Organic Amaranth',
    price: 279,
    weight: '500g',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop',
    rating: 4.5,
    description: 'Ancient grain amaranth, gluten-free and protein-rich.',
    ingredients: ['100% Organic Amaranth'],
    healthBenefits: [
      'Gluten-free grain',
      'High in protein',
      'Rich in lysine',
      'Supports bone health',
      'Helps in digestion'
    ],
    howToUse: [
      'Cook like rice',
      'Pop like popcorn',
      'Add to soups',
      'Use in porridge'
    ],
    nutritionFacts: {
      servingSize: '1 cup cooked (246g)',
      calories: 251,
      protein: '9.3g',
      carbs: '46g',
      fat: '4g',
      fiber: '5.2g'
    }
  },
  {
    id: '6',
    name: 'Organic Turmeric Powder',
    price: 199,
    weight: '100g',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
    rating: 4.8,
    description: 'Pure organic turmeric powder with high curcumin content.',
    ingredients: ['100% Organic Turmeric'],
    healthBenefits: [
      'Anti-inflammatory properties',
      'High in curcumin',
      'Supports joint health',
      'Boosts immunity',
      'Promotes healthy skin'
    ],
    howToUse: [
      'Add to curries and dishes',
      'Mix with warm milk',
      'Use in golden milk latte',
      'Sprinkle over vegetables'
    ],
    nutritionFacts: {
      servingSize: '1 tsp (2g)',
      calories: 6,
      protein: '0.2g',
      carbs: '1.3g',
      fat: '0.1g',
      fiber: '0.3g'
    }
  }
];






