export interface Product {
  id: string;
  nameKey: string;      // key in am.json — used when no custom name is set
  name?: string;        // optional override (for admin-added products)
  price: number;
  image: string;        // emoji OR image URL (e.g. /images/products/berbere.jpg)
  unit: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 'berbere-1',
    nameKey: 'products.berbere',
    price: 350,
    image: '🌶️',
    // image: '/images/products/berbere.jpg',   // 👈 uncomment when you have a photo
    unit: 'ኪሎ',
    category: 'ቅመማ ቅመም',
  },
  {
    id: 'salt-1',
    nameKey: 'products.salt',
    price: 25,
    image: '🧂',
    // image: '/images/products/salt.jpg',
    unit: 'ኪሎ',
    category: 'ቅመማ ቅመም',
  },
  {
    id: 'soap-1',
    nameKey: 'products.soap',
    price: 45,
    image: '🧼',
    unit: 'ቁራጭ',
    category: 'የጽዳት እቃ',
  },
  {
    id: 'diaper-1',
    nameKey: 'products.diaper',
    price: 850,
    image: '👶',
    unit: 'ጥቅል',
    category: 'የልጆች እቃ',
  },
  {
    id: 'oil-1',
    nameKey: 'products.oil',
    price: 280,
    image: '🛢️',
    unit: 'ሊትር',
    category: 'የምግብ እቃ',
  },
  {
    id: 'sugar-1',
    nameKey: 'products.sugar',
    price: 130,
    image: '🍬',
    unit: 'ኪሎ',
    category: 'የምግብ እቃ',
  },
  {
    id: 'rice-1',
    nameKey: 'products.rice',
    price: 180,
    image: '🍚',
    unit: 'ኪሎ',
    category: 'የምግብ እቃ',
  },
  {
    id: 'pasta-1',
    nameKey: 'products.pasta',
    price: 95,
    image: '🍝',
    unit: 'ጥቅል',
    category: 'የምግብ እቃ',
  },
];