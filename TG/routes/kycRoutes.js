
// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/kycController');

// router.post('/add', userController.createUser);
// router.get('/all', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUserById);
// router.delete('/:id', userController.deleteUserById);

// module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/kycController');

router.post('/add', userController.createUser);
router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
