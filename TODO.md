# TODO: Fix Login Failure

## Completed Tasks
- [x] Change auth.controller.js to use UserLogin model instead of User
- [x] Update login function to use generateAccessToken and generateRefreshToken
- [x] Change isEmailVerified to isVerified in login
- [x] Update response structure to have token directly
- [x] Update verifyEmail to set isVerified on user
- [x] Remove verification check in login for now

## Next Steps
- [x] Update frontend fetch URLs to use relative paths instead of hardcoded localhost:3000
- [ ] Test the login functionality
- [ ] If still failing, check MongoDB connection
- [ ] If still failing, add response.ok check in frontend
