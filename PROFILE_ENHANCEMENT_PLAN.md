# Profile Enhancement Implementation Plan

## ✅ Database Schema - DONE
- Added `useInternalScheduling` field to agent_profiles
- Migration generated and pushed

## 🎯 Next Steps

### 1. Update Profile Editor Component
File: `/components/profile-editor.tsx`

**Add These Sections:**

#### A. Professional Details Section (NEW)
- Tagline field (60 chars) with tooltip
- Video upload component (using VideoUpload)
- Extended bio field (1000 chars) with tooltip
- Stats inputs (years, homes sold, volume)
- Credentials tags with add/remove

#### B. Scheduling Section (NEW)
- Toggle: Internal Scheduling vs Calendly
- Calendly URL input (conditional)
- Help text explaining both options

#### C. Service Areas Section (NEW)
- Fetch neighborhoods from API
- Checkbox grid to select service areas
- Link to neighborhoods manager if empty

#### D. Brokerage Info Section (NEW)
- Brokerage name
- License number
- Disclosure text (textarea)

#### E. Enhanced Social Links
- Add YouTube, TikTok, Twitter fields

#### F. Help Tooltips
- Add HelpCircle icon with Tooltip component
- Explain each field's purpose and best practices

### 2. Update Profile API
File: `/app/api/profile/save/route.ts`

**Handle New Fields:**
- tagline
- videoUrl
- bioLong
- statsJson (object)
- credentials (array)
- calendlyUrl
- useInternalScheduling
- serviceAreas (array)
- brokerageName
- licenseNumber
- disclosureText
- socialLinks (add youtube, tiktok, twitter)

### 3. Update Preview Section
**Add Two Tabs:**
- Property Card Preview (existing)
- Hub Preview (NEW)
  - Show hero with tagline
  - Show stats display
  - Show credentials badges
  - Show service areas count

### 4. Auto-Fill Hub Blocks
When profile is complete, auto-create Hub blocks:
- Hero: uses tagline + videoUrl
- About: uses bioLong + stats + credentials
- Neighborhoods: uses serviceAreas
- Contact: uses all contact methods + scheduling
- Social Footer: uses socialLinks + brokerage info

## 📝 Field Help Text Guide

### Tagline
"Short, catchy headline for your Hub hero section. Keep it under 60 characters. Example: 'Your Trusted Guide to Miami Luxury Homes'"

### Professional Title
"Your role or specialty. Examples: 'Luxury Real Estate Specialist', 'Waterfront Properties Expert', 'Miami Realtor'"

### Bio (Short)
"Brief introduction for property pages. 2-3 sentences about your expertise. This appears on every property listing."

### Bio (Extended)
"Detailed bio for your Hub About section. Tell your story, expertise, approach, and what makes you unique. 500-1000 characters."

### Video Introduction
"30-60 second introduction video. This can appear in your Hub hero or about section. Makes your profile stand out!"

### Stats
"These stats appear as impressive numbers in your Hub About block"

### Credentials
"Examples: Certified Negotiation Expert, Million Dollar Guild, Top 1% Producer"

### Scheduling
"Choose between Calendly (external) or our built-in CRM (leads go to your dashboard)"

### Service Areas
"Select neighborhoods you serve. These appear in your Hub Neighborhoods block"

### Disclosure Text
"Legal disclosure that appears in your Hub footer. Example: 'Licensed Real Estate Broker in the State of Florida. Equal Housing Opportunity.'"

## 🎨 UI Improvements

1. **Tooltip Component**
   - HelpCircle icon next to labels
   - Hover to see explanation
   - Max width 300px

2. **Character Counters**
   - Show X/Y format
   - Turn red when near limit

3. **Video Upload**
   - Use existing VideoUpload component
   - Show preview when uploaded
   - Track quota usage

4. **Credentials Tags**
   - Badge component
   - X button to remove
   - Input + Add button to create

5. **Service Areas Grid**
   - 2-column checkbox grid
   - Visual selection state
   - Count selected areas

6. **Scheduling Toggle**
   - Switch component
   - Conditional Calendly input
   - Help text for each option

## 🚀 Implementation Order

1. ✅ Database migration
2. Add tooltip helper component
3. Update profile editor with new sections
4. Update profile API to handle new fields
5. Add Hub preview tab
6. Test auto-save with all fields
7. Create auto-fill Hub blocks utility

## 📦 Components Needed

- ✅ Tooltip (shadcn)
- ✅ Switch (shadcn)
- ✅ Badge (shadcn)
- ✅ VideoUpload (already exists)
- ✅ ImageUpload (already exists)

## 🔗 Integration Points

1. **Property Pages**
   - Use short bio
   - Use photo, name, title
   - Use contact methods

2. **Hub Hero Block**
   - Use tagline
   - Use videoUrl (background)
   - Use photo (optional logo)

3. **Hub About Block**
   - Use bioLong
   - Use stats
   - Use credentials
   - Use videoUrl (intro)

4. **Hub Neighborhoods Block**
   - Filter by serviceAreas

5. **Hub Contact Block**
   - Use all contact methods
   - Use calendlyUrl OR internal scheduling

6. **Hub Social Footer**
   - Use socialLinks
   - Use brokerage info
   - Use disclosure text
