const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    books: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        price: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    paymentProvider: { type: String, enum: ['stripe', 'razorpay'], required: true },
    paymentId: { type: String }, 
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
