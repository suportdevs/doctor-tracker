const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    newTab: { type: Boolean, default: false },
  },
  { _id: false },
);
// One level of dropdown children is enough for a clinic website.
itemSchema.add({ children: { type: [itemSchema], default: [] } });

// `location` is the menu's unique key: a built-in one ("header", "footer") or a
// key made from a custom menu's name ("quick-links"). Site settings choose where each menu shows.
const menuSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    items: { type: [itemSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Menu', menuSchema);
