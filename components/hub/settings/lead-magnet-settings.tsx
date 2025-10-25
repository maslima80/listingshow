'use client'

import { useState, useEffect } from 'react'
import { LeadMagnetBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Upload, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  fileUrl: string
  fileSize: number | null
  downloadCount: number
  isActive: boolean
}

interface LeadMagnetSettingsProps {
  settings: LeadMagnetBlockSettings
  onChange: (settings: LeadMagnetBlockSettings) => void
}

export function LeadMagnetSettings({ settings, onChange }: LeadMagnetSettingsProps) {
  const [localSettings, setLocalSettings] = useState<LeadMagnetBlockSettings>(settings)
  const [resources, setResources] = useState<Resource[]>([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [selectedResourceId, setSelectedResourceId] = useState<string>('')

  // Fetch resources from manager
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        const activeResources = data.filter((r: Resource) => r.isActive)
        setResources(activeResources)
        
        // Match current fileUrl to a resource to show selection
        if (localSettings.asset.fileUrl && localSettings.asset.type === 'file') {
          const matchedResource = activeResources.find(
            (r: Resource) => r.fileUrl === localSettings.asset.fileUrl
          )
          if (matchedResource) {
            setSelectedResourceId(matchedResource.id)
          }
        }
        
        // Or use legacy resourceId if present
        if (localSettings.resourceId) {
          setSelectedResourceId(localSettings.resourceId)
        }
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setLoadingResources(false)
      }
    }
    fetchResources()
  }, [])

  // Auto-populate from selected resource
  const handleResourceSelect = (resourceId: string) => {
    setSelectedResourceId(resourceId)
    const resource = resources.find(r => r.id === resourceId)
    if (resource) {
      handleChange({
        title: resource.title,
        description: resource.description || '',
        asset: {
          type: 'file',
          fileUrl: resource.fileUrl,
        },
        thumbnailUrl: resource.coverImageUrl || '',
        resourceId: resourceId, // Store for persistence
      })
    }
  }

  const handleChange = (updates: Partial<LeadMagnetBlockSettings>) => {
    const newSettings = { ...localSettings, ...updates }
    setLocalSettings(newSettings)
    onChange(newSettings)
  }

  const handleAssetChange = (updates: Partial<LeadMagnetBlockSettings['asset']>) => {
    handleChange({
      asset: { ...localSettings.asset, ...updates }
    })
  }

  const handleGateChange = (updates: Partial<LeadMagnetBlockSettings['gate']>) => {
    handleChange({
      gate: { ...localSettings.gate, ...updates }
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={localSettings.title}
              onChange={(e) => handleChange({ title: e.target.value })}
              placeholder="2025 South Florida Market Report"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={localSettings.description || ''}
              onChange={(e) => handleChange({ description: e.target.value })}
              placeholder="Real pricing trends, days-on-market, and buyer demand."
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Resource Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Resource</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="resource-select">Select from Resources Manager</Label>
            <Select
              value={selectedResourceId}
              onValueChange={handleResourceSelect}
              disabled={loadingResources}
            >
              <SelectTrigger id="resource-select">
                <SelectValue placeholder={loadingResources ? 'Loading resources...' : 'Choose a resource'} />
              </SelectTrigger>
              <SelectContent>
                {resources.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No resources found
                  </div>
                ) : (
                  resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Resources are managed in your{' '}
              <a href="/dashboard/resources" target="_blank" className="text-blue-600 hover:underline">
                Resources Manager
              </a>
            </p>
          </div>

          {resources.length === 0 && !loadingResources && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>No resources yet?</strong> Create your first resource in the{' '}
                <a href="/dashboard/resources" target="_blank" className="underline">
                  Resources Manager
                </a>
                {' '}to get started.
              </p>
            </div>
          )}

          <Separator className="my-4" />

          <div>
            <Label className="mb-3 block">Or use External Link</Label>
            <div className="flex items-center gap-2 mb-2">
              <Switch
                id="use-external"
                checked={localSettings.asset.type === 'url'}
                onCheckedChange={(checked) => handleAssetChange({ type: checked ? 'url' : 'file' })}
              />
              <Label htmlFor="use-external" className="cursor-pointer text-sm">
                Use external URL instead
              </Label>
            </div>

            {localSettings.asset.type === 'url' && (
              <div className="mt-3">
                <Label htmlFor="targetUrl">External URL *</Label>
                <Input
                  id="targetUrl"
                  type="url"
                  value={localSettings.asset.targetUrl || ''}
                  onChange={(e) => handleAssetChange({ targetUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to an external file or resource
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {localSettings.thumbnailUrl && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Thumbnail Preview</h3>
            <div className="border rounded-lg p-4">
              <img
                src={`${localSettings.thumbnailUrl}?tr=w-400,h-300,fo-auto`}
                alt="Thumbnail preview"
                className="w-full max-w-sm rounded-lg"
              />
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* CTA */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Call to Action</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ctaLabel">Button Label</Label>
            <Input
              id="ctaLabel"
              value={localSettings.ctaLabel}
              onChange={(e) => handleChange({ ctaLabel: e.target.value })}
              placeholder="Download Free Report"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Lead Gate */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Lead Capture Gate</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gateEnabled">Collect Lead Before Download</Label>
              <p className="text-sm text-muted-foreground">Require form submission to access the file</p>
            </div>
            <Switch
              id="gateEnabled"
              checked={localSettings.gate.enabled}
              onCheckedChange={(checked) => handleGateChange({ enabled: checked })}
            />
          </div>

          {localSettings.gate.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requirePhone">Require Phone Number</Label>
                  <p className="text-sm text-muted-foreground">Make phone field required</p>
                </div>
                <Switch
                  id="requirePhone"
                  checked={localSettings.gate.requirePhone}
                  onCheckedChange={(checked) => handleGateChange({ requirePhone: checked })}
                />
              </div>

              <div>
                <Label htmlFor="consentLabel">Consent Checkbox Label</Label>
                <Textarea
                  id="consentLabel"
                  value={localSettings.gate.consentLabel || ''}
                  onChange={(e) => handleGateChange({ consentLabel: e.target.value })}
                  placeholder="I agree to be contacted about real estate opportunities."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to hide consent checkbox
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Layout */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Layout</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Display Style</Label>
            <RadioGroup
              value={localSettings.layout}
              onValueChange={(value: 'card' | 'banner') => handleChange({ layout: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="layout-card" />
                <Label htmlFor="layout-card" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Card</div>
                    <div className="text-xs text-muted-foreground">Vertical layout with thumbnail on left</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="banner" id="layout-banner" />
                <Label htmlFor="layout-banner" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Banner</div>
                    <div className="text-xs text-muted-foreground">Full-width horizontal layout with background image</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Lead Magnet:</strong> Offer valuable resources from your Resources Manager in exchange for contact information. 
          {localSettings.gate.enabled 
            ? ' Leads will be created in your CRM before download starts.'
            : ' Downloads are instant without form submission.'}
        </p>
      </div>

      {/* Validation Warning */}
      {(!localSettings.title || (!localSettings.asset.fileUrl && !localSettings.asset.targetUrl)) && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>⚠️ Incomplete:</strong> This block requires a title and either a file URL or external URL to display publicly.
          </p>
        </div>
      )}
    </div>
  )
}
