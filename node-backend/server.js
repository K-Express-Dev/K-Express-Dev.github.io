const express = require('express');
const app = express();

const cors = require('cors');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const stripe = require('stripe'); // Import stripe module

dotenv.config();

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY); // Initialize stripe with secret key from environment variables
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// API endpoint to get seller data
app.get('/api/sellers/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    const sellerDoc = await db.collection('sellers').doc(sellerId).get();
    
    if (!sellerDoc.exists) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    const sellerData = sellerDoc.data();
    res.json(sellerData);
  } catch (error) {
    console.error('Error fetching seller data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get seller's dishes
app.get('/api/sellers/:id/dishes', async (req, res) => {
  try {
    const sellerId = req.params.id;
    const dishesSnapshot = await db.collection('sellers').doc(sellerId).collection('dishes').get();
    
    const dishes = [];
    dishesSnapshot.forEach(doc => {
      dishes.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching seller dishes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { cartItems } = req.body;

  console.log('Received cart items:', cartItems);

  const lineItems = cartItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
    },
    quantity: item.quantity,
  }));

  console.log('Generated line items:', lineItems);

  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}`,
    });

    console.log('Checkout session created:', session);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Stripe Secret Key: ${process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not Loaded'}`);
  console.log(`Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Not Loaded'}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
});