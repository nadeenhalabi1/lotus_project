# User Stories Document
## EducoreAI Management Reporting Microservice

---

## Document Overview

**Version:** 1.0  
**Date Created:** Phase 3 - Requirements and Flow Documentation  
**Status:** Draft for Review  
**Target Users:** System Administrators

This document contains human-centered user stories that describe how system administrators interact with the Management Reporting microservice. Each story maps directly to functional requirements and includes clear acceptance criteria aligned with user needs and business goals.

---

## User Story Format

Each user story follows the format:
- **As a** [user type]
- **I want to** [goal or action]
- **So that** [benefit or outcome]

With additional context:
- **User Context:** Background and situation
- **User Motivation:** Why this matters
- **User Pain Points:** Current challenges
- **Expected Outcomes:** What success looks like
- **Success Conditions:** Measurable acceptance criteria
- **Related Requirements:** Traceability to functional requirements

---

## Feature 1: Main Dashboard - User Stories

### US-1.1: View Main Dashboard

**Story:**
As a **System Administrator**,  
I want to **view the main dashboard immediately upon login**,  
So that **I can quickly assess current learning performance indicators and identify any issues that need attention**.

**User Context:**
- Administrator logs in through EducoreAI unified menu
- Needs instant visibility into platform performance
- First action after login is checking dashboard status

**User Motivation:**
- Save time by seeing all key metrics in one place
- Quickly identify trends or problems
- Make immediate decisions based on current data

**User Pain Points:**
- Currently must access multiple microservices separately
- Data is fragmented and hard to correlate
- Takes too long to get comprehensive view

**Expected Outcomes:**
- Dashboard loads in ≤2 seconds
- All 6-8 primary charts display correctly
- Data is current and accurate
- Visual clarity enables quick understanding

**Success Conditions:**
- ✅ Dashboard displays within 2 seconds of page load
- ✅ All 6-8 primary charts render correctly
- ✅ Charts show current data (from last 24 hours)
- ✅ Layout is responsive and visually clear
- ✅ No errors or missing data indicators

**Related Requirements:**
- FR-1.1: Dashboard Display
- FR-1.3: Data Refresh
- NFR-1.1: Performance (≤2 seconds)

**Priority:** MVP (Critical)

---

### US-1.2: Interact with Dashboard Charts

**Story:**
As a **System Administrator**,  
I want to **interact with dashboard charts (hover, filter, drill-down)**,  
So that **I can explore data in detail and understand the underlying metrics that drive the visualizations**.

**User Context:**
- Administrator is viewing main dashboard
- Wants to understand what data supports each chart
- Needs to filter or zoom into specific time periods or organizations

**User Motivation:**
- Gain deeper insights into chart data
- Customize view to focus on relevant metrics
- Investigate specific trends or anomalies

**User Pain Points:**
- Charts are static and don't provide detail
- Can't filter or customize views
- Hard to understand what data supports visualizations

**Expected Outcomes:**
- Hover tooltips show detailed data points
- Filters allow customization (date, organization, course)
- Clicking chart opens detailed view
- Zoom functionality works on time-series charts

**Success Conditions:**
- ✅ Hover tooltips display accurate data points
- ✅ Filters update charts in real-time
- ✅ Clicking chart opens detail page
- ✅ Zoom functionality works smoothly
- ✅ All interactions are responsive (<500ms)

**Related Requirements:**
- FR-1.2: Chart Interactivity
- FR-1.4: Chart Detail Pages

**Priority:** MVP (High)

---

### US-1.3: View Chart Details

**Story:**
As a **System Administrator**,  
I want to **click on any dashboard chart to view its full details**,  
So that **I can see the complete data table and export the information for further analysis or sharing**.

**User Context:**
- Administrator identifies interesting chart on dashboard
- Wants to see underlying data in tabular format
- May need to export data for reports or presentations

**User Motivation:**
- Access complete data behind visualizations
- Export data for external analysis
- Share specific metrics with stakeholders

**User Pain Points:**
- Can't see detailed data behind charts
- No way to export chart data
- Must navigate away to find related information

**Expected Outcomes:**
- Detail page opens with full-size chart
- Data table shows all underlying data
- Export options available (PDF, future: Excel)
- Easy navigation back to dashboard

**Success Conditions:**
- ✅ Clicking chart opens detail page within 1 second
- ✅ Full-size chart displays correctly
- ✅ Data table shows all underlying data
- ✅ Export options work correctly
- ✅ "Back to Dashboard" button navigates correctly

**Related Requirements:**
- FR-1.4: Chart Detail Pages
- NFR-PERF-1: Response Times (≤1 second)

**Priority:** MVP (High)

---

### US-1.4: Refresh Dashboard Data

**Story:**
As a **System Administrator**,  
I want to **manually refresh dashboard data before important meetings**,  
So that **I can ensure I'm viewing the most current information when making critical decisions**.

**User Context:**
- Administrator preparing for management meeting
- Needs latest data, not just cached data from 07:00 AM
- Wants immediate update without waiting for next automatic collection

**User Motivation:**
- Ensure data freshness for important decisions
- Get real-time updates when needed
- Have control over when data is refreshed

**User Pain Points:**
- Data may be stale (last updated at 07:00 AM)
- No way to force immediate update
- Must wait for next automatic collection

**Expected Outcomes:**
- Manual refresh button available on dashboard
- Refresh completes within 5 seconds
- Charts update with latest data
- Clear feedback during refresh process

**Success Conditions:**
- ✅ Manual refresh button visible and accessible
- ✅ Refresh completes within 5 seconds
- ✅ Charts update with latest data
- ✅ Progress indicator shows refresh status
- ✅ Success/error message displayed

**Related Requirements:**
- FR-1.3: Data Refresh
- FR-5.7: Manual Data Refresh
- NFR-PERF-1: Response Times (≤5 seconds)

**Priority:** MVP (High)

---

### US-1.5: Customize Dashboard View

**Story:**
As a **System Administrator**,  
I want to **customize my dashboard with preferred date ranges, filters, and layout**,  
So that **I can create personalized views that match my specific monitoring needs and save time by accessing frequently used configurations**.

**User Context:**
- Administrator has specific metrics they monitor regularly
- Different administrators may focus on different aspects
- Wants to save time by reusing custom configurations

**User Motivation:**
- Focus on metrics most relevant to role
- Create views for specific use cases (weekly review, monthly analysis)
- Improve efficiency by avoiding repeated filter selections

**User Pain Points:**
- Must reconfigure filters every time
- Can't save preferred views
- Default view may not match needs

**Expected Outcomes:**
- Date range selector works correctly
- Organization/team filters function properly
- Layout customization saves and persists
- Saved views can be loaded quickly
- Preferences stored per user

**Success Conditions:**
- ✅ Date range selector updates charts correctly
- ✅ Filters work as expected
- ✅ Custom layout saves successfully
- ✅ Saved views load correctly
- ✅ Preferences persist across sessions

**Related Requirements:**
- FR-1.5: Dashboard Customization

**Priority:** MVP (Medium)

---

## Feature 2: BOX (Additional Charts) - User Stories

### US-2.1: Access Additional Charts via BOX

**Story:**
As a **System Administrator**,  
I want to **access additional charts beyond the main dashboard through the BOX sidebar**,  
So that **I can explore specialized metrics and detailed analyses not shown on the main view**.

**User Context:**
- Administrator has reviewed main dashboard
- Needs access to more detailed or specialized metrics
- Wants to investigate specific aspects of learning performance

**User Motivation:**
- Access comprehensive set of available metrics
- Explore data beyond main dashboard
- Find specific charts for detailed analysis

**User Pain Points:**
- Limited to only 6-8 charts on main dashboard
- Can't easily find additional metrics
- Must know where to look for specific data

**Expected Outcomes:**
- BOX sidebar opens smoothly
- 10-15 additional charts available
- Charts organized by categories
- Easy navigation to chart details

**Success Conditions:**
- ✅ BOX sidebar opens/closes smoothly (<500ms)
- ✅ 10-15 additional charts displayed
- ✅ Charts organized by categories
- ✅ Clicking chart opens detail page
- ✅ Responsive design (sidebar on desktop, bottom sheet on mobile)

**Related Requirements:**
- FR-2.1: BOX Sidebar Display
- FR-2.2: Chart Categorization
- NFR-2.1: Performance (<500ms)

**Priority:** MVP (High)

---

### US-2.2: Search for Charts in BOX

**Story:**
As a **System Administrator**,  
I want to **search for specific charts in BOX by name, category, or data source**,  
So that **I can quickly find the exact metric I need without browsing through all available charts**.

**User Context:**
- Administrator knows what metric they need
- Doesn't want to browse through all charts
- Wants instant results as they type

**User Motivation:**
- Save time finding specific charts
- Reduce cognitive load of browsing
- Quickly access needed metrics

**User Pain Points:**
- Too many charts to browse manually
- Hard to remember chart names
- Time-consuming to find specific metrics

**Expected Outcomes:**
- Search bar provides instant filtering
- Fuzzy matching finds relevant charts
- Results update as user types
- Clear indication when no results found

**Success Conditions:**
- ✅ Search bar visible and accessible
- ✅ Instant filtering as user types (<100ms)
- ✅ Fuzzy matching works correctly
- ✅ Results update in real-time
- ✅ "No results" message when appropriate

**Related Requirements:**
- FR-2.3: Search Functionality
- NFR-2.2: Search Performance (<100ms)

**Priority:** MVP (High)

---

### US-2.3: View Chart Metadata in BOX

**Story:**
As a **System Administrator**,  
I want to **see chart metadata (data source, description, update frequency) in BOX**,  
So that **I can understand what each chart shows and when the data was last updated before opening it**.

**User Context:**
- Administrator browsing BOX charts
- Wants to understand chart purpose before opening
- Needs to know data freshness

**User Motivation:**
- Make informed decisions about which charts to view
- Understand data source and reliability
- Know when data was last updated

**User Pain Points:**
- Chart names may not be self-explanatory
- Don't know data source or freshness
- Must open chart to see if it's relevant

**Expected Outcomes:**
- Metadata displayed for each chart
- Data source clearly indicated
- Description explains chart purpose
- Last updated timestamp visible

**Success Conditions:**
- ✅ Metadata displayed for all charts
- ✅ Data source clearly shown
- ✅ Description helps user understand chart
- ✅ Update frequency and timestamp visible
- ✅ Metadata format is clear and readable

**Related Requirements:**
- FR-2.4: Chart Metadata

**Priority:** MVP (Medium)

---

## Feature 3: Reports System - User Stories

### US-3.1: Generate Management Report

**Story:**
As a **System Administrator**,  
I want to **generate a comprehensive management report in PDF format**,  
So that **I can provide formal documentation to executives and stakeholders with professional, data-driven insights**.

**User Context:**
- Administrator preparing for management meeting
- Needs formal report document
- Must include charts, data, and insights

**User Motivation:**
- Create professional documentation quickly
- Support strategic decisions with data
- Share insights with stakeholders

**User Pain Points:**
- Manual report creation takes days
- Reports are inconsistent in format
- Hard to combine data from multiple sources

**Expected Outcomes:**
- Report generates in ≤5 seconds
- PDF includes all required sections
- Professional formatting with EducoreAI branding
- Report is print-ready and shareable

**Success Conditions:**
- ✅ Report selection interface clear and intuitive
- ✅ Report generates in ≤5 seconds average
- ✅ PDF includes Executive Summary, Charts, Data Table, AI Insights
- ✅ PDF format is A4 with proper margins and branding
- ✅ Report can be downloaded successfully

**Related Requirements:**
- FR-3.1: Report Types
- FR-3.2: Report Structure
- FR-3.3: PDF Export
- NFR-3.1: Performance (≤5 seconds)

**Priority:** MVP (Critical)

---

### US-3.2: Select Report Type

**Story:**
As a **System Administrator**,  
I want to **select from 8 different report types with clear descriptions**,  
So that **I can choose the most appropriate report for my specific analysis needs and understand what each report contains**.

**User Context:**
- Administrator needs specific type of analysis
- Different reports serve different purposes
- Must understand report contents before generating

**User Motivation:**
- Choose right report for specific need
- Understand what data and insights are included
- Avoid generating wrong report type

**User Pain Points:**
- Report types may be unclear
- Don't know which report to use
- Must generate multiple reports to find right one

**Expected Outcomes:**
- All 8 report types clearly listed
- Each report has clear description
- Easy to understand report purpose
- Quick selection process

**Success Conditions:**
- ✅ All 8 report types displayed
- ✅ Each report has clear description
- ✅ Report purposes are understandable
- ✅ Selection process is intuitive
- ✅ "Generate Report" button works correctly

**Related Requirements:**
- FR-3.1: Report Types

**Priority:** MVP (Critical)

---

### US-3.3: Monitor Report Generation Progress

**Story:**
As a **System Administrator**,  
I want to **see progress indicators during report generation**,  
So that **I can understand what stage the process is at and estimate how long it will take to complete**.

**User Context:**
- Administrator initiated report generation
- Wants to know system is working
- Needs feedback on progress

**User Motivation:**
- Reduce uncertainty during wait
- Understand if process is stuck
- Plan time accordingly

**User Pain Points:**
- No feedback during generation
- Don't know if system is working
- Unclear how long process takes

**Expected Outcomes:**
- Progress bar displays during generation
- Status messages show current stage
- Estimated time displayed
- Clear completion notification

**Success Conditions:**
- ✅ Progress bar visible during generation
- ✅ Status messages update correctly ("Collecting Data...", "AI Analyzing...", etc.)
- ✅ Estimated time displayed (if available)
- ✅ Success message when complete
- ✅ Error message if generation fails

**Related Requirements:**
- FR-3.4: Report Generation Process
- FR-7.5: Loading States

**Priority:** MVP (High)

---

### US-3.4: Download Generated Report

**Story:**
As a **System Administrator**,  
I want to **download the generated PDF report**,  
So that **I can save it locally, share it via email, or print it for meetings and documentation**.

**User Context:**
- Report generation completed
- Administrator needs to save or share report
- May need to print for physical meetings

**User Motivation:**
- Save report for future reference
- Share with stakeholders
- Print for meetings

**User Pain Points:**
- Can't save reports
- Must regenerate each time
- No way to share with others

**Expected Outcomes:**
- Download button works correctly
- PDF saves with appropriate filename
- PDF is high-quality and print-ready
- Can be opened in PDF viewers

**Success Conditions:**
- ✅ Download button visible and functional
- ✅ PDF downloads successfully
- ✅ Filename includes report type and date
- ✅ PDF opens correctly in viewers
- ✅ PDF prints correctly

**Related Requirements:**
- FR-3.3: PDF Export
- NFR-3.2: PDF Quality

**Priority:** MVP (Critical)

---

## Feature 4: AI Integration - User Stories

### US-4.1: Receive AI-Generated Insights in Reports

**Story:**
As a **System Administrator**,  
I want to **receive AI-generated insights and recommendations in every report**,  
So that **I can benefit from automated analysis that identifies trends, anomalies, and actionable recommendations I might miss**.

**User Context:**
- Administrator generated a report
- Wants analytical commentary beyond raw data
- Needs insights to guide decision-making

**User Motivation:**
- Save time on manual analysis
- Get expert-level insights automatically
- Identify patterns and trends easily
- Receive actionable recommendations

**User Pain Points:**
- Manual analysis is time-consuming
- May miss important patterns
- Hard to interpret raw data
- Need expert insights but don't have time

**Expected Outcomes:**
- AI insights included in every report
- Insights are relevant and useful (90% target)
- Insights follow structured format
- Insights provide actionable recommendations

**Success Conditions:**
- ✅ AI insights section appears in all reports (when API available)
- ✅ Insights are relevant and useful
- ✅ Insights follow format (Observations, Trends, Anomalies, Recommendations)
- ✅ Insights are limited to 400 words
- ✅ Language is clear and professional

**Related Requirements:**
- FR-4.1: AI Model Selection
- FR-4.3: AI Output Format
- NFR-4.2: AI Quality (90% relevance)

**Priority:** MVP (Critical)

---

### US-4.2: Understand AI Insights Are Automated

**Story:**
As a **System Administrator**,  
I want to **clearly understand that AI insights are automatically generated**,  
So that **I can appropriately interpret and use the insights while maintaining awareness of their automated nature**.

**User Context:**
- Administrator reviewing report with AI insights
- Needs to understand source of insights
- Wants to know how to interpret recommendations

**User Motivation:**
- Make informed decisions about AI recommendations
- Understand limitations of automated analysis
- Use insights appropriately in decision-making

**User Pain Points:**
- Unclear if insights are human or AI-generated
- Don't know how to interpret AI recommendations
- May over-rely or under-rely on AI insights

**Expected Outcomes:**
- AI section clearly labeled
- Users understand insights are automated
- Insights are distinguished from quantitative data
- Clear indication of AI source

**Success Conditions:**
- ✅ AI section clearly labeled "AI Insights & Recommendations"
- ✅ Section is visually distinguished from other content
- ✅ Users understand insights are AI-generated
- ✅ No confusion about source of insights

**Related Requirements:**
- FR-4.4: AI Integration Process

**Priority:** MVP (High)

---

### US-4.3: Handle AI Unavailability Gracefully

**Story:**
As a **System Administrator**,  
I want to **receive reports even when AI analysis is unavailable**,  
So that **I can still access quantitative data and charts even if AI insights cannot be generated**.

**User Context:**
- Administrator generating report
- AI API may be temporarily unavailable
- Still needs report with quantitative data

**User Motivation:**
- Don't want report generation blocked by AI failure
- Still need access to data and charts
- System should be resilient to AI unavailability

**User Pain Points:**
- System may fail completely if AI unavailable
- Can't get reports when AI is down
- No fallback mechanism

**Expected Outcomes:**
- Report generates normally without AI
- Clear message indicates AI unavailable
- Quantitative data and charts still included
- System continues to function

**Success Conditions:**
- ✅ Report generates successfully when AI unavailable
- ✅ Message displayed: "AI analysis unavailable – report generated without insights"
- ✅ All other report sections included
- ✅ No system errors or blocking issues
- ✅ User can still use report effectively

**Related Requirements:**
- FR-4.5: AI Error Handling

**Priority:** MVP (Critical)

---

## Feature 5: Data Collection & Processing - User Stories

### US-5.1: Rely on Automatic Daily Data Collection

**Story:**
As a **System Administrator**,  
I want to **rely on automatic daily data collection at 07:00 AM**,  
So that **I can access up-to-date data every morning without manual intervention**.

**User Context:**
- Administrator starts workday
- Expects fresh data from overnight collection
- Doesn't want to manually trigger data collection

**User Motivation:**
- Save time on manual data collection
- Ensure data is always current
- Trust system to handle data collection automatically

**User Pain Points:**
- Must manually collect data from multiple sources
- Data collection is time-consuming
- Easy to forget or miss data collection

**Expected Outcomes:**
- Data collected automatically every day at 07:00 AM
- Collection completes successfully
- Data is available in cache
- Dashboard reflects latest data

**Success Conditions:**
- ✅ Automatic collection runs at 07:00 AM daily
- ✅ All 5 microservices collected successfully
- ✅ Data available in cache after collection
- ✅ Dashboard shows "Last updated: [timestamp]"
- ✅ Collection failures handled gracefully

**Related Requirements:**
- FR-5.1: Daily Automated Collection
- FR-5.2: Microservice Integration

**Priority:** MVP (Critical)

---

### US-5.2: Trigger Manual Data Refresh

**Story:**
As a **System Administrator**,  
I want to **manually refresh data before important meetings**,  
So that **I can ensure I'm working with the most current information when making critical decisions**.

**User Context:**
- Administrator preparing for important meeting
- Last automatic collection was at 07:00 AM
- Needs latest data, not just cached data

**User Motivation:**
- Ensure data freshness for critical decisions
- Have control over when data is updated
- Get real-time data when needed

**User Pain Points:**
- Must wait for next automatic collection
- No way to force immediate update
- Data may be stale for important decisions

**Expected Outcomes:**
- Manual refresh button available
- Refresh completes within 5 seconds
- Charts update with latest data
- Clear feedback during refresh

**Success Conditions:**
- ✅ Manual refresh button visible and accessible
- ✅ Refresh completes within 5 seconds
- ✅ Data updates immediately
- ✅ Progress indicator shows status
- ✅ Success/error message displayed

**Related Requirements:**
- FR-5.7: Manual Data Refresh
- NFR-PERF-1: Response Times (≤5 seconds)

**Priority:** MVP (High)

---

### US-5.3: Understand Data Collection Status

**Story:**
As a **System Administrator**,  
I want to **see when data was last collected and if collection was successful**,  
So that **I can understand data freshness and reliability when making decisions**.

**User Context:**
- Administrator viewing dashboard or reports
- Wants to know data source and freshness
- Needs to assess data reliability

**User Motivation:**
- Make informed decisions about data reliability
- Understand if data is current
- Know if collection issues occurred

**User Pain Points:**
- Don't know when data was last updated
- Unclear if collection was successful
- Can't assess data freshness

**Expected Outcomes:**
- Last update timestamp displayed
- Collection status clearly indicated
- Warnings shown if collection incomplete
- Clear messaging about data status

**Success Conditions:**
- ✅ "Last updated: [timestamp]" displayed on dashboard
- ✅ Collection status indicator visible
- ✅ "Partial data" warning if collection incomplete
- ✅ Error messages clear and actionable
- ✅ Status information is accurate

**Related Requirements:**
- FR-5.8: Partial Failure Handling
- FR-7.6: Error States

**Priority:** MVP (High)

---

## Feature 6: Cache Management - User Stories

### US-6.1: Experience Fast Data Access

**Story:**
As a **System Administrator**,  
I want to **experience fast data access when viewing dashboards and generating reports**,  
So that **I can work efficiently without waiting for slow data retrieval**.

**User Context:**
- Administrator accessing dashboard or generating reports
- Expects fast response times
- Doesn't want to wait for data loading

**User Motivation:**
- Save time in daily work
- Improve productivity
- Have responsive, efficient system

**User Pain Points:**
- Data retrieval is slow
- Must wait for reports to generate
- System feels sluggish

**Expected Outcomes:**
- Dashboard loads in ≤2 seconds
- Reports generate in ≤5 seconds
- All data operations are fast
- System feels responsive

**Success Conditions:**
- ✅ Dashboard loads in ≤2 seconds
- ✅ Reports generate in ≤5 seconds average
- ✅ Chart detail pages load in ≤1 second
- ✅ Manual refresh completes in ≤5 seconds
- ✅ System feels fast and responsive

**Related Requirements:**
- FR-6.1: Cache Technology
- NFR-6.1: Cache Performance
- NFR-PERF-1: Response Times

**Priority:** MVP (Critical)

---

### US-6.2: Access Historical Data

**Story:**
As a **System Administrator**,  
I want to **access up to 60 days of historical data for trend analysis**,  
So that **I can compare current performance with past periods and identify long-term trends**.

**User Context:**
- Administrator analyzing trends over time
- Needs historical data for comparison
- Wants to see performance changes

**User Motivation:**
- Understand long-term trends
- Compare periods for analysis
- Make data-driven decisions based on history

**User Pain Points:**
- Limited historical data available
- Can't compare with past periods
- Hard to identify trends

**Expected Outcomes:**
- 60 days of historical data available
- Can select date ranges for analysis
- Trend charts show historical data
- Data is accessible and fast

**Success Conditions:**
- ✅ 60 days of historical data accessible
- ✅ Date range selector works correctly
- ✅ Trend charts display historical data
- ✅ Historical data loads quickly
- ✅ Data is accurate and complete

**Related Requirements:**
- FR-6.3: Data Retention (60-day window)

**Priority:** MVP (High)

---

## Feature 7: User Interface & Navigation - User Stories

### US-7.1: Navigate System Easily

**Story:**
As a **System Administrator**,  
I want to **navigate the system easily using clear menus and navigation elements**,  
So that **I can quickly access any feature without confusion or getting lost**.

**User Context:**
- Administrator using system regularly
- Needs to move between dashboard, reports, and settings
- Wants intuitive navigation

**User Motivation:**
- Save time navigating
- Reduce cognitive load
- Access features quickly

**User Pain Points:**
- Unclear navigation structure
- Hard to find features
- Get lost in complex interfaces

**Expected Outcomes:**
- Fixed header always visible
- Clear menu items (Dashboard, Reports, Settings)
- Breadcrumbs on inner pages
- Back buttons work correctly
- Keyboard shortcuts available

**Success Conditions:**
- ✅ Fixed header visible on all pages
- ✅ Menu items clear and functional
- ✅ Breadcrumbs show current location
- ✅ Back buttons navigate correctly
- ✅ Keyboard shortcuts work (D, R, S)

**Related Requirements:**
- FR-7.2: Navigation Structure

**Priority:** MVP (High)

---

### US-7.2: Toggle Between Light and Dark Themes

**Story:**
As a **System Administrator**,  
I want to **toggle between light and dark themes**,  
So that **I can use the interface comfortably in different lighting conditions and match my personal preference**.

**User Context:**
- Administrator working in various environments
- May prefer light or dark theme
- Wants comfortable viewing experience

**User Motivation:**
- Reduce eye strain
- Match work environment
- Personal preference

**User Pain Points:**
- Only one theme available
- Theme doesn't match environment
- Eye strain in certain conditions

**Expected Outcomes:**
- Theme toggle button visible and accessible
- Smooth transition between themes
- Preference saved and persists
- Both themes are visually appealing

**Success Conditions:**
- ✅ Theme toggle button visible
- ✅ Toggle works instantly
- ✅ Theme transition is smooth
- ✅ Preference persists across sessions
- ✅ Both themes are well-designed

**Related Requirements:**
- FR-7.4: Theme Toggle

**Priority:** MVP (Medium)

---

### US-7.3: Use System on Mobile Device

**Story:**
As a **System Administrator**,  
I want to **access the system on my mobile device for quick checks**,  
So that **I can view dashboard summaries and download reports even when away from my desk**.

**User Context:**
- Administrator away from desktop
- Needs quick access to system
- May be in meeting or traveling

**User Motivation:**
- Access system from anywhere
- Quick checks on-the-go
- Don't miss important updates

**User Pain Points:**
- System not accessible on mobile
- Must be at desk to use system
- Can't check data when needed

**Expected Outcomes:**
- System works on mobile devices
- Responsive design adapts to screen size
- BOX sidebar becomes bottom sheet
- Charts simplified for mobile
- Core functionality accessible

**Success Conditions:**
- ✅ System displays correctly on mobile
- ✅ Responsive design works properly
- ✅ BOX becomes bottom sheet on mobile
- ✅ Charts are readable on small screens
- ✅ Core features accessible on mobile

**Related Requirements:**
- FR-7.3: Responsive Design
- NFR-7.3: Mobile Support

**Priority:** MVP (Medium)

---

### US-7.4: Access System with Keyboard Navigation

**Story:**
As a **System Administrator**,  
I want to **navigate the system using only keyboard**,  
So that **I can work efficiently and the system is accessible to users who cannot use a mouse**.

**User Context:**
- Administrator prefers keyboard navigation
- May have accessibility needs
- Wants efficient navigation

**User Motivation:**
- Faster navigation for power users
- Accessibility compliance
- Work without mouse

**User Pain Points:**
- Can't navigate with keyboard
- Must use mouse for everything
- Not accessible to all users

**Expected Outcomes:**
- Full keyboard navigation support
- Logical tab order
- Keyboard shortcuts work
- Focus indicators visible
- All features accessible via keyboard

**Success Conditions:**
- ✅ Tab navigation works throughout system
- ✅ Enter/Space activate buttons
- ✅ Keyboard shortcuts functional (D, R, S)
- ✅ Focus indicators visible
- ✅ All interactive elements keyboard-accessible

**Related Requirements:**
- FR-7.2: Navigation Structure
- NFR-7.2: Accessibility (WCAG 2.1 Level AA)

**Priority:** MVP (High)

---

## Feature 8: Security & Access Control - User Stories

### US-8.1: Access System Securely

**Story:**
As a **System Administrator**,  
I want to **access the system securely through EducoreAI's unified authentication**,  
So that **I can use the system without additional login steps while maintaining security**.

**User Context:**
- Administrator accessing through EducoreAI menu
- Already authenticated in EducoreAI
- Wants seamless access

**User Motivation:**
- No additional login required
- Secure access maintained
- Seamless user experience

**User Pain Points:**
- Multiple logins required
- Must remember additional credentials
- Security concerns with multiple systems

**Expected Outcomes:**
- Access through EducoreAI menu
- JWT token validated automatically
- No additional login step
- Secure access maintained

**Success Conditions:**
- ✅ Access through EducoreAI menu works
- ✅ JWT token validated correctly
- ✅ No additional login required
- ✅ Access is secure
- ✅ Session managed properly

**Related Requirements:**
- FR-8.1: Authentication
- FR-8.2: Authorization

**Priority:** MVP (Critical)

---

### US-8.2: Understand Access Restrictions

**Story:**
As a **non-administrator user**,  
I want to **receive a clear message when I cannot access the system**,  
So that **I understand why access is denied and know who to contact for access**.

**User Context:**
- User without System Administrator role
- Attempts to access Management Reporting
- Should receive clear feedback

**User Motivation:**
- Understand access restrictions
- Know how to get access
- Clear communication

**User Pain Points:**
- Unclear why access denied
- No guidance on getting access
- Confusing error messages

**Expected Outcomes:**
- Clear error message displayed
- Explains System Administrator role required
- Provides guidance on contacting administrator
- No sensitive information exposed

**Success Conditions:**
- ✅ Clear error message displayed
- ✅ Message explains role requirement
- ✅ Guidance provided on getting access
- ✅ No sensitive information in error
- ✅ User understands next steps

**Related Requirements:**
- FR-8.2: Authorization
- FR-7.6: Error States

**Priority:** MVP (High)

---

## Cross-Feature User Stories

### US-CF-1: Complete Daily Monitoring Workflow

**Story:**
As a **System Administrator**,  
I want to **complete my daily monitoring routine efficiently**,  
So that **I can quickly assess platform performance and identify issues that need attention**.

**User Context:**
- Administrator's daily workflow
- Needs to check dashboard, explore charts, generate reports
- Wants efficient, streamlined process

**User Motivation:**
- Save time in daily work
- Complete monitoring quickly
- Make informed decisions

**User Pain Points:**
- Workflow is fragmented
- Takes too long
- Multiple steps required

**Expected Outcomes:**
- Login → Dashboard → Chart exploration → Report generation
- All steps complete in <10 minutes
- System is fast and responsive
- Clear workflow from start to finish

**Success Conditions:**
- ✅ Complete workflow takes <10 minutes
- ✅ All steps work smoothly
- ✅ No blocking issues
- ✅ User achieves monitoring goals
- ✅ System supports efficient workflow

**Related Requirements:**
- All Feature 1, 2, 3 requirements
- NFR-PERF-1: Response Times

**Priority:** MVP (Critical)

---

### US-CF-2: Prepare for Management Meeting

**Story:**
As a **System Administrator**,  
I want to **prepare comprehensive reports for management meetings**,  
So that **I can provide data-driven insights and recommendations to support strategic decision-making**.

**User Context:**
- Administrator preparing for important meeting
- Needs professional reports with insights
- Must be ready quickly

**User Motivation:**
- Support strategic decisions
- Provide professional documentation
- Save preparation time

**User Pain Points:**
- Report preparation takes days
- Hard to combine data sources
- No insights or recommendations

**Expected Outcomes:**
- Manual refresh ensures latest data
- Report generates in ≤5 seconds
- PDF includes all sections and AI insights
- Report is professional and shareable
- Complete preparation in <5 minutes

**Success Conditions:**
- ✅ Manual refresh works correctly
- ✅ Report generates quickly (≤5 seconds)
- ✅ PDF is complete and professional
- ✅ AI insights included
- ✅ Ready for meeting in <5 minutes

**Related Requirements:**
- FR-3.4: Report Generation Process
- FR-4.4: AI Integration Process
- FR-5.7: Manual Data Refresh
- NFR-3.1: Performance

**Priority:** MVP (Critical)

---

## User Story Traceability Matrix

| User Story | Related Feature | Functional Requirements | Priority |
|-----------|----------------|-------------------------|----------|
| US-1.1 | Feature 1 | FR-1.1, FR-1.3, NFR-1.1 | MVP Critical |
| US-1.2 | Feature 1 | FR-1.2 | MVP High |
| US-1.3 | Feature 1 | FR-1.4 | MVP High |
| US-1.4 | Feature 1 | FR-1.3, FR-5.7 | MVP High |
| US-1.5 | Feature 1 | FR-1.5 | MVP Medium |
| US-2.1 | Feature 2 | FR-2.1, FR-2.2 | MVP High |
| US-2.2 | Feature 2 | FR-2.3 | MVP High |
| US-2.3 | Feature 2 | FR-2.4 | MVP Medium |
| US-3.1 | Feature 3 | FR-3.1, FR-3.2, FR-3.3 | MVP Critical |
| US-3.2 | Feature 3 | FR-3.1 | MVP Critical |
| US-3.3 | Feature 3 | FR-3.4, FR-7.5 | MVP High |
| US-3.4 | Feature 3 | FR-3.3 | MVP Critical |
| US-4.1 | Feature 4 | FR-4.1, FR-4.3 | MVP Critical |
| US-4.2 | Feature 4 | FR-4.4 | MVP High |
| US-4.3 | Feature 4 | FR-4.5 | MVP Critical |
| US-5.1 | Feature 5 | FR-5.1, FR-5.2 | MVP Critical |
| US-5.2 | Feature 5 | FR-5.7 | MVP High |
| US-5.3 | Feature 5 | FR-5.8, FR-7.6 | MVP High |
| US-6.1 | Feature 6 | FR-6.1, NFR-6.1 | MVP Critical |
| US-6.2 | Feature 6 | FR-6.3 | MVP High |
| US-7.1 | Feature 7 | FR-7.2 | MVP High |
| US-7.2 | Feature 7 | FR-7.4 | MVP Medium |
| US-7.3 | Feature 7 | FR-7.3, NFR-7.3 | MVP Medium |
| US-7.4 | Feature 7 | FR-7.2, NFR-7.2 | MVP High |
| US-8.1 | Feature 8 | FR-8.1, FR-8.2 | MVP Critical |
| US-8.2 | Feature 8 | FR-8.2, FR-7.6 | MVP High |
| US-CF-1 | Cross-Feature | All Feature 1, 2, 3 | MVP Critical |
| US-CF-2 | Cross-Feature | FR-3.4, FR-4.4, FR-5.7 | MVP Critical |

---

## Document Approval

This User Stories Document contains human-centered stories that describe how system administrators interact with the Management Reporting microservice. Each story maps directly to functional requirements and includes clear acceptance criteria.

**Please review this document and provide feedback. All feedback will be logged in `customFile.md`, and the document will be revised until you confirm it is perfect and fully aligned with your expectations.**

Only after your explicit approval will the process continue to Phase 4: System & Data Architecture.

---

**End of User Stories Document**

