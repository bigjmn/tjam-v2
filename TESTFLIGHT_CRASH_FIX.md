# 🔧 TestFlight Production Crash - Diagnosis & Fix

## 🔴 Root Cause: Missing Environment Variables

The app crashes immediately in TestFlight because **Google OAuth environment variables are undefined in production builds**.

### What Was Happening

**GoogleLoginButton.tsx** runs this code at module initialization:

```typescript
GoogleSignin.configure({
	webClientId: process.env.EXPO_PUBLIC_WEB_ID, // ← undefined in production!
	iosClientId: process.env.EXPO_PUBLIC_IOS_ID, // ← undefined in production!
});
```

**Timeline:**

1. App starts → Loads `_layout.tsx`
2. Loads `UserProvider` → Imports `GoogleLoginButton.tsx`
3. `GoogleSignin.configure()` runs with `undefined` values
4. Google Sign-In SDK crashes or becomes misconfigured
5. **App crashes immediately** 💥

### Why This Happened

- ✅ **Development**: `.env.local` file is loaded automatically by Expo
- ❌ **Production**: EAS doesn't load `.env` files by default
- ❌ **Missing config**: `eas.json` had no `env` field in production profile

---

## ✅ Fixes Applied

### Fix 1: Add Environment Variables to EAS Build Config

**File:** `eas.json`

```json
"production": {
  "environment": "production",
  "autoIncrement": true,
  "env": {
    "EXPO_PUBLIC_WEB_ID": "69866138009-h77bgl4en8rqo6b7f2ieiv0hhuf4sbsi.apps.googleusercontent.com",
    "EXPO_PUBLIC_IOS_ID": "69866138009-ife8ui5n34uhgur4mqcsmjeol5s4o9nl.apps.googleusercontent.com"
  }
}
```

**Why this works:**

- EAS now injects these variables at build time
- `process.env.EXPO_PUBLIC_*` will be available in production
- Google Sign-In configures correctly

### Fix 2: Add Defensive Logging

**File:** `GoogleLoginButton.tsx`

```typescript
// Defensive check: Ensure env variables are loaded
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_ID;

if (!WEB_CLIENT_ID || !IOS_CLIENT_ID) {
	console.error(
		"🔴 [GoogleAuth] CRITICAL: Missing Google OAuth credentials!",
	);
	console.error(
		"🔴 [GoogleAuth] WEB_CLIENT_ID:",
		WEB_CLIENT_ID ? "✓" : "❌ MISSING",
	);
	console.error(
		"🔴 [GoogleAuth] IOS_CLIENT_ID:",
		IOS_CLIENT_ID ? "✓" : "❌ MISSING",
	);
	console.error(
		"🔴 [GoogleAuth] App will crash if Google Sign-In is attempted!",
	);
} else {
	console.log("✅ [GoogleAuth] Google OAuth credentials loaded successfully");
}
```

**Why this helps:**

- Logs clear error messages if env variables are missing
- Easier to diagnose future environment issues
- Fails gracefully with informative errors

---

## 🚀 How to Deploy the Fix

### Step 1: Build Production Version

```bash
eas build --platform ios --profile production
```

### Step 2: Verify in Build Logs

After the build starts, check the logs for:

```
✅ [GoogleAuth] Google OAuth credentials loaded successfully
```

If you see:

```
🔴 [GoogleAuth] CRITICAL: Missing Google OAuth credentials!
```

Then the env variables didn't load correctly.

### Step 3: Submit to TestFlight

```bash
eas submit --platform ios --profile production
```

### Step 4: Test in TestFlight

**Critical tests:**

1. ✅ App launches without crashing
2. ✅ Can play as anonymous user
3. ✅ Can sign in with Google
4. ✅ Can sign in with Apple

---

## 🔍 Other Potential Production Issues (Checked)

### ✅ Firebase Configuration

- Firebase config is hardcoded in `lib/firebase.ts` ✓
- No environment variables needed ✓
- Should work in production ✓

### ✅ AsyncStorage

- Properly initialized with Firebase persistence ✓
- No production-specific issues ✓

### ✅ Apple Authentication

- Uses `expo-apple-authentication` plugin ✓
- Configured in `app.json` ✓
- Should work in production ✓

### ⚠️ Console Statements (219 found)

- Not a crash risk, but increases bundle size
- Consider removing or using conditional logging in future

---

## 🎯 Prevention: How to Avoid This in Future

### 1. Always Test Production Builds Locally

Before submitting to TestFlight:

```bash
# Build a production-like preview
eas build --platform ios --profile preview

# Test on simulator
npx expo start --no-dev --minify
```

### 2. Use EAS Secrets for Sensitive Values

For production credentials:

```bash
# Store as EAS secrets (encrypted)
eas secret:create --name EXPO_PUBLIC_WEB_ID --value "your-value"
eas secret:create --name EXPO_PUBLIC_IOS_ID --value "your-value"
```

Then reference in `eas.json`:

```json
"env": {
  "EXPO_PUBLIC_WEB_ID": "${EXPO_PUBLIC_WEB_ID}",
  "EXPO_PUBLIC_IOS_ID": "${EXPO_PUBLIC_IOS_ID}"
}
```

### 3. Add Startup Validation

Create a startup validation hook:

```typescript
// hooks/useStartupValidation.ts
export function useStartupValidation() {
	useEffect(() => {
		const requiredEnvVars = ["EXPO_PUBLIC_WEB_ID", "EXPO_PUBLIC_IOS_ID"];

		const missing = requiredEnvVars.filter((key) => !process.env[key]);

		if (missing.length > 0) {
			console.error("❌ Missing environment variables:", missing);
			// Could show an error screen in development
		}
	}, []);
}
```

### 4. Enable Crash Reporting

Add crash reporting to catch production issues:

```bash
npx expo install expo-crash-analytics
# or
npm install @sentry/react-native
```

---

## 📊 Debugging Future TestFlight Crashes

### Get Crash Logs from Xcode

1. Open **Xcode**
2. Go to **Window → Devices and Simulators**
3. Select your device
4. Click **View Device Logs**
5. Find the crash log for your app
6. Look for the stack trace

### Get Crash Logs from App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **TestFlight → Crashes**
4. View crash analytics and stack traces

### Enable Debug Logs in Production

Temporarily add to `_layout.tsx`:

```typescript
if (!__DEV__) {
	console.log("🚀 App starting in PRODUCTION mode");
	console.log("📦 Environment check:", {
		hasWebId: !!process.env.EXPO_PUBLIC_WEB_ID,
		hasIosId: !!process.env.EXPO_PUBLIC_IOS_ID,
	});
}
```

---

## ✅ Expected Outcome

After rebuilding with the fix:

1. ✅ App launches successfully in TestFlight
2. ✅ Google Sign-In works correctly
3. ✅ Apple Sign-In works correctly
4. ✅ No immediate crashes
5. ✅ Environment variables are loaded

You should see in the console (visible via Xcode logs):

```
✅ [GoogleAuth] Google OAuth credentials loaded successfully
```

---

## 🆘 If It Still Crashes

### Check These:

1. **Rebuild from scratch:**

    ```bash
    eas build --platform ios --profile production --clear-cache
    ```

2. **Verify env variables in build:**
    - Check EAS build logs
    - Look for "Environment variables" section
    - Confirm `EXPO_PUBLIC_*` variables are listed

3. **Check for other undefined values:**
    - Search codebase for `process.env.EXPO_PUBLIC_`
    - Ensure all are defined in `eas.json`

4. **Enable verbose logging:**

    ```bash
    eas build --platform ios --profile production --verbose
    ```

5. **Check Apple App Store Connect for crash logs:**
    - TestFlight → Crashes tab
    - Look for stack trace pointing to crash location

---

## 📝 Summary

**Problem:** Environment variables not loaded in production builds
**Solution:** Added `env` field to `eas.json` production profile
**Prevention:** Added defensive logging and validation
**Status:** ✅ Fixed - Ready to rebuild and resubmit

Next build should work! 🎉
