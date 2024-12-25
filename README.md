<p align="center">
  <h1 align="center"><img src="https://www.unriddle.ai/icons/logo.png" width="196" /></h1>
  <p align="center">
    <i>Simple primitives to compose powerful PDF viewing experiences.<br>powered by <code><a href="https://mozilla.github.io/pdf.js/">PDF.js</a></code> and <code><a href="https://reactjs.org/">React</a></code></i>
  </p>
</p>

# `lector`

The JavaScript toolkit to build feature-rich PDF viewers with your own opinions, powered by `PDF.js` and `React`.

[![npm version](https://badge.fury.io/js/@unriddle-ai%2Flector.svg)](https://www.npmjs.com/package/@unriddle-ai/lector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Compose PDF viewing applications using simple, flexible primitives. The core building blocks in Lector are:

- `Root` - The container component that manages PDF loading and context
- `Pages` - A wrapper for managing page layout and interactions
- `Page` - Individual page container with viewport management
- `CanvasLayer` - The primitive for actual PDF rendering

## Core Concepts

Creating a new PDF viewer is as simple as composing these primitives:

```jsx
import { CanvasLayer, Page, Pages, Root } from "@unriddle-ai/lector";

export default function PDFViewer() {
  return (
    <Root
      fileURL="/document.pdf"
      className="w-full h-[500px]"
      loader={<div>Loading...</div>}
    >
      <Pages>
        <Page>
          <CanvasLayer />
        </Page>
      </Pages>
    </Root>
  );
}
```

## Examples

| Category | Example | Description |
|----------|---------|-------------|
| Basic | Simple Viewer | Basic PDF viewer with single page layout |
| Dark Mode | Theme Switcher | PDF viewer with automatic dark mode support |
| Advanced | Multi-page Layout | Custom layout with multiple pages visible |
| Custom | Thumbnail Navigator | Custom navigation with page thumbnails |

## Goals

Primary goal is to provide the essential building blocks needed to create PDF viewers without enforcing specific layouts or interaction patterns. The focus is on:

1. Composable primitives that work together seamlessly
2. First-class dark mode support
3. Type-safe APIs with full TypeScript support
4. Framework agnostic core (though initially React-focused)
5. Simple integration with any styling solution

## Installation

```bash
npm install @unriddle-ai/lector

# or with yarn
yarn add @unriddle-ai/lector

# or with pnpm
pnpm add @unriddle-ai/lector
```

## Core Components

### Root

The container component that manages PDF loading and context:

```jsx
<Root
  fileURL="/path/to/document.pdf"
  className="w-full h-screen"
  loader={<CustomLoader />}
>
  {children}
</Root>
```

### Pages

Container for managing page layout and interactions:

```jsx
<Pages 
  className="dark:invert-[94%]"
  layout="single"
>
  {children}
</Pages>
```

### Page

Individual page container with viewport management:

```jsx
<Page
  pageNumber={1}
  className="shadow-lg"
>
  {children}
</Page>
```

### CanvasLayer

The primitive for actual PDF rendering:

```jsx
<CanvasLayer
  className="antialiased"
  scale={1.5}
/>
```

## Contributing

We welcome contributions! The surface layer we are intending to tackle:

1. Core rendering primitives
2. Accessibility features
3. Touch/mobile interactions
4. Advanced navigation features
5. Thumbnail generation
6. Search functionality

## License

MIT © [Unriddle AI]()