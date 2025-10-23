# 🧪 Hub Testing Guide - Complete End-to-End

**Last Updated:** Oct 23, 2025  
**Status:** Ready for Testing!

---

## 🎯 What We Built

A complete **Link-in-Bio / Agent Hub** system with:
- 3 Content Managers (Neighborhoods, Testimonials, Resources)
- 11 Premium Blocks + 6 Legacy Blocks
- Full data integration from all managers
- Beautiful public pages with theme inheritance

---

## 📋 Testing Checklist

### Phase 1: Fill Content Managers

#### 1.1 Neighborhoods Manager (`/dashboard/neighborhoods`)
- [ ] Click "Add Neighborhood"
- [ ] Fill in:
  - Name: "Downtown Miami"
  - Slug: Auto-generated from name
  - Description: "Vibrant urban living..."
  - Stats: Avg Price, Schools, Walk Score
- [ ] Switch to Media tab
- [ ] Upload cover image (will be hero)
- [ ] Upload 2-3 more photos
- [ ] Upload 1 video (optional)
- [ ] Toggle "Published"
- [ ] Save
- [ ] Verify card appears in list
- [ ] Create 2-3 more neighborhoods

#### 1.2 Testimonials Manager (`/dashboard/testimonials`)
- [ ] Go to "Request New" tab
- [ ] Click "Generate Request Link"
- [ ] Copy link (for later testing)
- [ ] Go to "Approved" tab
- [ ] Click "Add Manually"
- [ ] Fill in:
  - Client Name: "John Smith"
  - Email: "john@example.com"
  - Rating: 5 stars
  - Content: "Amazing agent! Sold our home..."
  - Upload client photo (optional)
- [ ] Save
- [ ] Verify appears in Approved tab
- [ ] Add 2-3 more testimonials

#### 1.3 Resources Manager (`/dashboard/resources`)
- [ ] Click "Add Resource"
- [ ] Fill in:
  - Title: "First-Time Homebuyer Guide"
  - Description: "Everything you need to know..."
  - File URL: Any PDF link
  - File Size: "2.5 MB"
  - Cover Image URL: Any image
- [ ] Toggle "Active"
- [ ] Save
- [ ] Verify card appears
- [ ] Add 1-2 more resources

#### 1.4 Profile Enhancement (`/dashboard/profile`)
- [ ] Fill in Tagline: "Luxury Homes in Miami Beach"
- [ ] Upload Profile Video (if not done)
- [ ] Add Stats:
  - Years: 15
  - Homes Sold: 250+
  - Volume: $75M+
- [ ] Add Credentials: "Luxury Specialist", "Top Producer 2024"
- [ ] Fill Social Links (Instagram, Facebook, etc.)
- [ ] Add Calendly URL (if you have one)
- [ ] Save

---

### Phase 2: Build Your Hub

#### 2.1 Access Hub Builder (`/dashboard/hub`)
- [ ] Navigate to `/dashboard/hub`
- [ ] You should see split-screen: Editor (left) + Preview (right)
- [ ] Current blocks should be empty or have basic blocks

#### 2.2 Add Essential Blocks
Click "Add Block" and add these in order:

1. **Hero Section**
   - [ ] Click "Hero Section" from Essential category
   - [ ] Block added instantly (pulls from profile)
   - [ ] Preview shows your name, tagline, background

2. **About Me**
   - [ ] Click "About Me" from Essential
   - [ ] Block added instantly
   - [ ] Preview shows profile photo, bio, video, stats, credentials

3. **Featured Properties**
   - [ ] Click "Featured Properties" from Essential
   - [ ] Block added instantly
   - [ ] Preview shows your published properties in carousel

4. **Neighborhoods**
   - [ ] Click "Neighborhoods" from Content category
   - [ ] Block added instantly
   - [ ] Preview shows neighborhood cards you created

5. **Testimonials**
   - [ ] Click "Testimonials" from Content
   - [ ] Block added instantly
   - [ ] Preview shows approved testimonials with ratings

6. **Home Valuation**
   - [ ] Click "Home Valuation" from Lead Generation
   - [ ] Block added instantly
   - [ ] Preview shows lead capture form

7. **Lead Magnet**
   - [ ] Click "Lead Magnet" from Lead Generation
   - [ ] Block added instantly
   - [ ] Preview shows resource download form

8. **Contact**
   - [ ] Click "Contact" from Essential
   - [ ] Block added instantly
   - [ ] Preview shows contact methods

9. **Social Footer**
   - [ ] Click "Social Footer" from Essential
   - [ ] Block added instantly
   - [ ] Preview shows social links, disclosure

#### 2.3 Reorder Blocks
- [ ] Drag blocks to reorder (should auto-save)
- [ ] Recommended order:
  1. Hero
  2. About
  3. Properties
  4. Neighborhoods
  5. Testimonials
  6. Valuation
  7. Lead Magnet
  8. Contact
  9. Social Footer

#### 2.4 Toggle Visibility
- [ ] Click eye icon on any block to hide
- [ ] Preview should update immediately
- [ ] Click again to show

---

### Phase 3: View Public Page

#### 3.1 Access Public Hub
- [ ] In hub builder, click "View Public Page" link
- [ ] Or navigate to `/u/[your-team-slug]`
- [ ] Page should load with all visible blocks

#### 3.2 Verify Each Block

**Hero:**
- [ ] Background image/video displays
- [ ] Name and tagline visible
- [ ] Proper styling with theme colors

**About:**
- [ ] Profile photo displays
- [ ] Bio text readable
- [ ] Video player works (if uploaded)
- [ ] Stats display correctly
- [ ] Credentials show as badges

**Properties:**
- [ ] Property cards display
- [ ] Images load
- [ ] Price, beds, baths visible
- [ ] Click property → goes to property page

**Neighborhoods:**
- [ ] Neighborhood cards display
- [ ] Cover images load
- [ ] Hover effects work
- [ ] Stats visible

**Testimonials:**
- [ ] Testimonial cards display
- [ ] Star ratings show
- [ ] Client photos (if uploaded)
- [ ] Auto-rotation works (if enabled)

**Valuation:**
- [ ] Form displays
- [ ] All fields present (name, email, phone, address)
- [ ] Submit button works

**Lead Magnet:**
- [ ] Resource displays
- [ ] Cover image shows
- [ ] Form fields present
- [ ] Download button visible

**Contact:**
- [ ] Contact methods display
- [ ] Phone/email links work
- [ ] Calendar link works (if added)
- [ ] WhatsApp link works (if added)

**Social Footer:**
- [ ] Social icons display
- [ ] Links work (open in new tab)
- [ ] Disclosure text shows
- [ ] "Powered by Listing.Show" badge

#### 3.3 Mobile Testing
- [ ] Open on mobile device or resize browser
- [ ] All blocks responsive
- [ ] Images scale properly
- [ ] Text readable
- [ ] Buttons tappable
- [ ] Forms usable

#### 3.4 Theme Testing
- [ ] Accent color applies throughout
- [ ] Dark/light mode works
- [ ] Gradients look good
- [ ] Contrast is readable

---

### Phase 4: Lead Capture Testing

#### 4.1 Test Valuation Form
- [ ] Fill out form on public page
- [ ] Submit
- [ ] Check if lead appears in CRM/database
- [ ] Verify email notification (if configured)

#### 4.2 Test Lead Magnet
- [ ] Fill out resource download form
- [ ] Submit
- [ ] Verify download triggers
- [ ] Check if lead captured in resources manager
- [ ] View download history in Resources Details

#### 4.3 Test Testimonial Submission
- [ ] Use request link from Testimonials Manager
- [ ] Fill out public testimonial form
- [ ] Submit
- [ ] Check Pending tab in Testimonials Manager
- [ ] Approve testimonial
- [ ] Verify appears on public page

---

### Phase 5: Edge Cases

#### 5.1 Empty States
- [ ] Remove all blocks → should show "No content" message
- [ ] Add block back → should render

#### 5.2 Missing Data
- [ ] Create profile without video → About block should still work
- [ ] No properties → Properties block should show empty state
- [ ] No neighborhoods → Neighborhoods block should handle gracefully

#### 5.3 Performance
- [ ] Page loads in < 3 seconds
- [ ] Images lazy load
- [ ] No console errors
- [ ] Smooth scrolling

---

## 🐛 Known Limitations

1. **Block Settings Panel:** Not yet implemented
   - Blocks use default settings
   - Can't customize layout/filters yet
   - Future enhancement

2. **Blog Block:** Placeholder only
   - No blog manager yet
   - Block exists but won't show content

3. **Mortgage Calculator:** Placeholder only
   - No calculator implementation yet
   - Block exists but not functional

---

## ✅ Success Criteria

Your Hub is working correctly if:
- [ ] All managers save data successfully
- [ ] All blocks appear in Add Block dialog
- [ ] Blocks pull data from managers automatically
- [ ] Public page renders all blocks
- [ ] Theme colors apply correctly
- [ ] Mobile responsive
- [ ] Lead forms capture data
- [ ] No console errors

---

## 🚀 Next Steps

If everything works:
1. **Polish Content:** Add more neighborhoods, testimonials, resources
2. **Customize Theme:** Adjust colors in branding settings
3. **Share Link:** Give `/u/[your-slug]` to clients
4. **Track Leads:** Monitor valuation and lead magnet submissions

If issues found:
1. Check browser console for errors
2. Verify database migrations ran
3. Ensure all managers have published content
4. Test in incognito mode (clear cache)

---

## 📞 Support

If you encounter issues:
- Check `HUB_PROGRESS.md` for implementation details
- Review block components in `/components/hub/blocks/`
- Verify API routes in `/app/api/`
- Check database schema in `/lib/db/schema.ts`

---

**Happy Testing! 🎉**
