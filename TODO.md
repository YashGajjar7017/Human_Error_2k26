# TODO: Add More Features to Engine Route & Controller

## Steps to Complete
- [x] Add new routes to engine.routes.js for unused handlers (sessionToken, sessionShare, fileupload, account, accountNumber, uploadFile)
- [x] Test the updated routes by running the server and verifying endpoints

## Details
- Add GET /sessionToken -> sessionToken
- Add GET /sessionShare -> sessionShare
- Add GET /fileupload -> fileupload
- Add GET /account -> account
- Add GET /account/:userState/:NO -> accountNumber
- Add GET /upload -> uploadFile (form display)
- Add POST /upload -> uploadFile (file upload)
