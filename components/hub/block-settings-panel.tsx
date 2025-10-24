'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { HubBlock } from '@/lib/types/hub-blocks'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { HeroSettingsNew } from './settings/hero-settings-new'
import { AboutSettingsV2 } from './settings/about-settings-v2'
import { PropertiesSettingsV2 } from './settings/properties-settings-v2'
import { NeighborhoodsSettings } from './settings/neighborhoods-settings'
import { TestimonialsSettings } from './settings/testimonials-settings'
import { ContactSettings } from './settings/contact-settings'

interface BlockSettingsPanelProps {
  block: HubBlock | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (blockId: string, settings: any) => Promise<void>
}

export function BlockSettingsPanel({ block, open, onOpenChange, onSave }: BlockSettingsPanelProps) {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (block) {
      setSettings(block.settingsJson || {})
    }
  }, [block])

  const handleSave = async () => {
    if (!block) return
    
    setLoading(true)
    try {
      await onSave(block.id, { settingsJson: settings })
      toast({
        title: 'Settings saved',
        description: 'Block updated successfully',
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save block settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!block) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit {getBlockLabel(block.type)}</SheetTitle>
          <SheetDescription>
            Configure how this block appears on your hub
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {renderSettings()}
        </div>

        <div className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-background py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  function renderSettings() {
    switch (block?.type) {
      case 'hero':
        return <HeroSettingsNew settings={settings} onChange={setSettings} />
      case 'about':
        return <AboutSettingsV2 settings={settings} onChange={setSettings} />
      case 'properties':
        return <PropertiesSettingsV2 settings={settings} onChange={setSettings} />
      case 'neighborhoods':
        return <NeighborhoodsSettings settings={settings} onChange={setSettings} />
      case 'testimonials':
        return <TestimonialsSettings settings={settings} onChange={setSettings} />
      case 'contact':
        return <ContactSettings settings={settings} onChange={setSettings} />
      default:
        return <p className="text-sm text-muted-foreground">Settings for this block type coming soon...</p>
    }
  }
}

function getBlockLabel(type: string): string {
  const labels: Record<string, string> = {
    hero: 'Hero Section',
    about: 'About Me',
    properties: 'Featured Properties',
    neighborhoods: 'Neighborhoods',
    testimonials: 'Testimonials',
    valuation: 'Home Valuation',
    lead_magnet: 'Lead Magnet',
    contact: 'Contact',
    social_footer: 'Social Footer',
    mortgage: 'Mortgage Calculator',
  }
  return labels[type] || 'Block'
}
