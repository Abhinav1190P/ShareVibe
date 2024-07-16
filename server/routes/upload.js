const express = require('express');
const path = require('path');
const { Router } = require("express");


const router = Router();

router.use('/', express.static(path.join(__dirname, "../controllers/uploads")));

module.exports = router;