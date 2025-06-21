const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.post('/add', planController.addPlan);
router.get('/get', planController.getPlans);
router.get('/:id', planController.getSinglePlan);
router.put('/edit/:id', planController.editPlan);
router.delete('/delete/:id', planController.deletePlan);

module.exports = router;
