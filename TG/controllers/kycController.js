

// const userService = require('../services/kycService');

// exports.createUser = async (req, res) => {
//   try {
//     const user = await userService.updateUserById(req.params.id, req.body);
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await userService.getAllUsers();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getUserById = async (req, res) => {
//   try {
//     const user = await userService.getUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid user ID' });
//   }
// };

// exports.updateUserById = async (req, res) => {
//   try {
//     const user = await userService.updateUserById(req.params.id, req.body);
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.deleteUserById = async (req, res) => {
//   try {
//     const user = await userService.deleteUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     res.json({ message: 'User deleted successfully' });
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid user ID' });
//   }
// };
const userService = require('../services/kycService');

exports.createUser = async (req, res) => {
  try {
    const user = await userService.upsertUserByEmail(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const user = await userService.updateUserById(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await userService.deleteUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
};
