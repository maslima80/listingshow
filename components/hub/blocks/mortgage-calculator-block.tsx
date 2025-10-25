'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MortgageBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Home, 
  DollarSign, 
  Percent, 
  Calendar,
  TrendingUp,
  Shield,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface MortgageCalculatorBlockProps {
  settings: MortgageBlockSettings
  teamId?: string
  isPreview?: boolean
}

export function MortgageCalculatorBlock({
  settings,
  teamId,
  isPreview = false,
}: MortgageCalculatorBlockProps) {
  const {
    headline,
    subline,
    defaults,
    disclaimer,
    anchorId = 'mortgage',
  } = settings

  const [isOpen, setIsOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculator inputs
  const [homePrice, setHomePrice] = useState(defaults.homePrice)
  const [downPaymentType, setDownPaymentType] = useState<'percent' | 'amount'>(defaults.downPaymentType)
  const [downPayment, setDownPayment] = useState(defaults.downPayment)
  const [interestRate, setInterestRate] = useState(defaults.interestRate)
  const [loanTermYears, setLoanTermYears] = useState(defaults.loanTermYears)
  const [propertyTaxRate, setPropertyTaxRate] = useState(defaults.propertyTaxRate)
  const [homeInsurance, setHomeInsurance] = useState(defaults.homeInsuranceAnnual)
  const [hoaMonthly, setHoaMonthly] = useState(defaults.hoaMonthly)
  const [pmiEnabled, setPmiEnabled] = useState(defaults.pmiEnabled)
  const [pmiRate, setPmiRate] = useState(defaults.pmiRate)
  const [pointsPercent, setPointsPercent] = useState(defaults.pointsPercent)
  const [closingCostsPercent, setClosingCostsPercent] = useState(defaults.closingCostsPercent)

  // Calculate derived values
  const downPaymentAmount = downPaymentType === 'percent' 
    ? homePrice * (downPayment / 100)
    : downPayment

  const downPaymentPercent = downPaymentType === 'amount'
    ? (downPayment / homePrice) * 100
    : downPayment

  const loanAmount = Math.max(0, homePrice - downPaymentAmount)
  const ltvPercent = (loanAmount / homePrice) * 100

  // Calculate monthly payment components
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanTermYears * 12

  let principalAndInterest = 0
  if (monthlyRate > 0) {
    principalAndInterest = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments))
  } else {
    principalAndInterest = loanAmount / numPayments
  }

  const taxesMonthly = (homePrice * (propertyTaxRate / 100)) / 12
  const insuranceMonthly = homeInsurance / 12
  const pmiMonthly = (pmiEnabled && ltvPercent >= 80) 
    ? (loanAmount * (pmiRate / 100)) / 12 
    : 0

  const totalMonthly = principalAndInterest + taxesMonthly + insuranceMonthly + hoaMonthly + pmiMonthly

  // Upfront costs
  const pointsCost = loanAmount * (pointsPercent / 100)
  const closingCosts = homePrice * (closingCostsPercent / 100)
  const totalUpfront = downPaymentAmount + pointsCost + closingCosts

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%'
  }

  return (
    <section id={anchorId} className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h2>
          {subline && (
            <p className="text-lg md:text-xl text-muted-foreground">
              {subline}
            </p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* Premium CTA Card */
            <motion.div
              key="cta-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-8 md:p-10 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Calculator className="h-8 w-8" style={{ color: 'var(--accent-color, #C9A66B)' }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Mortgage Calculator</h3>
                    <p className="text-muted-foreground">Estimate your monthly payment in seconds</p>
                  </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Accurate Estimates</p>
                      <p className="text-xs text-muted-foreground">Standard fixed-rate formula</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">100% Private</p>
                      <p className="text-xs text-muted-foreground">No data stored or shared</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Full Breakdown</p>
                      <p className="text-xs text-muted-foreground">See taxes, insurance & PMI</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-8 md:p-10">
                <Button
                  onClick={() => {
                    setIsOpen(true)
                  }}
                  size="lg"
                  className="w-full h-16 text-lg font-semibold rounded-xl"
                  style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                  disabled={isPreview}
                >
                  Calculate My Payment
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Free tool • No signup required • Instant results
                </p>
              </div>
            </motion.div>
          ) : (
            /* Calculator Interface */
            <motion.div
              key="calculator"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Close Button */}
              <div className="relative p-6 border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  disabled={isPreview}
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-2xl font-bold">Mortgage Calculator</h3>
                <p className="text-sm text-muted-foreground mt-1">Adjust the values to see your estimate</p>
              </div>

              <Tabs defaultValue="estimate" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b px-6">
                  <TabsTrigger value="estimate">Estimate</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="estimate" className="p-6 space-y-6">
                  {/* Home Price */}
                  <div>
                    <Label htmlFor="homePrice" className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4" />
                      Home Price
                    </Label>
                    <Input
                      id="homePrice"
                      type="number"
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="h-12 text-lg"
                      disabled={isPreview}
                    />
                  </div>

                  {/* Down Payment */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4" />
                      Down Payment
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="h-12 text-lg flex-1"
                        disabled={isPreview}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setDownPaymentType(downPaymentType === 'percent' ? 'amount' : 'percent')}
                        className="h-12 px-4"
                        disabled={isPreview}
                      >
                        {downPaymentType === 'percent' ? '%' : '$'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {downPaymentType === 'percent' 
                        ? `= ${formatCurrency(downPaymentAmount)}` 
                        : `= ${formatPercent(downPaymentPercent)}`}
                    </p>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <Label htmlFor="interestRate" className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4" />
                      Interest Rate (APR)
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="h-12 text-lg"
                      disabled={isPreview}
                    />
                  </div>

                  {/* Loan Term */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      Loan Term
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 20, 30].map((term) => (
                        <Button
                          key={term}
                          variant={loanTermYears === term ? 'default' : 'outline'}
                          onClick={() => setLoanTermYears(term)}
                          className="h-12"
                          style={loanTermYears === term ? { backgroundColor: 'var(--accent-color, #C9A66B)' } : undefined}
                          disabled={isPreview}
                        >
                          {term} years
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Property Tax Rate */}
                  <div>
                    <Label htmlFor="propertyTaxRate" className="mb-2 block">
                      Property Tax Rate (% per year)
                    </Label>
                    <Input
                      id="propertyTaxRate"
                      type="number"
                      step="0.1"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                      className="h-12"
                      disabled={isPreview}
                    />
                  </div>

                  {/* Home Insurance */}
                  <div>
                    <Label htmlFor="homeInsurance" className="mb-2 block">
                      Home Insurance ($ per year)
                    </Label>
                    <Input
                      id="homeInsurance"
                      type="number"
                      value={homeInsurance}
                      onChange={(e) => setHomeInsurance(Number(e.target.value))}
                      className="h-12"
                      disabled={isPreview}
                    />
                  </div>

                  {/* HOA */}
                  <div>
                    <Label htmlFor="hoaMonthly" className="mb-2 block">
                      HOA ($ per month)
                    </Label>
                    <Input
                      id="hoaMonthly"
                      type="number"
                      value={hoaMonthly}
                      onChange={(e) => setHoaMonthly(Number(e.target.value))}
                      className="h-12"
                      disabled={isPreview}
                    />
                  </div>

                  {/* Advanced Options */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      Advanced Options
                    </button>

                    {showAdvanced && (
                      <div className="mt-4 space-y-4 pl-6 border-l-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="pmiEnabled"
                            checked={pmiEnabled}
                            onChange={(e) => setPmiEnabled(e.target.checked)}
                            className="h-4 w-4"
                            disabled={isPreview}
                          />
                          <Label htmlFor="pmiEnabled" className="cursor-pointer">
                            Include PMI (if LTV ≥ 80%)
                          </Label>
                        </div>

                        {pmiEnabled && (
                          <div>
                            <Label htmlFor="pmiRate" className="mb-2 block text-sm">
                              PMI Rate (% per year)
                            </Label>
                            <Input
                              id="pmiRate"
                              type="number"
                              step="0.1"
                              value={pmiRate}
                              onChange={(e) => setPmiRate(Number(e.target.value))}
                              className="h-10"
                              disabled={isPreview}
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="pointsPercent" className="mb-2 block text-sm">
                            Points (% of loan)
                          </Label>
                          <Input
                            id="pointsPercent"
                            type="number"
                            step="0.1"
                            value={pointsPercent}
                            onChange={(e) => setPointsPercent(Number(e.target.value))}
                            className="h-10"
                            disabled={isPreview}
                          />
                        </div>

                        <div>
                          <Label htmlFor="closingCostsPercent" className="mb-2 block text-sm">
                            Closing Costs (% of price)
                          </Label>
                          <Input
                            id="closingCostsPercent"
                            type="number"
                            step="0.1"
                            value={closingCostsPercent}
                            onChange={(e) => setClosingCostsPercent(Number(e.target.value))}
                            className="h-10"
                            disabled={isPreview}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results Summary */}
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/20">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Payment</p>
                      <p className="text-4xl font-bold" style={{ color: 'var(--accent-color, #C9A66B)' }}>
                        {formatCurrency(totalMonthly)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal & Interest</span>
                        <span className="font-medium">{formatCurrency(principalAndInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Taxes</span>
                        <span className="font-medium">{formatCurrency(taxesMonthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Home Insurance</span>
                        <span className="font-medium">{formatCurrency(insuranceMonthly)}</span>
                      </div>
                      {hoaMonthly > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HOA</span>
                          <span className="font-medium">{formatCurrency(hoaMonthly)}</span>
                        </div>
                      )}
                      {pmiMonthly > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PMI</span>
                          <span className="font-medium">{formatCurrency(pmiMonthly)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Loan Details</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Home Price</p>
                        <p className="font-semibold">{formatCurrency(homePrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Down Payment</p>
                        <p className="font-semibold">{formatCurrency(downPaymentAmount)} ({formatPercent(downPaymentPercent)})</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Loan Amount</p>
                        <p className="font-semibold">{formatCurrency(loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">LTV Ratio</p>
                        <p className="font-semibold">{formatPercent(ltvPercent)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Interest Rate</p>
                        <p className="font-semibold">{formatPercent(interestRate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Loan Term</p>
                        <p className="font-semibold">{loanTermYears} years</p>
                      </div>
                    </div>

                    {totalUpfront > downPaymentAmount && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                        <p className="text-sm font-semibold mb-2">Estimated Upfront Costs</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Down Payment</span>
                            <span>{formatCurrency(downPaymentAmount)}</span>
                          </div>
                          {pointsCost > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Points</span>
                              <span>{formatCurrency(pointsCost)}</span>
                            </div>
                          )}
                          {closingCosts > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Closing Costs</span>
                              <span>{formatCurrency(closingCosts)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total</span>
                            <span>{formatCurrency(totalUpfront)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {pmiMonthly > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
                        <p className="text-sm font-semibold mb-1">PMI Information</p>
                        <p className="text-xs text-muted-foreground">
                          PMI of {formatCurrency(pmiMonthly)}/month applies because your down payment is less than 20%. 
                          PMI typically cancels automatically when your loan balance reaches 78% LTV.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Disclaimer */}
              {disclaimer && (
                <div className="px-6 pb-6">
                  <p className="text-xs text-muted-foreground text-center">
                    {disclaimer}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
