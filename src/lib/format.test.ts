import { describe, expect, it } from 'vitest'
import { fileGlyph, formatBytes } from './format'
import { fileValidationError } from './validation'

describe('formatBytes', () => {
  it('formats empty, byte, and larger values', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1048576)).toBe('1.0 MB')
  })
})

describe('fileGlyph', () => {
  it('groups common cloud file types', () => {
    expect(fileGlyph('application/pdf')).toBe('PDF')
    expect(fileGlyph('image/jpeg')).toBe('Image')
    expect(fileGlyph('application/zip')).toBe('ZIP')
    expect(fileGlyph('application/octet-stream')).toBe('FILE')
  })
})

describe('fileValidationError', () => {
  it('accepts supported files up to the 25 MB limit', () => {
    expect(fileValidationError({ type: 'application/pdf', size: 1024 })).toBeNull()
    expect(fileValidationError({ type: 'image/png', size: 25 * 1024 * 1024 })).toBeNull()
  })

  it('rejects unsupported, oversized, and empty files', () => {
    expect(fileValidationError({ type: 'application/x-msdownload', size: 100 })).toContain('not supported')
    expect(fileValidationError({ type: 'text/plain', size: 25 * 1024 * 1024 + 1 })).toContain('25 MB')
    expect(fileValidationError({ type: 'text/plain', size: 0 })).toContain('Empty')
  })
})
