const User = require('../models/User');
const crypto = require('crypto');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');
const Mailer = require('../utils/Mailer');
const admin = require('../utils/firebaseAdmin');

// ========== REGISTER USER ========== 
exports.registerUser = async (req, res) => {
  try {
    console.log('📝 Register user request received');
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    console.log('✅ Basic validation passed');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const encodedName = encodeURIComponent(name);
    const avatarData = {
      public_id: 'avatar_' + Date.now(),
      url: `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=150`
    };

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarData,
      isVerified: false,
      isActive: true,
      authProvider: 'local'
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // ✅ FIXED: include '/users' in the URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${verificationToken}`;

    const message = `
      <h2>Welcome to ${process.env.APP_NAME}</h2>
      <p>Click the link below to verify your email and activate your account:</p>
      <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
      <br><br>
      <p>If you didn't request this, please ignore this email.</p>
      <p><small>Or copy this link: ${verificationUrl}</small></p>
    `;

    console.log('📨 Sending verification email to local user:', user.email);
    await Mailer({
      email: user.email,
      subject: 'Verify your email - ' + process.env.APP_NAME,
      message
    });

    res.status(201).json({
      success: true,
      message: `Registration successful! Verification email sent to ${user.email}. Please verify your email before logging in.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('❌ REGISTER ERROR:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ========== LOGIN USER (LOCAL ONLY) ==========
exports.loginUser = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive) return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first.' });

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) return res.status(401).json({ message: 'Invalid email or password' });

    const token = user.getJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Login successful for:', email);
    console.log('🔑 Token generated:', token.substring(0, 30) + '...');
    res.status(200).json({ success: true, token, user: userResponse });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ========== UPDATE PROFILE ==========
exports.updateProfile = async (req, res) => {
  try {
    console.log('📝 Update profile request for user:', req.user.id);
    console.log('🔑 Token verified for user:', req.user.email);
    console.log('User role:', req.user.role);
    console.log('Request body:', req.body);
    console.log('Has file:', !!req.file);

    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update data
    const updateData = {};
    
    // Handle name (required)
    if (req.body.name !== undefined) {
      const name = req.body.name?.trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }
      updateData.name = name;
    }

    // Handle contact (optional)
    if (req.body.contact !== undefined) {
      const contact = req.body.contact?.trim() || '';
      // Validate contact number if provided
      if (contact && !/^(\+?\d{10,15})$/.test(contact)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid contact number'
        });
      }
      updateData.contact = contact;
    }

    // Handle address fields
    const addressFields = {};
    
    if (req.body.city !== undefined) {
      addressFields.city = req.body.city?.trim() || '';
    }
    
    if (req.body.barangay !== undefined) {
      addressFields.barangay = req.body.barangay?.trim() || '';
    }
    
    if (req.body.street !== undefined) {
      addressFields.street = req.body.street?.trim() || '';
    }
    
    if (req.body.zipcode !== undefined) {
      const zipcode = req.body.zipcode?.trim() || '';
      // Validate zipcode if provided
      if (zipcode && !/^[0-9]{4}$/.test(zipcode)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid 4-digit zipcode'
        });
      }
      addressFields.zipcode = zipcode;
    }
    
    // Only add address if any field has value
    const hasAddressData = Object.values(addressFields).some(value => value !== '');
    if (hasAddressData) {
      updateData.address = addressFields;
    }

    // Handle avatar upload
    if (req.file) {
      console.log('🖼️ Uploading avatar...');
      
      // Delete old avatar if exists and not default
      if (currentUser.avatar?.public_id && !currentUser.avatar.url.includes('ui-avatars.com')) {
        try {
          await deleteFromCloudinary(currentUser.avatar.public_id);
        } catch (err) {
          console.warn('Could not delete old avatar:', err.message);
        }
      }

      // Upload new avatar
      const avatarResult = await uploadToCloudinary(req.file.path, 'rubbersense/avatars');
      updateData.avatar = {
        public_id: avatarResult.public_id,
        url: avatarResult.url
      };

      // Clean up temp file
      const fs = require('fs');
      fs.unlink(req.file.path, err => {
        if (err) console.warn('Failed to delete temp file:', err.message);
      });
    }

    // DO NOT ALLOW EMAIL CHANGES
    // If email is in request body, ignore it or return error
    if (req.body.email !== undefined && req.body.email !== currentUser.email) {
      console.warn('⚠️ User attempted to change email from', currentUser.email, 'to', req.body.email);
      return res.status(400).json({
        success: false,
        message: 'Email cannot be changed. Please contact support if you need to update your email.'
      });
    }

    console.log('Update data:', updateData);

    // If no data to update, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data provided to update'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after update'
      });
    }

    console.log('✅ Profile updated successfully for', updatedUser.role);
    
    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Profile update failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// ========== GOOGLE LOGIN ==========
exports.firebaseGoogleAuth = async (req, res) => {
  try {
    console.log('🔥 Firebase Google auth attempt');
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: uid,
        avatar: { public_id: `google_${uid}`, url: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random&color=fff&size=150` },
        isVerified: true,
        isActive: true,
        firebaseUID: uid,
        authProvider: 'google'
      });
      console.log('✅ User auto-created for Google login');
    }

    if (user.isDeleted) return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });

    const token = user.getJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, token, user: userResponse, message: 'Google authentication successful' });

  } catch (error) {
    console.error('❌ FIREBASE GOOGLE AUTH ERROR:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed', error: error.message });
  }
};

// ========== FACEBOOK LOGIN ==========
exports.firebaseFacebookAuth = async (req, res) => {
  try {
    console.log('🔥 Firebase Facebook auth attempt');
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: uid,
        avatar: { public_id: `facebook_${uid}`, url: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random&color=fff&size=150` },
        isVerified: true,
        isActive: true,
        firebaseUID: uid,
        authProvider: 'facebook'
      });
      console.log('✅ User auto-created for Facebook login');
    }

    if (user.isDeleted) return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });

    const token = user.getJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, token, user: userResponse, message: 'Facebook authentication successful' });

  } catch (error) {
    console.error('❌ FIREBASE FACEBOOK AUTH ERROR:', error);
    res.status(500).json({ success: false, message: 'Facebook authentication failed', error: error.message });
  }
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found with this email' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Use FRONTEND_URL env variable or fallback to localhost
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
      <br><br>
      <p>If you did not request this email, please ignore it.</p>
      <p><small>Or copy this link: ${resetUrl}</small></p>
    `;

    await Mailer({ email: user.email, subject: 'Password Recovery - ' + process.env.APP_NAME, message });

    res.status(200).json({ success: true, message: `Password reset email sent to: ${user.email}` });

  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Hash the token the same way it was hashed when generating reset token
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and check expiration
    const user = await require('../models/User').findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // token not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ RESET PASSWORD ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ========== CHANGE PASSWORD ==========
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    // Fetch user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ CHANGE PASSWORD ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};


// ========== VERIFY EMAIL ==========
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).send('Verification token missing');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await require('../models/User').findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send('Invalid or expired verification token');

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Redirect to frontend page
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${FRONTEND_URL}/email-verified`);
  } catch (error) {
    console.error('❌ EMAIL VERIFICATION ERROR:', error);
    return res.status(500).send('Server error');
  }
};

// ========== FRIEND REQUESTS ==========

// Get all users (excluding current user and friends)
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const currentUserId = req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    let query = { 
      _id: { $ne: currentUserId },
      isDeleted: false,
      isActive: true
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('_id name email avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    // Get current user to check friend status
    const currentUser = await User.findById(currentUserId);
    
    // Enhance users with friend status
    const usersWithStatus = users.map(user => {
      const isFriend = currentUser.friends?.includes(user._id);
      const hasRequest = currentUser.friendRequests?.some(fr => fr.from?.toString() === user._id?.toString() && fr.status === 'pending');
      const hasSent = currentUser.friendRequests?.some(fr => fr.from?.toString() === currentUserId.toString() && fr.status === 'pending');
      
      return {
        ...user.toObject(),
        friendStatus: isFriend ? 'friend' : hasRequest ? 'request_received' : 'not_friend'
      };
    });

    console.log(`✅ Fetched ${users.length} users`);
    res.status(200).json({
      success: true,
      data: usersWithStatus,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sender = await User.findById(senderId);

    // Check if already friends
    if (sender.friends?.includes(receiverId)) {
      return res.status(400).json({ success: false, message: 'Already friends with this user' });
    }

    // Check if request already sent/pending
    const existingRequest = receiver.friendRequests?.find(
      fr => fr.from?.toString() === senderId.toString() && fr.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    // Add friend request to receiver
    receiver.friendRequests.push({
      from: senderId,
      status: 'pending'
    });
    await receiver.save();

    // Create notification for receiver
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: receiverId,
      type: 'friend_request',
      title: 'Friend Request',
      message: `${sender.name} sent you a friend request`,
      severity: 'info',
      data: { senderId, senderName: sender.name, senderAvatar: sender.avatar?.url }
    });

    console.log(`✅ Friend request sent from ${sender.name} to ${receiver.name}`);
    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: {
        from: sender.name,
        to: receiver.name
      }
    });
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { senderId } = req.params;
    const receiverId = req.user._id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find and update friend request
    const friendRequest = receiver.friendRequests?.find(
      fr => fr.from?.toString() === senderId && fr.status === 'pending'
    );

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    // Update receiver - set request to accepted
    friendRequest.status = 'accepted';
    await receiver.save();

    // Add to both friends lists
    if (!receiver.friends.includes(senderId)) {
      receiver.friends.push(senderId);
    }
    if (!sender.friends.includes(receiverId)) {
      sender.friends.push(receiverId);
    }

    await receiver.save();
    await sender.save();

    // Create notification for sender
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: senderId,
      type: 'friend_request',
      title: 'Friend Request Accepted',
      message: `${receiver.name} accepted your friend request`,
      severity: 'info',
      data: { acceptedById: receiverId, acceptedByName: receiver.name }
    });

    console.log(`✅ Friend request accepted between ${sender.name} and ${receiver.name}`);
    res.status(200).json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decline friend request
exports.declineFriendRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { senderId } = req.params;
    const receiverId = req.user._id;

    const receiver = await User.findById(receiverId);

    // Find and update friend request
    const friendRequest = receiver.friendRequests?.find(
      fr => fr.from?.toString() === senderId && fr.status === 'pending'
    );

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    // Remove friend request
    receiver.friendRequests = receiver.friendRequests.filter(
      fr => !(fr.from?.toString() === senderId && fr.status === 'pending')
    );
    await receiver.save();

    console.log(`✅ Friend request declined`);
    res.status(200).json({
      success: true,
      message: 'Friend request declined'
    });
  } catch (error) {
    console.error('❌ Error declining friend request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel friend request (Sender cancels their own request)
exports.cancelFriendRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { receiverId } = req.params;
    const senderId = req.user._id;

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find if request exists
    const friendRequest = receiver.friendRequests?.find(
      fr => fr.from?.toString() === senderId.toString() && fr.status === 'pending'
    );

    // DEBUG: Log for troubleshooting
    console.log(`[Cancel Request] From: ${senderId} To: ${receiverId}`);
    console.log(`[Cancel Request] Found? ${!!friendRequest}`);
    
    // If not found, it might be already removed or accepted
    // Return success anyway to keep UI in sync, but log warning
    if (!friendRequest) {
      console.warn(`[Cancel Request] Request not found in DB, assuming already canceled.`);
      return res.status(200).json({ success: true, message: 'Friend request canceled (was not pending)' });
    }

    // Remove friend request from receiver
    receiver.friendRequests = receiver.friendRequests.filter(
      fr => !(fr.from?.toString() === senderId.toString() && fr.status === 'pending')
    );
    await receiver.save();

    console.log(`✅ Friend request canceled by sender`);
    res.status(200).json({
      success: true,
      message: 'Friend request canceled'
    });
  } catch (error) {
    console.error('❌ Error canceling friend request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get friends list
exports.getFriends = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id)
      .populate('friends', '_id name email avatar');

    res.status(200).json({
      success: true,
      data: user.friends || [],
      count: user.friends?.length || 0
    });
  } catch (error) {
    console.error('❌ Error fetching friends:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get friend requests (pending)
exports.getFriendRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id)
      .populate({
        path: 'friendRequests.from',
        select: '_id name email avatar'
      });

    const pendingRequests = user.friendRequests?.filter(fr => fr.status === 'pending') || [];

    res.status(200).json({
      success: true,
      data: pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    console.error('❌ Error fetching friend requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { friendId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove from both friends lists
    user.friends = user.friends.filter(f => f.toString() !== friendId);
    friend.friends = friend.friends.filter(f => f.toString() !== userId.toString());

    await user.save();
    await friend.save();

    console.log(`✅ Friend removed`);
    res.status(200).json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    console.error('❌ Error removing friend:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users with friend status
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const currentUserId = req.user?._id;

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50);

    // Build search query if provided
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Exclude current user from results
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }

    // Fetch all users except current
    const users = await User.find(query)
      .select('_id name email avatar friends friendRequests')
      .skip(skip)
      .limit(pageLimit)
      .lean();

    // Get current user data to check friend status
    const currentUser = currentUserId ? await User.findById(currentUserId).select('friends friendRequests') : null;

    // Enrich users with friend status
    const usersWithStatus = users.map(user => {
      let friendStatus = 'none';

      if (currentUser) {
        // Check if already friends
        if (currentUser.friends?.some(f => f.toString() === user._id.toString())) {
          friendStatus = 'friends';
        }
        // Check if pending request sent to this user
        else if (user.friendRequests?.some(fr => fr.from?.toString() === currentUserId.toString() && fr.status === 'pending')) {
          friendStatus = 'pending_sent';
        }
        // Check if pending request received from this user
        else if (currentUser.friendRequests?.some(fr => fr.from?.toString() === user._id.toString() && fr.status === 'pending')) {
          friendStatus = 'pending_received';
        }
      }

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        friendStatus
      };
    });

    const total = await User.countDocuments(query);

    console.log(`✅ [getAllUsers] Fetched ${usersWithStatus.length} users (page ${page}), search: "${search}"`);
    res.status(200).json({
      success: true,
      data: usersWithStatus,
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getAllUsers] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users: ' + error.message });
  }
};