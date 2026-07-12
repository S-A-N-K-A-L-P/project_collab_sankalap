# Mobile Portfolio Builder - User Steps (Workflow)

This document maps the exact user journey for designing a portfolio on the mobile app.

## Step 1: Navigating to Builder
1. User opens the Syncro app.
2. Taps on the **Profile** tab in the BottomNavigationBar.
3. Taps the **Settings** gear icon.
4. Selects **Portfolio Builder** from the settings menu.
5. User lands on the **Portfolio Dashboard (Screen 1)**.

## Step 2: Bootstrapping Data (Optional)
1. User taps **Data (Screen 8)**.
2. Taps **"Auto-fill from profile"**.
3. The app queries the Next.js API, retrieves the user's Github links, completed projects, and skills, and populates the local Draft JSON.
4. User taps back to the Dashboard.

## Step 3: Customizing Aesthetics
1. User taps **Theme (Screen 2)**.
2. Selects the "Midnight" preset.
3. Modifies the primary accent color to Cyan.
4. Goes back, taps **Background (Screen 3)**.
5. Turns off "Heavy 3D" to save battery, selects the "Constellation" 2D effect.

## Step 4: Managing Sections
1. User taps **Sections (Screen 4)**.
2. They see Hero, About, and Skills automatically added.
3. User taps the **+ FAB (Add Section)**.
4. Selects **Projects** from the bottom sheet.
5. Taps the new Projects card to open the **Complex List Editor (Screen 7)**.
6. User taps "Add manual project", fills out Title, Description, and Link.

## Step 5: Live Previewing & Iterating
1. At any point, the user taps the persistent **Live Preview** button.
2. The **WebView (Screen 10)** slides up.
3. The React app loads the `/mobile-preview` route.
4. Flutter injects the current draft JSON into the WebView.
5. User sees exactly how their Constellation background, Cyan theme, and new Project card look.
6. User swipes down to close the preview and returns to editing.

## Step 6: Publishing
1. Satisfied with the preview, user taps **Publish (Screen 9)**.
2. Types in a custom handle `syncro.app/my-name`.
3. Toggles "Make Public" to ON.
4. App sends `PUT /api/mobile/portfolio` with the final JSON and `isPublished: true`.
5. User taps "Share" and posts their portfolio link on Twitter.
