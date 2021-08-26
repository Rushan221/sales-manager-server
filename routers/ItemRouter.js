const router = require("express").Router();
const Item = require("../models/ItemModel");
const auth = require("./../middlewares/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const newItem = new Item({
      name: name,
    });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});
module.exports = router;
