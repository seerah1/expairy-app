# Mobile App Testing Guide - Phase 6 Document Tracking
## Expiry Tracker MVP - Mobile Testing Instructions

**Date:** 2026-01-24
**Status:** 🚀 READY FOR TESTING

---

## 📱 Getting Started

### Prerequisites
- ✅ Backend server running on http://localhost:3000
- ✅ Expo development server starting on http://localhost:8081
- ✅ Mobile dependencies installed
- ✅ API URL configured in .env file

### Testing Options

**Option 1: iOS Simulator (Mac only)**
- Press `i` in the Expo terminal
- Requires Xcode installed

**Option 2: Android Emulator**
- Press `a` in the Expo terminal
- Requires Android Studio and emulator running

**Option 3: Physical Device (Recommended)**
- Install "Expo Go" app from App Store or Google Play
- Scan the QR code shown in the terminal
- **Important:** Your phone must be on the same WiFi network as your computer

**Option 4: Web Browser**
- Press `w` in the Expo terminal
- Opens in your default browser
- **Note:** File upload may not work in web version

---

## 🔧 Configuration for Physical Device

If testing on a physical device, you need to update the API URL:

1. Open `mobile/.env`
2. Change the API URL to use your computer's local IP:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.7:3000/api
   ```
3. Restart the Expo server (press `r` in terminal)

**Your computer's IP address:** 192.168.1.7

---

## 🧪 Phase 6 Testing Checklist

### Test Flow 1: User Authentication
- [ ] Open the app
- [ ] Should redirect to login screen
- [ ] Login with: `admin@expirytracker.com` / `Admin123!`
- [ ] Should redirect to dashboard
- [ ] Verify user name displayed in header

### Test Flow 2: Navigate to Documents
- [ ] Tap on "Documents" tab in bottom navigation
- [ ] Should see documents list screen
- [ ] Should show empty state if no documents
- [ ] Verify "Add Document" button visible

### Test Flow 3: Create Document with File Upload
- [ ] Tap "Add Document" button
- [ ] Fill in document details:
  - **Type:** Select "Passport" from dropdown
  - **Number:** P12345678
  - **Expiry Date:** Select a future date (e.g., 2027-12-31)
  - **Issue Date:** Select a past date (e.g., 2022-01-01)
  - **Issuing Authority:** Government of Test Country
  - **Notes:** Test passport document
- [ ] Tap "Choose File" or "Upload File"
- [ ] Select an image or PDF from your device
- [ ] Verify file name appears
- [ ] Tap "Create Document"
- [ ] Should show success message
- [ ] Should redirect to documents list
- [ ] Verify new document appears in list

### Test Flow 4: View Document Details
- [ ] Tap on the document you just created
- [ ] Should navigate to document detail screen
- [ ] Verify all fields displayed correctly:
  - Type: Passport
  - Number: P12345678
  - Expiry Date: 2027-12-31
  - Issue Date: 2022-01-01
  - Issuing Authority: Government of Test Country
  - Notes: Test passport document
  - Status badge: "Safe" (green)
  - Remaining days: ~700+ days
- [ ] Verify file name displayed
- [ ] Verify "Download File" button visible

### Test Flow 5: Download Document File
- [ ] From document detail screen
- [ ] Tap "Download File" button
- [ ] Should download the file
- [ ] Verify file opens correctly
- [ ] **Note:** File download behavior varies by platform

### Test Flow 6: Edit Document
- [ ] From document detail screen
- [ ] Tap "Edit" button
- [ ] Modify the notes field
- [ ] Change to: "Updated test passport document"
- [ ] Tap "Save Changes"
- [ ] Should show success message
- [ ] Verify notes updated on detail screen

### Test Flow 7: Create Document without File
- [ ] Navigate back to documents list
- [ ] Tap "Add Document" button
- [ ] Fill in document details:
  - **Type:** Select "Driver License"
  - **Number:** DL987654321
  - **Expiry Date:** 2026-06-30
  - **Issue Date:** 2021-06-30
  - **Issuing Authority:** DMV Test State
  - **Notes:** Driver license without file
- [ ] Do NOT upload a file
- [ ] Tap "Create Document"
- [ ] Should create successfully
- [ ] Verify document appears in list without file icon

### Test Flow 8: Document List Features
- [ ] Pull down to refresh the list
- [ ] Should reload documents
- [ ] Verify both documents appear
- [ ] Check status badges:
  - Passport: "Safe" (green)
  - Driver License: "Safe" (green)
- [ ] Verify documents sorted by expiry date

### Test Flow 9: Dashboard Integration
- [ ] Navigate to "Dashboard" tab
- [ ] Verify statistics show:
  - Total items: 0 (or number of food items)
  - Total documents: 2
  - Combined statistics
- [ ] Scroll down to "Upcoming Expirations"
- [ ] Should see both documents listed
- [ ] Verify expiry dates displayed
- [ ] Tap on a document from dashboard
- [ ] Should navigate to document detail screen

### Test Flow 10: Document Type Filtering (if implemented)
- [ ] Navigate to documents list
- [ ] Look for filter/sort options
- [ ] Try filtering by document type
- [ ] Verify only selected type shown

### Test Flow 11: Delete Document
- [ ] From document detail screen
- [ ] Tap "Delete" button
- [ ] Should show confirmation dialog
- [ ] Tap "Confirm" or "Delete"
- [ ] Should show success message
- [ ] Should navigate back to documents list
- [ ] Verify document removed from list
- [ ] Navigate to dashboard
- [ ] Verify document count decreased

### Test Flow 12: Validation Testing
- [ ] Tap "Add Document" button
- [ ] Try to submit without filling required fields
- [ ] Should show validation errors:
  - "Document type is required"
  - "Document number is required"
  - "Expiry date is required"
- [ ] Fill in all required fields
- [ ] Try to set issue date after expiry date
- [ ] Should show validation error
- [ ] Fix the dates
- [ ] Should create successfully

### Test Flow 13: Expiring Soon Status
- [ ] Create a document with expiry date in 20 days
- [ ] Verify status badge shows "Expiring Soon" (yellow/orange)
- [ ] Check dashboard shows it in "Expiring Soon" section

### Test Flow 14: Expired Status
- [ ] Create a document with expiry date in the past
- [ ] Verify status badge shows "Expired" (red)
- [ ] Check dashboard shows it in "Expired" section

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" or "Cannot connect to server"
**Solution:**
- Verify backend server is running on port 3000
- Check API URL in mobile/.env matches your setup
- For physical device, use computer's local IP (192.168.1.7)
- Ensure phone and computer on same WiFi network

### Issue 2: "Unauthorized" errors
**Solution:**
- Login again with correct credentials
- Check JWT token is being stored
- Verify auth middleware working on backend

### Issue 3: File upload not working
**Solution:**
- Check file picker permissions granted
- Verify file size under 10MB
- Check file type is supported (JPEG, PNG, PDF, DOC, DOCX)
- Try a different file

### Issue 4: App crashes on file upload
**Solution:**
- Check Expo permissions for camera/photos
- Grant permissions in device settings
- Restart the app

### Issue 5: Documents not appearing
**Solution:**
- Pull down to refresh the list
- Check network connection
- Verify backend API working (test with Postman/curl)
- Check console logs for errors

### Issue 6: QR code not scanning
**Solution:**
- Ensure Expo Go app is installed
- Check phone camera permissions
- Try typing the URL manually in Expo Go
- Use emulator/simulator instead

---

## 📊 Expected Results

### Successful Test Completion

**Documents Created:** 2-4 documents
**File Uploads:** At least 1 document with file
**CRUD Operations:** All working (Create, Read, Update, Delete)
**Status Calculation:** Correct badges (Safe/Expiring Soon/Expired)
**Dashboard Integration:** Documents count and list visible
**Validation:** Error messages shown for invalid input
**Navigation:** Smooth transitions between screens

### Performance Expectations

- **List Load Time:** < 2 seconds
- **Document Creation:** < 3 seconds
- **File Upload:** < 5 seconds (depends on file size)
- **Navigation:** Instant (< 500ms)
- **Pull to Refresh:** < 2 seconds

---

## 📝 Testing Notes Template

Use this template to record your testing results:

```
## Test Session: [Date/Time]
**Device:** [iPhone 14 / Pixel 7 / Simulator]
**OS Version:** [iOS 17 / Android 13]
**Network:** [WiFi / Mobile Data]

### Test Results
- [ ] Authentication: PASS / FAIL
- [ ] Document List: PASS / FAIL
- [ ] Create with File: PASS / FAIL
- [ ] Create without File: PASS / FAIL
- [ ] View Details: PASS / FAIL
- [ ] Edit Document: PASS / FAIL
- [ ] Delete Document: PASS / FAIL
- [ ] File Download: PASS / FAIL
- [ ] Dashboard Integration: PASS / FAIL
- [ ] Validation: PASS / FAIL

### Issues Found
1. [Description of issue]
2. [Description of issue]

### Screenshots
[Attach screenshots of any issues]

### Overall Assessment
[PASS / FAIL / PARTIAL]

### Notes
[Any additional observations]
```

---

## 🎯 Success Criteria

Phase 6 mobile testing is successful if:

- ✅ All 14 test flows complete without critical errors
- ✅ Documents can be created with and without files
- ✅ File upload and download working
- ✅ Status badges display correctly
- ✅ Dashboard shows document statistics
- ✅ Validation prevents invalid data
- ✅ Navigation works smoothly
- ✅ No app crashes
- ✅ Performance acceptable (< 3 seconds for operations)
- ✅ UI renders correctly on device

---

## 🚀 Next Steps After Testing

### If All Tests Pass
1. Document any minor UI/UX improvements needed
2. Proceed to Phase 7 (Admin Panel) or Phase 8 (Polish & Features)
3. Consider production deployment

### If Tests Fail
1. Document all issues with screenshots
2. Prioritize critical bugs
3. Fix issues before proceeding
4. Re-test after fixes

---

## 📞 Support

**Backend API:** http://localhost:3000/api
**Expo DevTools:** http://localhost:8081
**Test Credentials:** admin@expirytracker.com / Admin123!

**Backend Status:** ✅ Running
**Database:** ✅ Connected
**API Endpoints:** ✅ All functional

---

**Happy Testing! 🎉**

Report any issues or unexpected behavior for investigation.
