import { getFileTypeFromMime } from '../fileTypeUtils'

describe('fileTypeUtils - Error Fix Tests', () => {
  describe('getFileTypeFromMime - null/undefined handling', () => {
    it('should handle null mimeType gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      expect(getFileTypeFromMime(null)).toBe('File')
    })

    it('should handle undefined mimeType gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      expect(getFileTypeFromMime(undefined)).toBe('File')
    })

    it('should handle empty string mimeType', () => {
      expect(getFileTypeFromMime('')).toBe('File')
    })

    it('should handle non-string mimeType', () => {
      // @ts-ignore - Testing runtime behavior
      expect(getFileTypeFromMime(123)).toBe('File')
      // @ts-ignore - Testing runtime behavior
      expect(getFileTypeFromMime({})).toBe('File')
      // @ts-ignore - Testing runtime behavior
      expect(getFileTypeFromMime([])).toBe('File')
    })

    it('should handle valid mimeTypes correctly', () => {
      expect(getFileTypeFromMime('application/pdf')).toBe('PDF')
      expect(getFileTypeFromMime('image/jpeg')).toBe('JPEG Image')
      expect(getFileTypeFromMime('application/zip')).toBe('ZIP Archive')
    })
  })

  describe('Filter Modal Simulation', () => {
    it('should simulate the filter modal scenario that was causing errors', () => {
      // Simulate documents with various fileType values that could cause issues
      const mockDocuments = [
        { id: '1', name: 'doc1.pdf', fileType: 'application/pdf', isFolder: false, linkedProperty: 'Property A' },
        { id: '2', name: 'doc2.jpg', fileType: 'image/jpeg', isFolder: false, linkedProperty: 'Property B' },
        { id: '3', name: 'folder1', fileType: null, isFolder: true, linkedProperty: null },
        { id: '4', name: 'doc3.docx', fileType: undefined, isFolder: false, linkedProperty: undefined },
        { id: '5', name: 'doc4.unknown', fileType: '', isFolder: false, linkedProperty: '' },
        { id: '6', name: 'doc5.txt', fileType: 'text/plain', isFolder: false, linkedProperty: 'Property C' },
      ]

      // Simulate the getUniqueItems function for type filtering
      const getUniqueTypesFixed = () => {
        const friendlyTypes = mockDocuments.map((doc) => {
          if (doc.isFolder) return "Folder"
        
          const friendlyType = getFileTypeFromMime(doc.fileType as any, doc.name)
          return friendlyType
        }).filter(Boolean) // Filter out undefined/null values
        
        return [...new Set(friendlyTypes)].sort()
      }

      // Simulate the getUniqueItems function for property filtering
      const getUniquePropertiesFixed = () => {
        return [...new Set(mockDocuments.map((doc) => doc.linkedProperty).filter(Boolean))]
      }

      const uniqueTypes = getUniqueTypesFixed()
      const uniqueProperties = getUniquePropertiesFixed()

      // Test that no undefined values are returned
      expect(uniqueTypes.every(type => type && typeof type === 'string')).toBe(true)
      expect(uniqueProperties.every(prop => prop && typeof prop === 'string')).toBe(true)

      // Test that toLowerCase() would work on all items
      expect(() => {
        uniqueTypes.forEach(item => item.toLowerCase())
        uniqueProperties.forEach(item => item.toLowerCase())
      }).not.toThrow()

      // Test the actual filter function that was causing the error
      const searchTerm = 'pdf'
      const filteredTypes = uniqueTypes.filter((item) => 
        item && typeof item === 'string' && item.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(filteredTypes).toContain('PDF')
      expect(filteredTypes.length).toBeGreaterThan(0)
    })
  })
})
