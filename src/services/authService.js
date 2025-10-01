import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users, passwordResetTokens, emailVerificationTokens, favorites, watchlist, watchHistory } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { EmailService } from './emailService.js';

/**
 * Generate a secure random token (browser-compatible)
 */
function generateSecureToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export class AuthService {
  /**
   * Check daily signup limit (300 per day to maintain Gmail 500/day limit)
   * Stores count in localStorage with date reset
   */
  static checkDailySignupLimit() {
    const today = new Date().toDateString();
    const signupData = localStorage.getItem('daily_signups');
    
    let signupInfo = signupData ? JSON.parse(signupData) : { date: today, count: 0 };
    
    // Reset count if new day
    if (signupInfo.date !== today) {
      signupInfo = { date: today, count: 0 };
    }
    
    // Check if limit reached (300 signups per day)
    if (signupInfo.count >= 300) {
      throw new Error('Daily signup limit reached. Please try again tomorrow. This limit helps us maintain reliable email delivery for all users.');
    }
    
    return signupInfo;
  }
  
  /**
   * Increment daily signup counter
   */
  static incrementSignupCount(signupInfo) {
    signupInfo.count += 1;
    localStorage.setItem('daily_signups', JSON.stringify(signupInfo));
    console.log(`📊 Daily signups: ${signupInfo.count}/300`);
  }

  // Register a new user
  static async register(userData) {
    try {
      // Check daily signup limit FIRST before any database operations
      const signupInfo = this.checkDailySignupLimit();
      
      const { email, username, password } = userData;
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error('User already exists with this email');
      }

      const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUsername.length > 0) {
        throw new Error('Username already taken');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        username,
        password: hashedPassword,
        isVerified: false // User needs to verify email
      }).returning();

      // Generate email verification token
      const verificationToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      try {
        // Store verification token in database
        await db.insert(emailVerificationTokens).values({
          userId: newUser.id,
          token: verificationToken,
          expiresAt,
          used: false
        });

        // Send verification email (don't block registration if email fails)
        await EmailService.sendVerificationEmail(email, verificationToken, username);
        console.log('✅ Email verification sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send verification email:', emailError.message);
      }

      // Also send welcome email
      try {
        await EmailService.sendWelcomeEmail(email, username);
        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError.message);
      }

      // Increment signup counter after successful registration
      this.incrementSignupCount(signupInfo);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(userId, preferences) {
    try {
      const [updatedUser] = await db.update(users)
        .set({ 
          preferences,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile (username and avatar only - email cannot be changed)
  static async updateProfile(userId, profileData) {
    try {
      // Don't allow email changes for security reasons
      if (profileData.email) {
        throw new Error('Email cannot be changed. Please contact support if you need to change your email.');
      }

      // If username is being updated, check if it's already taken by another user
      if (profileData.username) {
        const [existingUsername] = await db.select()
          .from(users)
          .where(eq(users.username, profileData.username))
          .limit(1);
        
        if (existingUsername && existingUsername.id !== userId) {
          throw new Error('Username already taken');
        }
      }

      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      // Remove email from updateData if it somehow got included
      delete updateData.email;

      // If password is being updated, hash it
      if (profileData.password) {
        updateData.password = await bcrypt.hash(profileData.password, 10);
      }

      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return { success: true, message: 'If an account exists with this email, a password reset link will be sent.' };
      }

      // Generate secure random token (browser-compatible)
      const resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save token to database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false
      });

      // Send password reset email
      try {
        await EmailService.sendPasswordResetEmail(email, resetToken, user.username);
        console.log('✅ Password reset email sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send password reset email:', emailError.message);
        // Still return success to user for security (don't reveal email exists)
      }

      return { 
        success: true, 
        message: 'If an account exists with this email, a password reset link will be sent.'
      };
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword) {
    try {
      console.log('🔄 Validating password reset token...');

      // Find valid token
      const [tokenRecord] = await db.select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!tokenRecord) {
        throw new Error('Invalid or expired reset token');
      }

      console.log('✅ Token valid for user:', tokenRecord.userId);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const [updatedUser] = await db.update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, tokenRecord.userId))
        .returning();

      // Mark token as used
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      // Send notification email about password change
      try {
        await EmailService.sendAccountChangeNotification(
          updatedUser.email,
          updatedUser.username,
          'password'
        );
        console.log('✅ Password change notification sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send notification email:', emailError.message);
      }

      console.log('✅ Password reset successful for user:', updatedUser.username);
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  }

  // Verify email with token
  static async verifyEmail(token) {
    try {
      console.log('🔄 Validating email verification token...');

      // Find valid token
      const [tokenRecord] = await db.select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            eq(emailVerificationTokens.used, false),
            gt(emailVerificationTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!tokenRecord) {
        throw new Error('Invalid or expired verification token');
      }

      console.log('✅ Token valid for user:', tokenRecord.userId);

      // Update user as verified
      const [updatedUser] = await db.update(users)
        .set({ 
          isVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, tokenRecord.userId))
        .returning();

      // Mark token as used
      await db.update(emailVerificationTokens)
        .set({ used: true })
        .where(eq(emailVerificationTokens.id, tokenRecord.id));

      console.log('✅ Email verified successfully for:', updatedUser.email);

      return {
        success: true,
        message: 'Email verified successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          isVerified: updatedUser.isVerified
        }
      };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email) {
    try {
      console.log('🔄 Resending verification email to:', email);

      // Find user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('Email already verified');
      }

      // Generate new verification token
      const verificationToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Invalidate old tokens
      await db.update(emailVerificationTokens)
        .set({ used: true })
        .where(eq(emailVerificationTokens.userId, user.id));

      // Store new token
      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token: verificationToken,
        expiresAt,
        used: false
      });

      // Send verification email
      await EmailService.sendVerificationEmail(user.email, verificationToken, user.username);
      console.log('✅ Verification email resent to:', user.email);

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      throw error;
    }
  }

  // Delete user account permanently
  static async deleteAccount(userId, password) {
    try {
      console.log('🔄 Deleting account for user:', userId);

      // Find user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password before deletion
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password. Account deletion cancelled.');
      }

      // Delete related data first (foreign key constraints)
      console.log('🗑️ Deleting user data for userId:', userId);
      
      // Delete user data tables first (they reference users table)
      try {
        await db.delete(favorites).where(eq(favorites.userId, userId));
        console.log('✅ Favorites deleted');
      } catch (err) {
        console.log('⚠️ No favorites to delete or error:', err.message);
      }
      
      try {
        await db.delete(watchlist).where(eq(watchlist.userId, userId));
        console.log('✅ Watchlist deleted');
      } catch (err) {
        console.log('⚠️ No watchlist to delete or error:', err.message);
      }
      
      try {
        await db.delete(watchHistory).where(eq(watchHistory.userId, userId));
        console.log('✅ Watch history deleted');
      } catch (err) {
        console.log('⚠️ No watch history to delete or error:', err.message);
      }

      // Delete password reset tokens
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, userId));
      console.log('✅ Password reset tokens deleted');

      // Delete email verification tokens
      await db.delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, userId));
      console.log('✅ Email verification tokens deleted');

      // Finally, delete the user
      await db.delete(users)
        .where(eq(users.id, userId));
      console.log('✅ User account deleted');

      console.log('✅ Account deleted successfully:', user.email);

      return {
        success: true,
        message: 'Account deleted successfully. We\'re sorry to see you go!'
      };
    } catch (error) {
      console.error('❌ Account deletion error:', error);
      throw error;
    }
  }
}