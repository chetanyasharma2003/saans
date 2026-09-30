const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// ============ GET CURRENT USER ============
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user.getSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET PROFILE (alias for /me) ============
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user.getSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET USER BY ID ============
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user.getSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE USER PROFILE ============
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      phone,
      avatar,
      email,
      dateOfBirth,
      gender,
      emergencyContact,
      address,
      city,
      state,
      zipCode,
      conditions,
      preferences
    } = req.body;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (email) updateData.email = email;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zipCode) updateData.zipCode = zipCode;
    if (conditions) updateData.conditions = Array.isArray(conditions) ? conditions : [];
    if (preferences) updateData.preferences = preferences;

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated',
      data: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CHANGE PASSWORD ============
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET USER PROFILE (ALIAS FOR /me) ============
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 2FA TOGGLE ============
router.post('/2fa/toggle', authenticateToken, async (req, res) => {
  try {
    const { enabled } = req.body;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ twoFactorEnabled: enabled });

    res.json({
      success: true,
      message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        twoFactorEnabled: enabled
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ LOGOUT ============
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Frontend handles token removal from localStorage
    // Backend just confirms logout
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
