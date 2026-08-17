const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },

    precio: {
        type: Number,
        required: true
    },

    imagen: {
        type: String,
        required: true
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Product', productSchema);

