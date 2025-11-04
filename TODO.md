# TODO: Fix Login and Email Issues

## Current Issues
- Login password validation failing for existing users (likely unhashed passwords)
- Email sending failing during registration (invalid Gmail credentials)

## Tasks
- [ ] Update login logic to handle unhashed passwords for backward compatibility
- [ ] Add email configuration instructions
- [ ] Test login with existing user
- [ ] Test registration with valid email credentials
- [ ] Verify email sending works

## Implementation Plan
1. Modify auth.controller.js login method to check password format
2. Create .env.example with proper email setup instructions
3. Add migration logic for existing unhashed passwords
4. Test the fixes
