
# Classroom Share & Join Login Logic Implementation

## Backend Changes
- [ ] Update Classroom model to add shareCode field
- [ ] Update classroomApi.controller.js: add generateShareCode function, share endpoint, join endpoint with auth
- [ ] Update classroomApi.routes.js: add routes for /share and /join/:code

## Frontend Changes
- [ ] Update classroom.controller.js: add share and join functions
- [ ] Update classroom.html: enable buttons, add event listeners for share/join, add table for class members and sharing info

## Testing
- [ ] Test share link generation and copying
- [ ] Test join functionality with logged-in user
- [ ] Test join redirect to login if not authenticated
- [ ] Verify member table displays correctly
