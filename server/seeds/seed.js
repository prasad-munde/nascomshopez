require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Admin = require('../models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez';

const productsData = [
  {
    title: 'Classic Crewneck Cotton T-Shirt',
    description: '100% combed cotton everyday crewneck t-shirt with reinforced ribbed collar.',
    mainImg: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'T-Shirts',
    gender: 'Men',
    price: 499,
    discount: 10,
  },
  {
    title: 'Graphic Streetwear Oversized Tee',
    description: 'Heavyweight 240 GSM drop-shoulder streetwear graphic t-shirt with vintage wash.',
    mainImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    sizes: ['M', 'L', 'XL'],
    category: 'T-Shirts',
    gender: 'Unisex',
    price: 799,
    discount: 15,
  },
  {
    title: 'Slim Fit Oxford Button-Down Shirt',
    description: 'Crisp, breathable long-sleeve oxford cotton formal shirt suitable for casual or office wear.',
    mainImg: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    sizes: ['38', '40', '42', '44'],
    category: 'Shirts',
    gender: 'Men',
    price: 1299,
    discount: 20,
  },
  {
    title: 'Casual Striped Relaxed Linen Shirt',
    description: 'Breezy linen-cotton blend casual resort shirt designed for warm weather comfort.',
    mainImg: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L'],
    category: 'Shirts',
    gender: 'Men',
    price: 1399,
    discount: 25,
  },
  {
    title: 'Urban High-Rise Tapered Jeans',
    description: 'Durable stretch denim with slim tapered fit and authentic stone wash texture.',
    mainImg: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    sizes: ['30', '32', '34', '36'],
    category: 'Jeans',
    gender: 'Men',
    price: 1899,
    discount: 30,
  },
  {
    title: 'High-Waist Stretch Ankle Leggings',
    description: 'Comfortable 4-way stretch denim blend leggings with snug high-rise waistband.',
    mainImg: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    sizes: ['28', '30', '32'],
    category: 'Jeans',
    gender: 'Women',
    price: 999,
    discount: 15,
  },
  {
    title: 'White Low-Top Leather Court Shoes',
    description: 'Minimalist synthetic leather everyday low-top sneaker with cushioned insole.',
    mainImg: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    sizes: ['7', '8', '9', '10'],
    category: 'Footwear',
    gender: 'Unisex',
    price: 2899,
    discount: 20,
  },
  {
    title: 'Athletic Lightweight Running Sneakers',
    description: 'Breathable flyknit mesh upper and shock-absorbing EVA foam sole for daily jogging.',
    mainImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    sizes: ['7', '8', '9', '10', '11'],
    category: 'Footwear',
    gender: 'Unisex',
    price: 3499,
    discount: 35,
  },
  {
    title: 'Vintage Washed Denim Jacket',
    description: 'Timeless trucker jean jacket featuring twin chest flap pockets and adjustable button tabs.',
    mainImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Jackets',
    gender: 'Unisex',
    price: 2499,
    discount: 10,
  },
  {
    title: 'Cozy Fleece Pullover Hoodie',
    description: 'Soft brushed thermal fleece hoodie with spacious front kangaroo pocket.',
    mainImg: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    sizes: ['M', 'L', 'XL'],
    category: 'Jackets',
    gender: 'Unisex',
    price: 1599,
    discount: 20,
  },
  {
    title: 'Floral Print Summer Boho Dress',
    description: 'Flowing lightweight bohemian tiered midi dress with subtle ruffles and waist cinch.',
    mainImg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    category: 'Dresses',
    gender: 'Women',
    price: 1799,
    discount: 25,
  },
  {
    title: 'Classic Leather Minimalist Watch',
    description: 'Sleek analog wrist watch with Japanese quartz movement and genuine leather strap.',
    mainImg: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    sizes: ['Free Size'],
    category: 'Accessories',
    gender: 'Unisex',
    price: 2199,
    discount: 15,
  },
];

const seedDB = async () => {
  try {
    console.log(`[ShopEZ Seed] Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);

    console.log('[ShopEZ Seed] Clearing previous collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Admin.deleteMany({}),
    ]);

    console.log('[ShopEZ Seed] Seeding Users...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@shopez.com',
      password: 'admin123',
      userType: 'ADMIN',
    });

    const standardUser = await User.create({
      username: 'johndoe',
      email: 'user@shopez.com',
      password: 'user123',
      userType: 'USER',
    });

    console.log('[ShopEZ Seed] Users created:');
    console.log('  Admin -> admin@shopez.com / admin123 (ADMIN)');
    console.log('  User  -> user@shopez.com  / user123  (USER)');

    console.log('[ShopEZ Seed] Seeding Products...');
    const createdProducts = await Product.insertMany(productsData);
    console.log(`[ShopEZ Seed] Successfully seeded ${createdProducts.length} products.`);

    console.log('[ShopEZ Seed] Seeding Admin banner and categories configuration...');
    await Admin.create({
      banner: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      ],
      categories: ['T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets', 'Dresses', 'Accessories'],
    });

    console.log('[ShopEZ Seed] Seeding initial sample order for user...');
    const firstProd = createdProducts[0];
    await Order.create({
      userId: standardUser._id,
      productId: firstProd._id,
      name: 'John Doe',
      mobile: '9876543210',
      email: 'user@shopez.com',
      address: 'Room 304, Academic Boys Hostel, University Campus',
      pincode: '560001',
      size: 'L',
      quantity: 1,
      price: firstProd.price,
      discount: firstProd.discount,
      totalAmount: Math.round(firstProd.price * (1 - firstProd.discount / 100)),
      paymentMethod: 'Cash on Delivery',
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      orderStatus: 'Order Placed',
      items: [
        {
          productId: firstProd._id,
          title: firstProd.title,
          mainImg: firstProd.mainImg,
          size: 'L',
          quantity: 1,
          price: firstProd.price,
          discount: firstProd.discount,
        },
      ],
    });

    console.log('[ShopEZ Seed] Database seeding finished successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[ShopEZ Seed] Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
