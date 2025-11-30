# Feature Preferences Implementation

## Overview
Implemented optional feature toggles for PAY_PER_USE users to control which premium features they want to use, allowing them to save credits by disabling features they don't need.

## Changes Made

### 1. Minimum Payment Amount
**File:** `app/pay-per-scan/page.tsx`
- Reduced minimum payment from €1 to €0.10
- Updated validation to accept amounts >= €0.10
- Changed input step from 1 to 0.1
- Updated UI text to show "Minimum: €0.10 (1 credit)"

### 2. Feature Preferences Component
**File:** `components/feature-preferences.tsx` (NEW)
- Created toggle switches for:
  - **AI Risk Analyst** (1 credit per report)
  - **Portfolio Audit** (0.5 credits per token)
- Glassmorphism design matching platform theme
- Real-time preference saving with toast notifications
- Shows cost per feature and helpful tips

### 3. Feature Preferences API
**File:** `app/api/user/feature-preferences/route.ts` (NEW)
- POST endpoint to save user preferences
- Validates preference structure
- Updates Firestore user document
- Returns success confirmation

### 4. Database Schema Update
**File:** `lib/firestore-schema.ts`
- Added `featurePreferences` field to `UserDocument` interface:
  ```typescript
  featurePreferences?: {
    aiRiskAnalyst: boolean
    portfolioAudit: boolean
  }
  ```

### 5. Credit Deduction Logic
**File:** `app/api/credits/deduct/route.ts`
- Added feature preference checks before deducting credits
- If feature is disabled, returns success without deducting
- Returns `skipped: true` flag when feature is disabled
- Maintains backward compatibility (defaults to enabled)

### 6. Dashboard Integration
**File:** `app/dashboard/page.tsx`
- Imported `FeaturePreferences` component
- Added side-by-side layout with `CreditsManager`
- Shows preferences panel only for PAY_PER_USE users

## User Flow

### Setting Preferences
1. User navigates to dashboard
2. PAY_PER_USE users see "Optional Features" panel
3. User toggles AI Risk Analyst or Portfolio Audit on/off
4. Preferences save automatically to Firestore
5. Toast notification confirms save

### Using Features
1. User scans a token
2. System checks if AI Risk Analyst is enabled
3. If enabled: Deducts 1 credit and shows AI analysis
4. If disabled: Skips AI analysis, no credit deduction
5. Basic risk score always shown (free)

## Feature Costs

| Feature | Cost | Description |
|---------|------|-------------|
| **Basic Risk Score** | FREE | Always available, no credits needed |
| **Honeypot Check** | FREE | Always available, no credits needed |
| **AI Risk Analyst** | 1 credit (€0.10) | Natural language risk explanations |
| **Portfolio Audit** | 0.5 credits (€0.05) | Per-token wallet scanning |

## Default Behavior
- New users: Both features **enabled** by default
- Existing users: Both features **enabled** (backward compatible)
- Users can disable anytime to save credits

## Benefits

### For Users
- **Cost Control**: Only pay for features they use
- **Flexibility**: Enable/disable features per session
- **Transparency**: Clear cost breakdown for each feature
- **No Waste**: Credits saved when features disabled

### For Platform
- **User Satisfaction**: Users feel in control of spending
- **Reduced Support**: Clear feature costs reduce confusion
- **Competitive Edge**: Unique micropayment flexibility
- **Ethical Design**: Users aren't forced to pay for unwanted features

## Technical Notes

### Firestore Structure
```javascript
users/{userId} {
  plan: 'PAY_PER_USE',
  credits: 50,
  featurePreferences: {
    aiRiskAnalyst: true,
    portfolioAudit: false
  }
}
```

### API Response (Feature Disabled)
```json
{
  "success": true,
  "credits": 50,
  "deducted": 0,
  "skipped": true,
  "message": "AI Risk Analyst is disabled in preferences"
}
```

### API Response (Feature Enabled)
```json
{
  "success": true,
  "credits": 49,
  "deducted": 1
}
```

## Future Enhancements

### Potential Features
1. **Per-Token Preferences**: Enable AI only for high-value tokens
2. **Budget Limits**: Set daily/weekly credit spending limits
3. **Feature Bundles**: Discounted packages (e.g., 10 AI reports for 9 credits)
4. **Smart Recommendations**: Suggest enabling features based on token risk
5. **Usage Analytics**: Show which features user uses most

### UI Improvements
1. **Preview Mode**: Show what AI analysis looks like before enabling
2. **Cost Calculator**: Estimate monthly costs based on usage patterns
3. **Quick Toggles**: Enable features directly from scan results
4. **Notification**: Alert when credits low and features enabled

## Testing Checklist

- [x] Minimum payment reduced to €0.10
- [x] Feature preferences component renders correctly
- [x] Toggle switches work and save to Firestore
- [x] Credit deduction respects preferences
- [x] Disabled features don't deduct credits
- [x] Dashboard shows preferences for PAY_PER_USE users
- [x] Dashboard hides preferences for FREE/PREMIUM users
- [ ] Test with real x402 payment
- [ ] Test AI analysis with feature disabled
- [ ] Test portfolio audit with feature disabled
- [ ] Verify Firestore rules allow preference updates

## Files Modified

1. `app/pay-per-scan/page.tsx` - Minimum amount fix
2. `components/feature-preferences.tsx` - NEW component
3. `app/api/user/feature-preferences/route.ts` - NEW API endpoint
4. `lib/firestore-schema.ts` - Schema update
5. `app/api/credits/deduct/route.ts` - Preference checks
6. `app/dashboard/page.tsx` - Component integration

## Deployment Notes

### Before Deploying
1. Ensure Firebase Admin SDK has latest schema
2. Test preference saving in development
3. Verify credit deduction logic with disabled features
4. Check mobile responsiveness of toggle switches

### After Deploying
1. Monitor Firestore writes for preference updates
2. Check activity logs for credit deduction patterns
3. Gather user feedback on feature control
4. Track credit usage before/after implementation

## Success Metrics

### User Engagement
- % of users who customize preferences
- Average credits saved per user
- Feature enable/disable frequency

### Financial Impact
- Credit purchase frequency
- Average purchase amount
- User retention rate

### Support Impact
- Reduction in "unexpected charges" complaints
- Increase in user satisfaction scores
- Decrease in refund requests

---

**Status:** ✅ Implemented and Ready for Testing
**Date:** 2025-11-30
**Version:** 1.0.0
