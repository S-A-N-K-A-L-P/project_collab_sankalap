# Mobile Portfolio Builder - Live Preview Implementation

This document details how to ensure the React-based Live Preview inside the Flutter WebView is smooth, fast, and instantly responsive.

## 1. The Challenge
Updating a WebView by reloading the URL (e.g., `url?data=json`) takes 1-3 seconds and causes white flashes. This destroys the "Live" feeling of editing a portfolio. 

## 2. The Solution: JavaScript Bridges
We will establish a direct, real-time communication pipeline between Dart (Flutter) and JavaScript (React) without reloading the page.

### 2.1 Next.js Setup (`/portfolio/mobile-preview/page.tsx`)
Create a dedicated route for the mobile preview. It should:
- Remove all Next.js Navigation bars or sidebars (it must be *just* the portfolio).
- Disable scrolling overflow at the `html/body` level if the Flutter app intends to handle scrolling, OR let the WebView handle internal scrolling.
- Expose a global function to receive data:

```tsx
'use client';
import { useEffect, useState } from 'react';
import PortfolioRenderer from '@/components/PortfolioRenderer';

export default function MobilePreviewPage() {
  const [portfolioData, setPortfolioData] = useState(null);

  useEffect(() => {
    // Expose this to Flutter's WebView controller
    window.receivePortfolioUpdate = (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        setPortfolioData(data);
      } catch (e) {
        console.error("Invalid JSON from Flutter");
      }
    };
    
    // Optional: Let Flutter know React is mounted and ready
    if (window.FlutterBridge) {
        window.FlutterBridge.postMessage("READY");
    }
  }, []);

  if (!portfolioData) return <LoadingSpinner />;
  
  return <PortfolioRenderer data={portfolioData} />;
}
```

### 2.2 Flutter Setup (`LivePreviewScreen.dart`)
Initialize the `webview_flutter` package correctly.

```dart
late final WebViewController _controller;

@override
void initState() {
  super.initState();
  _controller = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    // Receive messages FROM React (e.g., when it's ready to receive data)
    ..addJavaScriptChannel(
      'FlutterBridge',
      onMessageReceived: (JavaScriptMessage message) {
        if (message.message == "READY") {
            _pushLatestDataToWebView();
        }
      },
    )
    ..loadRequest(Uri.parse('https://project-syncroo.netlify.app/mobile-preview'));
}

// Call this function whenever the user types/edits data in Flutter
void _pushLatestDataToWebView() {
  final jsonString = jsonEncode(currentPortfolioState.toJson());
  // Execute the JS function we exposed in React
  _controller.runJavaScript("window.receivePortfolioUpdate('$jsonString')");
}
```

## 3. Smooth Animation Strategy
React frameworks like Framer Motion rely on state changes to trigger animations. 
When Flutter sends a new JSON payload:
1. **Debouncing:** Flutter should NOT send updates on every single keystroke (this causes React to re-render 60 times a second and ruins animations). Flutter should debounce inputs by `300ms`.
2. **Deep Diffing in React:** If you use Framer Motion for a "Rise up" animation on a card, sending the entire JSON might make the card re-animate from the bottom every time you type a letter. React's `PortfolioRenderer` should utilize `React.memo` and deep-equality checks so that ONLY the specific `Text` node updates, leaving the surrounding layout/animation state intact.
3. **Background Swapping:** When changing a 2D/3D background, React must unmount the old canvas and mount the new one. Ensure Three.js contexts are properly destroyed to prevent memory leaks in the WebView.
