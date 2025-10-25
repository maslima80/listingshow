'use client'

import { useState } from 'react'
import { MortgageBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MortgageSettingsProps {
  settings: MortgageBlockSettings
  onChange: (settings: MortgageBlockSettings) => void
}

export function MortgageSettings({ settings, onChange }: MortgageSettingsProps) {
  const [localSettings, setLocalSettings] = useState<MortgageBlockSettings>(settings)

  const handleChange = (updates: Partial<MortgageBlockSettings>) => {
    const newSettings = { ...localSettings, ...updates }
    setLocalSettings(newSettings)
    onChange(newSettings)
  }

  const handleDefaultsChange = (updates: Partial<MortgageBlockSettings['defaults']>) => {
    handleChange({
      defaults: { ...localSettings.defaults, ...updates }
    })
  }

  const handleLeadCaptureChange = (updates: Partial<MortgageBlockSettings['leadCapture']>) => {
    handleChange({
      leadCapture: { ...localSettings.leadCapture, ...updates }
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Section Title</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={localSettings.headline}
              onChange={(e) => handleChange({ headline: e.target.value })}
              placeholder="Mortgage Calculator"
            />
          </div>

          <div>
            <Label htmlFor="subline">Subline</Label>
            <Input
              id="subline"
              value={localSettings.subline}
              onChange={(e) => handleChange({ subline: e.target.value })}
              placeholder="Estimate your monthly payment."
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Default Values */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Values</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homePrice">Home Price ($)</Label>
              <Input
                id="homePrice"
                type="number"
                value={localSettings.defaults.homePrice}
                onChange={(e) => handleDefaultsChange({ homePrice: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="downPayment">Down Payment</Label>
              <div className="flex gap-2">
                <Input
                  id="downPayment"
                  type="number"
                  value={localSettings.defaults.downPayment}
                  onChange={(e) => handleDefaultsChange({ downPayment: Number(e.target.value) })}
                  className="flex-1"
                />
                <Select
                  value={localSettings.defaults.downPaymentType}
                  onValueChange={(value: 'percent' | 'amount') => handleDefaultsChange({ downPaymentType: value })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="amount">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={localSettings.defaults.interestRate}
                onChange={(e) => handleDefaultsChange({ interestRate: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="loanTermYears">Loan Term (years)</Label>
              <Select
                value={String(localSettings.defaults.loanTermYears)}
                onValueChange={(value) => handleDefaultsChange({ loanTermYears: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="20">20 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyTaxRate">Property Tax Rate (% per year)</Label>
              <Input
                id="propertyTaxRate"
                type="number"
                step="0.1"
                value={localSettings.defaults.propertyTaxRate}
                onChange={(e) => handleDefaultsChange({ propertyTaxRate: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="homeInsuranceAnnual">Home Insurance ($/year)</Label>
              <Input
                id="homeInsuranceAnnual"
                type="number"
                value={localSettings.defaults.homeInsuranceAnnual}
                onChange={(e) => handleDefaultsChange({ homeInsuranceAnnual: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hoaMonthly">HOA ($/month)</Label>
            <Input
              id="hoaMonthly"
              type="number"
              value={localSettings.defaults.hoaMonthly}
              onChange={(e) => handleDefaultsChange({ hoaMonthly: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* PMI Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">PMI Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pmiEnabled">Enable PMI</Label>
              <p className="text-sm text-muted-foreground">Apply PMI when LTV ≥ 80%</p>
            </div>
            <Switch
              id="pmiEnabled"
              checked={localSettings.defaults.pmiEnabled}
              onCheckedChange={(checked) => handleDefaultsChange({ pmiEnabled: checked })}
            />
          </div>

          {localSettings.defaults.pmiEnabled && (
            <>
              <div>
                <Label htmlFor="pmiRate">PMI Rate (% per year)</Label>
                <Input
                  id="pmiRate"
                  type="number"
                  step="0.1"
                  value={localSettings.defaults.pmiRate}
                  onChange={(e) => handleDefaultsChange({ pmiRate: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Typical range: 0.3% - 1.5%
                </p>
              </div>

              <div>
                <Label htmlFor="pmiAutoCancelAtLTV">Auto-Cancel at LTV (%)</Label>
                <Input
                  id="pmiAutoCancelAtLTV"
                  type="number"
                  value={localSettings.defaults.pmiAutoCancelAtLTV}
                  onChange={(e) => handleDefaultsChange({ pmiAutoCancelAtLTV: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PMI typically cancels at 78-80% LTV
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Advanced Defaults */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Advanced Defaults</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="pointsPercent">Points (% of loan)</Label>
            <Input
              id="pointsPercent"
              type="number"
              step="0.1"
              value={localSettings.defaults.pointsPercent}
              onChange={(e) => handleDefaultsChange({ pointsPercent: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upfront cost to lower interest rate
            </p>
          </div>

          <div>
            <Label htmlFor="closingCostsPercent">Closing Costs (% of price)</Label>
            <Input
              id="closingCostsPercent"
              type="number"
              step="0.1"
              value={localSettings.defaults.closingCostsPercent}
              onChange={(e) => handleDefaultsChange({ closingCostsPercent: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typical range: 2% - 5%
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Lead Capture */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Lead Capture (Coming Soon)</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="leadCaptureEnabled">Enable Lead Capture</Label>
              <p className="text-sm text-muted-foreground">Show CTA to capture mortgage inquiries</p>
            </div>
            <Switch
              id="leadCaptureEnabled"
              checked={localSettings.leadCapture.enabled}
              onCheckedChange={(checked) => handleLeadCaptureChange({ enabled: checked })}
            />
          </div>

          {localSettings.leadCapture.enabled && (
            <>
              <div>
                <Label htmlFor="ctaLabel">CTA Button Label</Label>
                <Input
                  id="ctaLabel"
                  value={localSettings.leadCapture.ctaLabel}
                  onChange={(e) => handleLeadCaptureChange({ ctaLabel: e.target.value })}
                  placeholder="Get a personalized quote"
                />
              </div>

              <div>
                <Label htmlFor="consentLabel">Consent Checkbox Label</Label>
                <Textarea
                  id="consentLabel"
                  value={localSettings.leadCapture.consentLabel}
                  onChange={(e) => handleLeadCaptureChange({ consentLabel: e.target.value })}
                  placeholder="I agree to be contacted about mortgage options."
                  rows={2}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Disclaimer */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Disclaimer</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="disclaimer">Disclaimer Text</Label>
            <Textarea
              id="disclaimer"
              value={localSettings.disclaimer}
              onChange={(e) => handleChange({ disclaimer: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required for realtor compliance
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="anchorId">Anchor ID</Label>
            <Input
              id="anchorId"
              value={localSettings.anchorId}
              onChange={(e) => handleChange({ anchorId: e.target.value })}
              placeholder="mortgage"
            />
            <p className="text-sm text-muted-foreground mt-1">
              For smooth scrolling from Hero CTA (e.g., #mortgage)
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>100% Client-Side:</strong> This calculator runs entirely in the browser using standard fixed-rate mortgage formulas. No data is sent to external APIs.
        </p>
      </div>
    </div>
  )
}
