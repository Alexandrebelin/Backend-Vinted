const express = require("express");
const router = express.Router();
const createStripe = require("stripe");

const stripe = createStripe(process.env.STRIPE_API_SECRET);

const isAuthenticated = require("../Middleware/isAuthenticated");

router.post("/payment", isAuthenticated, async (req, res) => {
  try {
    const stripeToken = req.fields.stripeToken;
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: `Paiement vinted pour : ${req.fields.title}`,
      source: req.fields.token,
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
