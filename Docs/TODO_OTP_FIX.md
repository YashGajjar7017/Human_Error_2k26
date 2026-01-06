# OTP Routes Fix - TODO List

## Objective
Fix all OTP routes and ensure consistent storage to the centralized database

## Issues Identified
1. Inconsistent OTP storage across multiple controllers
2. Multiple OTP controllers with overlapping functionality
3. Fragmented route handling

## Implementation Plan

### Phase 1: Update SignupApi.controller.js
- [x] Import OTP model
- [x] Update sendOtp to store in OTP collection
- [x] Update verifyOtp to verify against OTP collection
- [x] Remove OTP storage from Signup model

### Phase 2: Update auth.controller.js
- [x] Import OTP model
- [x] Update sendOTP to store in OTP collection
- [x] Update verifyOTP to verify against OTP collection
- [x] Remove OTP storage from User model

### Phase 3: Update passwordReset.controller.js
- [x] Import OTP model
- [x] Update requestPasswordReset to store in OTP collection
- [x] Update verifyPasswordResetOTP to verify against OTP collection
- [x] Remove OTP storage from User model

### Phase 4: Update otp.routes.js
- [x] Switch to use otp-improved.controller.js
- [x] Update route handlers to use improved controller methods

### Phase 5: Update account.routes.js
- [x] Already using SignupApi.controller.js (updated in Phase 1)

### Phase 6: Testing
- [ ] Verify OTP generation and storage
- [ ] Verify OTP verification works correctly
- [ ] Test resend functionality
- [ ] Verify all routes respond correctly

## Dependencies
- OTP model: `Backend/models/otpHandler.models.js`
- Improved controller: `Backend/controller/otp-improved.controller.js`
- Email service: `Backend/util/EmailService.js`

## Notes
The centralized OTP model provides:
- Automatic expiration (10 minutes)
- Attempt limiting (max 5 attempts)
- Purpose-based OTPs
- Verification status tracking

## OTP Purposes
- `signup_verification` - OTP sent during signup flow
- `email_verification` - OTP sent for email verification
- `password_reset` - OTP sent for password reset flow

