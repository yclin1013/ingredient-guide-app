# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

Note: this project was downgraded from SDK 57 to SDK 54 on purpose — the user's phone can only get Expo Go for SDK 54 from the App Store. Do not upgrade the SDK without asking the user.

# SafeAreaView's inset padding does not reliably reach absolutely-positioned children

`SafeAreaView` (react-native-safe-area-context) applies the safe-area inset as padding to normal-flow children, but this is **not guaranteed for children with `position: 'absolute'`** — especially under Fabric (the new architecture), which this project uses (RN 0.81.5). An absolutely-positioned child's `top`/`left`/etc. can end up measured from the SafeAreaView's outer edge, ignoring the inset padding, even while sibling flow content on the same screen is positioned correctly.

This bit us once: a fixed-position back button (`position: 'absolute', top: 12`) inside a `SafeAreaView` overlapped the iOS status bar/notch on real devices, while the rest of the screen's content (normal flow, no absolute positioning) was fine. That split — only the absolutely-positioned element is off, nothing else is — is the tell for this exact bug. If the whole screen is off, look elsewhere.

**Rule going forward**: any UI element that needs `position: 'absolute'` (or fixed/overlay-style behavior) while also needing to avoid the system safe area must not rely on `SafeAreaView`'s implicit padding for it. Use `useSafeAreaInsets()` from `react-native-safe-area-context` and add the relevant inset (e.g. `insets.top`) to the element's offset explicitly. See the back button in `src/app/item/[id].tsx` for the working pattern.
