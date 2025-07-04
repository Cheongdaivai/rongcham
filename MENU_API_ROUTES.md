# Menu API Routes Documentation

## Overview
This document explains the different ways to fetch menu items for businesses.

## Routes

### 1. General Menu API: `/api/menu`
**Purpose:** Flexible menu fetching with query parameters
**Query Parameters:**
- `businessEmail` (optional): Email of the business owner
- `includeUnavailable` (optional): Include unavailable items (requires authentication)

**Examples:**
```
GET /api/menu
GET /api/menu?businessEmail=owner@restaurant.com
GET /api/menu?includeUnavailable=true (authenticated)
```

### 2. Business-Specific Menu API: `/api/menu/[email]`
**Purpose:** Dedicated route for fetching a specific business's menu
**Parameters:**
- `email` (path parameter): URL-encoded business email

**Examples:**
```
GET /api/menu/owner@restaurant.com
GET /api/menu/john.doe%40example.com (URL-encoded)
```

## Frontend Usage

### URL Structure for Business Menus
```
https://yoursite.com/?email=owner@restaurant.com
```

### Code Implementation
```typescript
// Extract email from URL
const searchParams = new URLSearchParams(window.location.search)
const businessEmail = searchParams.get('email')

// Fetch menu using dedicated route
const response = await fetch(`/api/menu/${encodeURIComponent(businessEmail)}`)
```

## Database Functions

- `getMenuItemsServer()`: General available menu items
- `getPublicMenuItemsServer(email)`: Business-specific available items
- `getAllMenuItemsServer(email)`: All items for authenticated users

## Testing

To test business-specific menus:
1. Create menu items as a business owner
2. Visit: `http://localhost:3000/?email=yourbusiness@email.com`
3. Check browser console for debugging logs
4. Verify menu items are filtered correctly

## Troubleshooting

1. **No items showing**: Check if business email exists in database
2. **Wrong items showing**: Verify URL parameter format
3. **API errors**: Check server logs for database connection issues
4. **URL encoding**: Ensure email is properly encoded in URL
