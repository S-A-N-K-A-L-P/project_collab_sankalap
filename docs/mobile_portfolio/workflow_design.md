# Mobile Portfolio Builder - Workflow Design

## 1. High-Level Architecture
The mobile portfolio builder utilizes a **Hybrid Architecture**:
*   **Editor UI (Input):** 100% Native Flutter (Dart). Ensures smooth, responsive, and native-feeling inputs (keyboards, scrolling, drag-and-drop).
*   **Preview UI (Output):** Next.js React Component rendered via a Flutter `WebView`. Ensures 100% design consistency with the web version, avoiding double-implementation of complex UI/3D logic.

## 2. Alignment Matrix
Where features will be implemented and aligned:

| Feature | Handled By | Location | Alignment Details |
| :--- | :--- | :--- | :--- |
| **State Management** | Flutter | `flutter_bloc` / `provider` | Holds the master `Portfolio` JSON object. Native UI updates this state. |
| **UI Components (Forms)**| Flutter | Native Widgets | TextFields, Sliders, Chips, ReorderableListViews. |
| **UI Components (Render)**| Next.js | React Components | The actual rendered portfolio (cards, fonts, 3D backgrounds). |
| **Data Synchronization** | Flutter -> WebView | JS Bridge | Flutter serializes state to JSON -> `runJavaScript` -> React parses and updates state. |
| **Persistence (Save)** | Flutter -> Next.js API | `api/mobile/portfolio` | Flutter sends `PUT/POST` requests to the backend to save the draft/publish. |

## 3. Data Flow
1. **Fetch:** App opens -> GET `/api/mobile/portfolio` -> Flutter state is populated.
2. **Edit:** User edits a text field (e.g., Hero Headline) in Flutter.
3. **Optimistic UI:** Flutter state updates instantly.
4. **Live Preview Sync:** Flutter calls `webView.runJavaScript('window.receivePortfolioUpdate($json)')`.
5. **React Render:** Next.js WebView receives event, updates React state, triggers re-render (e.g., Framer Motion animations play).
6. **Save:** Debounced save to the backend API (`PUT /api/mobile/portfolio`).
