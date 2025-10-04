# Infinite Loop Fix in Map Modal

## Problem
The `map-model.tsx` component was experiencing an infinite loop error:

```
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## Root Cause
The issue was in the `useEffect` hook that loads KML files:

```jsx
// PROBLEMATIC CODE
useEffect(() => {
  if (isOpen && documents && documents.length > 0) {
    loadKmlFiles() // Function recreated on every render
  } else {
    setKmlLayers([])
  }
}, [isOpen, documents]) // loadKmlFiles not in dependency array

const loadKmlFiles = async () => {
  // ... function body
  setKmlLayers(allShapes) // Triggers re-render
  setIsLoadingKml(false)  // Triggers re-render
}
```

**The Problem:**
1. `loadKmlFiles` function is recreated on every component render
2. `useEffect` runs when `isOpen` or `documents` change
3. `loadKmlFiles` calls `setKmlLayers` and `setIsLoadingKml`, triggering re-render
4. Component re-renders, `loadKmlFiles` is recreated (new reference)
5. If `loadKmlFiles` were added to dependency array, it would cause infinite loop
6. Without `loadKmlFiles` in dependency array, ESLint warnings and potential stale closures

## Solution
Used `useCallback` to memoize the `loadKmlFiles` function and properly manage dependencies:

```jsx
// FIXED CODE
const loadKmlFiles = useCallback(async () => {
  if (!documents) return
  const kmlFiles = documents.filter(doc => 
    doc.name.toLowerCase().endsWith('.kml') || 
    doc.fileType.includes('kml')
  )
  if (kmlFiles.length === 0) return

  setIsLoadingKml(true)
  const allShapes: KmlShape[] = []

  for (const kmlFile of kmlFiles) {
    try {
      const response = await apiClient.post('/dashboard/documents/download', {
        items: [{ id: kmlFile.doc_id, type: "file" }]
      }, { responseType: 'text' })

      if (response.data) {
        const parser = new DOMParser()
        const kmlDoc = parser.parseFromString(response.data, 'text/xml')
        const shapes = extractKmlShapes(kmlDoc)
        if (shapes.length > 0) {
          allShapes.push(...shapes)
          console.log(`✅ Loaded ${shapes.length} shapes from KML file: ${kmlFile.name}`)
        } else {
          console.warn(`⚠️ No shapes found in KML file: ${kmlFile.name}`)
        }
      }
    } catch (error) {
      console.error(`❌ Error loading KML file ${kmlFile.name}:`, error)
    }
  }

  setKmlLayers(allShapes)
  setIsLoadingKml(false)
}, [documents]) // Only recreate when documents change

useEffect(() => {
  if (isOpen && documents && documents.length > 0) {
    loadKmlFiles()
  } else {
    setKmlLayers([])
  }
}, [isOpen, documents, loadKmlFiles]) // Now safe to include loadKmlFiles
```

## Key Changes

### 1. Added `useCallback` Import
```jsx
import { useCallback, useEffect, useState } from 'react'
```

### 2. Memoized `loadKmlFiles` Function
- Wrapped with `useCallback`
- Dependencies: `[documents]` - only recreate when documents change
- Function reference remains stable between renders when documents don't change

### 3. Updated `useEffect` Dependencies
- Added `loadKmlFiles` to dependency array: `[isOpen, documents, loadKmlFiles]`
- Now ESLint compliant and prevents stale closures
- No infinite loop because `loadKmlFiles` reference is stable

## Benefits

### Performance
- ✅ No infinite re-renders
- ✅ Function only recreated when documents actually change
- ✅ Reduced unnecessary API calls

### Code Quality
- ✅ ESLint compliant dependency arrays
- ✅ No stale closure issues
- ✅ Predictable component behavior

### User Experience
- ✅ Map loads KML files correctly
- ✅ No browser freezing from infinite loops
- ✅ Proper loading states and error handling

## Testing
After the fix:
- ✅ Server compiles without errors
- ✅ No infinite loop console errors
- ✅ Map modal opens and closes properly
- ✅ KML files load when available
- ✅ Component re-renders only when necessary

This fix ensures the map modal works correctly while maintaining optimal performance and following React best practices for `useEffect` and `useCallback` usage.
