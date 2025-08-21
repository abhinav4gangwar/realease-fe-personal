# File Type Utilities

This module provides utilities to convert MIME types from the backend into user-friendly file type names.

## Installation

The utilities use the `mime-types` package which has been installed:

```bash
npm install mime-types
npm install --save-dev @types/mime-types
```

## Usage

### 1. Basic Function Usage

```typescript
import { getFileTypeFromMime } from '@/utils/fileTypeUtils'

// Convert MIME type to user-friendly name
const fileType = getFileTypeFromMime('application/pdf') // Returns: "PDF"
const fileType2 = getFileTypeFromMime('application/vnd.openxmlformats-officedocument.wordprocessingml.document') // Returns: "Word Document"
const fileType3 = getFileTypeFromMime('image/jpeg') // Returns: "JPEG Image"

// With filename fallback
const fileType4 = getFileTypeFromMime('application/octet-stream', 'document.pdf') // Returns: "PDF"
```

### 2. React Component Usage

```typescript
import { FileTypeDisplay } from '@/components/ui/file-type-display'

function DocumentCard({ document }) {
  return (
    <div>
      <h3>{document.name}</h3>
      <p>Type: <FileTypeDisplay mimeType={document.fileType} fileName={document.name} /></p>
    </div>
  )
}
```

### 3. Hook Usage

```typescript
import { useFileType } from '@/components/ui/file-type-display'

function DocumentInfo({ document }) {
  const friendlyType = useFileType(document.fileType, document.name)
  
  return <span>File Type: {friendlyType}</span>
}
```

### 4. Category Detection

```typescript
import { getFileCategory, isImageType, isPdfType } from '@/utils/fileTypeUtils'

const category = getFileCategory('image/jpeg') // Returns: "image"
const isImage = isImageType('image/png') // Returns: true
const isPdf = isPdfType('application/pdf') // Returns: true
```

## Supported File Types

### Documents
- PDF → "PDF"
- Word Documents → "Word Document"
- Excel Spreadsheets → "Excel Spreadsheet"
- PowerPoint Presentations → "PowerPoint Presentation"
- Text Files → "Text File"
- CSV Files → "CSV File"
- Rich Text Documents → "Rich Text Document"

### Images
- JPEG → "JPEG Image"
- PNG → "PNG Image"
- GIF → "GIF Image"
- SVG → "SVG Image"
- WebP → "WebP Image"
- BMP → "BMP Image"
- TIFF → "TIFF Image"

### Audio/Video
- MP3 → "MP3 Audio"
- WAV → "WAV Audio"
- MP4 Video → "MP4 Video"
- AVI → "AVI Video"

### Archives
- ZIP → "ZIP Archive"
- RAR → "RAR Archive"
- 7Z → "7Z Archive"

### Code Files
- JavaScript → "JavaScript File"
- JSON → "JSON File"
- HTML → "HTML File"
- CSS → "CSS File"

## Fallback Behavior

1. **Custom mapping**: Checks predefined friendly names first
2. **mime-types library**: Uses the library to get file extension
3. **Filename extraction**: Extracts extension from filename if provided
4. **Category parsing**: Parses MIME type category (image/, video/, etc.)
5. **Final fallback**: Returns "File" if nothing else works

## Examples in the Codebase

### Document Detail Modal
```typescript
// Before
<p className="text-sm">{document.fileType}</p>

// After
<FileTypeDisplay 
  mimeType={document.fileType} 
  fileName={document.name}
  className="text-sm"
  fallback="Unknown"
/>
```

### Custom Implementation
```typescript
// For icon mapping
const getFileTypeFromMimeType = (mimeType: string, fileName?: string) => {
  const friendlyType = getFileTypeFromMime(mimeType, fileName)
  
  const iconTypeMap: Record<string, string> = {
    'PDF': 'pdf',
    'Word Document': 'word',
    'Excel Spreadsheet': 'excel',
    // ... more mappings
  }
  
  return iconTypeMap[friendlyType] || friendlyType.toLowerCase()
}
```

## Benefits

1. **Consistent**: All file types are displayed consistently across the app
2. **User-friendly**: Shows "PDF" instead of "application/pdf"
3. **Maintainable**: Centralized logic for file type conversion
4. **Extensible**: Easy to add new file types or modify existing ones
5. **Robust**: Multiple fallback mechanisms ensure something is always displayed
