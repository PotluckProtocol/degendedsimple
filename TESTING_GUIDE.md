# 🧪 Testing Guide - King of the Hill & Social Sharing

## Local Server Testing

Your dev server should be running at: **http://localhost:3000**

---

## 🏆 Testing: King of the Hill Feature

### What to Test:

1. **Open the Active Markets Tab**
   - Navigate to http://localhost:3000
   - Click on the **"Active"** tab
   - Markets should load

2. **Verify Market Sorting**
   - Markets should be sorted by volume (highest to lowest)
   - Volume = totalOptionAShares + totalOptionBShares
   - The market with the most bets should appear **first**

3. **Check King of the Hill Styling**
   - The **top market** (highest volume) should have:
     - ✅ **Orange glowing border** with ring effect
     - ✅ **"KING OF THE HILL" badge** in top-right corner
     - ✅ **Caveman icon** next to the badge text
     - ✅ Badge should have a pulsing animation

4. **Verify Only Top Market Gets Treatment**
   - Only the **first market** should have the special styling
   - Other markets should look normal

---

## 📤 Testing: Social Sharing Feature

### What to Test:

1. **Find the Share Button**
   - Look for a **"Share"** button on each market card
   - It should be in the **top-right** of the card header (next to the question)

2. **Test Sharing Functionality**
   - Click the **"Share"** button on any market
   - The button should show **"Copied!"** with a checkmark
   - A toast notification should appear saying "Copied!" or "Shared!"

3. **Verify Copied Text**
   - Open a text editor or messaging app
   - Paste (Cmd+V / Ctrl+V)
   - You should see:
     ```
     I just bought shares on the "[Market Question]" market, do you want to bet?
     
     https://www.degended.bet/
     ```

4. **Test on Mobile (if available)**
   - On mobile devices, it should use the native share sheet
   - On desktop, it should copy to clipboard

---

## ✅ Testing: General Functionality

### Make Sure Everything Still Works:

1. **Market Display**
   - All markets should display correctly
   - No broken cards or missing data

2. **Buy Shares**
   - Click on any active market
   - Try buying shares - should still work

3. **Other Tabs**
   - **Pending Resolution** tab should work normally
   - **Resolved** tab should work normally
   - Markets should filter correctly

4. **Admin Functions**
   - If you're the admin, creating markets should work
   - Resolving markets should work

---

## 🐛 Common Issues & Fixes

### Issue: Markets not sorting
- **Check**: Are markets loading?
- **Fix**: Make sure contracts are accessible
- **Note**: Sorting happens after all volumes are fetched

### Issue: No King of the Hill badge
- **Check**: Is there at least one active market with volume?
- **Fix**: Try buying shares in a market to add volume
- **Note**: Markets with 0 volume still show, but badge only appears on highest volume

### Issue: Share button not working
- **Check**: Browser console for errors
- **Fix**: Make sure clipboard permissions are granted
- **Note**: Some browsers require HTTPS for clipboard access (works on localhost)

### Issue: Caveman icon not showing
- **Check**: Is `/public/icon.png` present?
- **Fix**: Verify the icon file exists in the public folder

---

## 📋 Test Checklist

- [ ] Server loads without errors
- [ ] Active markets tab shows markets
- [ ] Markets are sorted by volume (highest first)
- [ ] Top market has orange glowing border
- [ ] Top market has "KING OF THE HILL" badge
- [ ] Badge has caveman icon
- [ ] Share button appears on all markets
- [ ] Share button copies text correctly
- [ ] Toast notification appears when sharing
- [ ] Buying shares still works
- [ ] Other tabs (Pending, Resolved) still work
- [ ] No console errors

---

## 🎯 Expected Behavior

1. **King of the Hill**:
   - Only ONE market should have the special styling
   - It should be the market with the highest volume
   - If volumes are equal, one will be chosen (first in list)

2. **Social Sharing**:
   - Works on all market cards
   - Includes market name in the message
   - Includes site URL
   - Shows visual feedback (toast + button state)

---

Happy testing! 🚀



