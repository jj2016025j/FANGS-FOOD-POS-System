const express = require('express');
const router = express.Router();

// http://localhost:3000/pos
router.get('/', (req, res) => {
    res.render("seatHome.ejs");
})


module.exports = router;
