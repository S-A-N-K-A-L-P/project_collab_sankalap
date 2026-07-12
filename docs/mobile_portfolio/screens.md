# Mobile Portfolio Builder - Screens Design

This document lists the native Flutter screens designed to build the portfolio on mobile.

## 1. Portfolio Dashboard (Entry Screen)
**Purpose:** High-level overview and navigation hub.
**Widgets:**
- `SliverAppBar`: Expandable header with a "View Live" button.
- `StatCards`: Grid showing Views, Likes, and Uptime.
- `NavigationListTiles`: 5 large tiles for (Theme, Background, Sections, Data, Publish).
- `FloatingActionButton`: Always-visible "Live Preview" button (opens Screen 8).

## 2. Theme Editor Screen
**Purpose:** Customizing colors and aesthetics.
**Widgets:**
- `GridView.builder`: For selecting Theme Presets (Aurora, Midnight, etc.).
- `ColorPicker`: Bottom sheet or inline pickers for `accent` and `accent2` hex values.
- `DropdownButtonFormField`: Selecting card styles (Glass, Flat, Neumorphic) and animations.

## 3. Background Settings Screen
**Purpose:** Toggling effects behind the portfolio.
**Widgets:**
- `SwitchListTile`: Toggle between 2D Effects and Heavy 3D rendering.
- `CarouselSlider`: Swipeable thumbnail previews of different scenes (Particles, Constellation).
- `Slider`: Adjust opacity or intensity of the background.

## 4. Sections Manager Screen
**Purpose:** Reordering and managing active sections.
**Widgets:**
- `ReorderableListView`: Drag-and-drop handles on the right side of each section card.
- `Dismissible`: Swipe left to delete or hide a section.
- `BottomSheet`: Appears on "Add Section" tap, listing 16 available section types with icons.

## 5. Hero & Text Section Editors
**Purpose:** Basic text input for Hero, About, Quote, etc.
**Widgets:**
- `TextFormField`: For standard single-line inputs (Headline, Tagline).
- `TextFormField (maxLines: null)`: For multiline markdown inputs (About body).
- `ElevatedButton`: "Save changes" (triggers debounced update).

## 6. Skills Section Editor
**Purpose:** Managing skill sets with proficiency.
**Widgets:**
- `Wrap` with `InputChip`: Adding and removing skills quickly.
- `Slider`: (Optional) Tap a chip to reveal a slider setting 1-100% proficiency.

## 7. Complex List Section Editor (Projects / Experience)
**Purpose:** Managing arrays of complex objects.
**Widgets:**
- `ListView.builder`: Showing a summary of added items.
- `Form`: A nested form that expands when tapping "Add New Item".
- Includes fields for Dates (`DatePicker`), URLs (`TextField` with URL validation), and Image uploads (`ImagePicker`).

## 8. Data & JSON Screen
**Purpose:** Import/Export and syncing with main profile.
**Widgets:**
- `ListTile` with `Icon(Icons.sync)`: "Auto-fill from profile".
- `ElevatedButton`: "Export to JSON" (Uses `path_provider` to save file).
- `ElevatedButton`: "Import JSON" (Uses `file_picker`).

## 9. Publish Screen
**Purpose:** Launching the portfolio.
**Widgets:**
- `Switch`: Public visibility toggle.
- `TextField`: Input for custom handle (e.g., syncro.app/`handle`).
- `Share.share()`: Native share sheet invocation for the public URL.

## 10. Live Preview (WebView Screen)
**Purpose:** Rendering the React components.
**Widgets:**
- `WebViewWidget`: Full-screen webview.
- `AppBar`: Minimal top bar with a "Close Preview" button.
- (See `live_preview.md` for deep implementation details).
