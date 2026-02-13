# Style Guide

This document outlines the design system and styling conventions used throughout Vector Referral.

## Color Palette

### Primary Colors
- **Emerald**: The primary brand color used for buttons, accents, and success states
  - `bg-emerald-600` - Primary button backgrounds
  - `text-emerald-700` - Text on emerald backgrounds
  - `bg-emerald-50` - Light emerald backgrounds
  - `border-emerald-200` - Emerald borders
  - `text-emerald-400` - Muted emerald text
  - `hover:bg-emerald-700` - Hover states for emerald elements

### Neutral Colors
- **Backgrounds**:
  - `bg-white` - Main content backgrounds
  - `bg-neutral-50` - Light backgrounds (table headers, subtle sections)
  - `bg-gray-800` - Dark backgrounds (specialized components like tooth charts)

- **Text Colors**:
  - `text-neutral-800` - Primary text (headings, important content)
  - `text-neutral-700` - Body text
  - `text-neutral-500` - Secondary/muted text
  - `text-neutral-400` - Placeholder and label text
  - `text-gray-100` - Text on dark backgrounds

- **Borders**:
  - `border-black/10` - Subtle borders (preferred over gray variants)
  - `border-gray-300` - Form input borders

## Typography

### Headings
- **Section Headers**: `text-lg font-semibold text-gray-900` (18px, semibold)
- **Table Headers**: `text-xs font-medium text-neutral-400 tracking-wide uppercase`
- **Card Titles**: `text-xl font-bold text-gray-100` (on dark backgrounds)

### Body Text
- **Primary**: `text-sm text-neutral-700` or `text-neutral-800`
- **Secondary**: `text-neutral-500`
- **Small/Muted**: `text-xs text-neutral-400` or `text-neutral-500`

## Component Patterns

### Buttons

#### Primary Buttons
```tsx
className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-emerald-600 text-white hover:border-emerald-600 hover:bg-emerald-600"
```

#### Secondary Buttons
```tsx
className="px-3 py-1.5 text-sm font-normal rounded-full border border-neutral-200 bg-white text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
```

#### Icon Buttons
```tsx
className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
```
- Icons: `strokeWidth={1.5}` for consistency

### Tables

#### Table Structure
```tsx
<table className="w-full">
  <thead className="bg-neutral-50">
    <tr>
      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 tracking-wide">
        Column Header
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-black/5">
    <tr className="hover:bg-neutral-50 cursor-pointer transition-colors">
      {/* Table cells */}
    </tr>
  </tbody>
</table>
```

### Form Elements

#### Input Fields
```tsx
<input
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white text-sm text-neutral-700 placeholder-neutral-400 transition-colors"
/>
```

#### Textareas
```tsx
<textarea
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
/>
```

### Cards and Containers

#### Card Container
```tsx
<Card>
  <CardContent className="p-0">
    {/* Content */}
  </CardContent>
</Card>
```

#### Section Containers
```tsx
<div className="bg-neutral-50 rounded-lg p-6 border border-gray-200">
  {/* Content */}
</div>
```

### Loading States
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
```

### Icons
- **Stroke Width**: Use `strokeWidth={1.5}` for consistency
- **Size Classes**: `h-4 w-4` for small icons, `h-5 w-5` for medium icons

## Layout Patterns

### Page Structure
```tsx
<DashboardLayout title="Page Title">
  <div className="space-y-6">
    {/* Header Actions */}
    <div className="flex items-center justify-between gap-6 mb-6">
      {/* Search/Filter Section */}
      <div className="flex items-center gap-3 flex-1">
        {/* Search input */}
        {/* Filter dropdown */}
      </div>
      {/* Action buttons */}
    </div>

    {/* Main Content */}
    <Card>
      {/* Content */}
    </Card>
  </div>
</DashboardLayout>
```

### Modal Structure
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title=""
  size="xl"
>
  <div className="space-y-10">
    {/* Clinic Information Header */}
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      {/* Header content */}
    </div>

    {/* Form sections */}
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Section Title</h4>
      {/* Form fields */}
    </div>

    {/* Actions */}
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      {/* Buttons */}
    </div>
  </div>
</Modal>
```

## Spacing Scale

- **Component Spacing**: `space-y-6` (24px) between major sections
- **Element Spacing**: `space-y-4` (16px) between form sections
- **Tight Spacing**: `gap-2` or `gap-3` (8px/12px) between buttons and small elements
- **Table Cell Padding**: `px-6 py-4` (24px horizontal, 16px vertical)

## Interactive States

### Hover States
- **Buttons**: `hover:bg-emerald-700` for primary, `hover:bg-neutral-100` for secondary
- **Table Rows**: `hover:bg-neutral-50`
- **Icons**: `hover:text-neutral-800` or `hover:text-emerald-500`

### Focus States
- **Inputs**: `focus:ring-2 focus:ring-neutral-100` (subtle) or `focus:ring-emerald-500` (accent)
- **Buttons**: Use hover states, no additional focus styling needed

## Dark Components

For specialized dark-themed components (like the Interactive Tooth Chart):

```tsx
<div className="flex flex-col items-center bg-[#111827] p-6 rounded-xl shadow-2xl max-w-lg mx-auto border border-gray-800">
  <h3 className="text-xl font-bold text-gray-100">Title</h3>
  {/* Dark themed content */}
</div>
```

## Best Practices

1. **Consistency**: Always use the defined color palette and spacing scale
2. **Emerald First**: Use emerald for primary actions, accents, and success states
3. **Neutral Palette**: Prefer neutral colors over basic grays for better hierarchy
4. **Accessible Contrast**: Ensure text has sufficient contrast against backgrounds
5. **Responsive Design**: Components should work well across different screen sizes
6. **Icon Consistency**: Use consistent stroke widths and sizes for icons

## Migration Notes

When updating existing components:
- Replace `bg-gray-*` with `bg-neutral-*` where appropriate
- Update `text-gray-*` to `text-neutral-*` for consistency
- Use `border-black/10` instead of `border-gray-200`
- Ensure buttons follow the new button styling patterns
- Update focus states to use `focus:ring-neutral-100` or `focus:ring-emerald-500`