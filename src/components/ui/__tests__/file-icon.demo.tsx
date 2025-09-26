/**
 * Demo component showing file icons for different MIME types
 * This demonstrates how the search suggestions will look
 */

import { FileIcon, FileTypeWithIcon } from '../file-icon'

export function FileIconDemo() {
  const testFiles = [
    {
      name: "Eligible_T0_Securities_3.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    {
      name: "Project_Report.pdf",
      mimeType: "application/pdf"
    },
    {
      name: "Meeting_Notes.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    {
      name: "Presentation.pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    },
    {
      name: "data.csv",
      mimeType: "text/csv"
    },
    {
      name: "config.json",
      mimeType: "application/json"
    },
    {
      name: "photo.jpg",
      mimeType: "image/jpeg"
    },
    {
      name: "video.mp4",
      mimeType: "video/mp4"
    },
    {
      name: "audio.mp3",
      mimeType: "audio/mpeg"
    },
    {
      name: "archive.zip",
      mimeType: "application/zip"
    },
    {
      name: "readme.txt",
      mimeType: "text/plain"
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">File Icons Demo</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Search Suggestions Preview:</h3>
        <div className="border rounded-md bg-white shadow-lg max-w-md">
          {testFiles.map((file, index) => (
            <div
              key={index}
              className="hover:text-primary cursor-pointer px-4 py-3 text-sm last:border-b-0 hover:bg-gray-100 border-b"
            >
              <div className="flex items-center gap-3">
                <FileIcon 
                  mimeType={file.mimeType} 
                  size={18}
                  className="flex-shrink-0"
                />
                <span className="truncate">{file.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Icons with File Types:</h3>
        <div className="grid grid-cols-2 gap-2">
          {testFiles.map((file, index) => (
            <div key={index} className="p-2 border rounded">
              <FileTypeWithIcon 
                mimeType={file.mimeType}
                fileName={file.name}
                iconSize={20}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Icon Colors by Type:</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileIcon mimeType="application/pdf" size={20} />
            <span>PDF (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" size={20} />
            <span>Word (Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" size={20} />
            <span>Excel (Green)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="application/vnd.openxmlformats-officedocument.presentationml.presentation" size={20} />
            <span>PowerPoint (Orange)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="image/jpeg" size={20} />
            <span>Image (Pink)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="video/mp4" size={20} />
            <span>Video (Indigo)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="audio/mpeg" size={20} />
            <span>Audio (Yellow)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon mimeType="application/zip" size={20} />
            <span>Archive (Gray)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Expected API Response Format:
 * 
 * {
 *   "query": "eligi",
 *   "suggestions": [
 *     {
 *       "text": "Eligible_T0_Securities_3.xlsx",
 *       "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
 *       "type": "suggestion"
 *     }
 *   ],
 *   "type": "autocomplete"
 * }
 * 
 * The FileIcon component will automatically:
 * 1. Parse the mimeType
 * 2. Select the appropriate icon (FileSpreadsheet for Excel files)
 * 3. Apply the correct color (green for Excel)
 * 4. Display at the specified size (18px in search suggestions)
 */
