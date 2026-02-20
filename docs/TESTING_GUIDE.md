# Testing Guide - AI Medicine Database

## Test Scenarios

### 1. Public Access (No Login)
- [ ] Search for existing medicine (e.g., "Paracetamol")
- [ ] Results displayed correctly
- [ ] Can view medicine details
- [ ] Browse by category works
- [ ] Voice search works

### 2. Authentication Flow
- [ ] Click "Ask AI" button → Login dialog appears
- [ ] Sign up with new account
- [ ] Log out and log back in
- [ ] User name displayed in header
- [ ] Login persists on page refresh

### 3. AI Medicine Addition (Automatic)
**Test Medicine**: Use a medicine NOT in your database

**Steps:**
1. Login to your account
2. Search for "Azithromycin" (or any medicine not in database)
3. Click "Ask AI for Details"
4. In chatbot, type: "What is Azithromycin?"
5. **Expected Results:**
   - AI provides medicine information
   - Toast notification: "Medicine Added to Database! 🎉"
   - Chat message: "✅ I've automatically added..."
   - Medicine saved with `aiVerified: true`
6. Search for "Azithromycin" again
7. **Expected**: Medicine now appears in search results

### 4. Duplicate Prevention
**Steps:**
1. Ask AI about same medicine again
2. **Expected**: 
   - AI still provides information
   - No "added to database" message
   - No duplicate entry created

### 5. Speech Recognition
**Steps:**
1. Click microphone icon
2. Allow microphone access
3. Say "paracetamol"
4. **Expected**:
   - Search field populated with "paracetamol" (no period)
   - Results shown automatically

### 6. Fuzzy Search
**Test misspellings:**
- Type "paracetmol" → Should find "Paracetamol"
- Type "amoxicilin" → Should find "Amoxicillin"
- Type "paraitamol" → Should find "Paracetamol"

### 7. Protected Features
**Without Login:**
- [ ] Click chatbot icon → Login dialog appears
- [ ] Click "Scan Tablet" → Login dialog appears
- [ ] Click "Ask AI" button → Login dialog appears

**After Login:**
- [ ] All features accessible
- [ ] Can interact with chatbot
- [ ] Can scan tablets

### 8. End-to-End Flow

**Complete Workflow:**
1. New user visits site
2. Searches for "Ciprofloxacin" (not in database)
3. Sees "No results found" with "Ask AI" button
4. Clicks "Ask AI" → Prompted to login
5. Creates account successfully
6. Chatbot opens automatically
7. Types "Tell me about Ciprofloxacin"
8. AI responds with detailed information
9. System automatically saves to database
10. Notification confirms addition
11. User logs out
12. Different user (or no login) searches "Ciprofloxacin"
13. Medicine found in search results!

### 9. API Verification

**Check Database File:**
```bash
# View the last 50 lines of medicineData.json
Get-Content public/data/medicineData.json -Tail 50
```

**Look for:**
- New entries with `aiVerified: true`
- `addedBy` field with user ID
- `addedAt` timestamp
- Complete medicine information

### 10. Error Handling

**Test Cases:**
- [ ] Ask AI general question (not about medicine) → No database save
- [ ] Network error during save → Error notification
- [ ] Invalid medicine data → No save occurs
- [ ] AI unable to provide info → Graceful error message

## Verification Checklist

### Authentication
- [x] Login system working
- [x] Logout working
- [x] Session persistence
- [x] Protected routes enforced

### AI Integration
- [x] Chatbot responds to queries
- [x] Structured data extraction working
- [x] Medicine information accurate

### Database Operations
- [x] Automatic save implemented
- [x] Duplicate prevention working
- [x] File writes successful
- [x] Data format correct

### User Experience
- [x] Clear notifications
- [x] Smooth authentication flow
- [x] No user confirmation needed (automatic)
- [x] Feedback on all actions

## Common Issues & Solutions

### Issue: Medicine not saving
**Check:**
1. User is logged in
2. AI response contains valid medicine data
3. Check console for errors
4. Verify API route is accessible

### Issue: Speech recognition not working
**Check:**
1. Microphone permissions granted
2. Using HTTPS or localhost
3. Browser supports Web Speech API
4. Punctuation is being removed

### Issue: Fuzzy search not finding medicines
**Check:**
1. Similarity threshold (currently 60%)
2. Medicine names in database
3. Search algorithm working correctly

## Performance Testing
- [ ] Search responsiveness with 1000+ medicines
- [ ] AI response time acceptable (<5 seconds)
- [ ] Database file size manageable
- [ ] No memory leaks in chatbot

## Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers
