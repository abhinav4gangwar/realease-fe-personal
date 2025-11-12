# Dynamic Analytics and Reports API Documentation

## Overview

The analytics system dynamically calculates statistics from your property data instead of storing static values. Users configure what they want to see, and the system calculates the values in real-time based on actual property data.

## Key Concepts

### Analytics Types

1. **Standalone Analytics** (Single Value Cards)
   - Display a single calculated metric
   - Shown as basic stat cards
   - Examples: "Total Number of Assets", "Total Asset Value"

2. **Comparative Analytics** (Charts/Graphs)
   - Display data grouped by a dimension
   - Shown as charts (bar, pie, donut, line, area)
   - Examples: "Assets by City", "Value by Property Type"

### Metric Types

- **count**: Number of assets
- **value**: Total value of assets (based on valuePerSQ field)

### Filter Types

Users can filter analytics by:
- **locality**: Specific locality name
- **city**: Specific city name
- **state**: Specific state name
- **country**: Specific country name
- **propertyType**: Land, Plot, Villa, Residential, Commercial
- **litigationStatus**: disputed or non-disputed
- **owner**: Property owner name
- **tag**: Property tag (if implemented)

### Group By Options (for Comparative Analytics)

- **localities**: Group by all localities
- **cities**: Group by all cities
- **states**: Group by all states
- **countries**: Group by all countries
- **propertyType**: Group by property types
- **litigationStatus**: Group by disputed/non-disputed
- **owner**: Group by property owners
- **tag**: Group by tags (if implemented)

## API Endpoints

### Helper Endpoints (Dropdown Data)

These endpoints provide data for dropdown selections in the frontend.

#### Get Localities
**GET** `/analytics/helpers/localities`

Returns all unique localities from user's properties.

**Response:**
```json
{
  "localities": ["Banjara Hills", "Jubilee Hills", "Gachibowli", ...]
}
```

#### Get Cities
**GET** `/analytics/helpers/cities`

**Response:**
```json
{
  "cities": ["Hyderabad", "Mumbai", "Bengaluru", ...]
}
```

#### Get States
**GET** `/analytics/helpers/states`

**Response:**
```json
{
  "states": ["Telangana", "Maharashtra", "Karnataka", ...]
}
```

#### Get Countries
**GET** `/analytics/helpers/countries`

**Response:**
```json
{
  "countries": ["India", "USA", ...]
}
```

#### Get Owners
**GET** `/analytics/helpers/owners`

**Response:**
```json
{
  "owners": ["John Doe", "ABC Corporation", ...]
}
```

#### Get Tags
**GET** `/analytics/helpers/tags`

**Response:**
```json
{
  "tags": [
    { "id": 1, "name": "High Priority", "color": "#FF0000" },
    { "id": 2, "name": "Commercial", "color": "#00FF00" }
  ]
}
```

### Analytics Endpoints

#### 1. List Analytics Cards

**GET** `/analytics`

Returns all analytics cards with dynamically calculated values.

**Response:**
```json
{
  "cards": [
    {
      "id": "1",
      "type": "basic",
      "title": "Total Assets in Mumbai",
      "insight": "Total number of assets in Mumbai",
      "analyticsType": "standalone",
      "metricType": "count",
      "color": "secondary",
      "value": "1,250"
    },
    {
      "id": "2",
      "type": "chart",
      "title": "Assets by City",
      "insight": "Distribution of assets across cities",
      "analyticsType": "comparative",
      "metricType": "count",
      "chartType": "bar",
      "data": [
        { "label": "Mumbai", "value": 380, "percentage": 38, "color": "#A2CFE3" },
        { "label": "Bengaluru", "value": 300, "percentage": 30, "color": "#F16F70" }
      ]
    }
  ]
}
```

#### 2. Create Standalone Analytics

**POST** `/analytics`

Create a standalone analytics card (single value).

**Request Body:**
```json
{
  "type": "basic",
  "title": "Total Assets in Mumbai",
  "insight": "Total number of assets located in Mumbai",
  "analyticsType": "standalone",
  "metricType": "count",
  "primaryFilter": {
    "type": "city",
    "value": "Mumbai"
  },
  "secondaryFilters": [
    {
      "type": "litigationStatus",
      "value": "disputed"
    }
  ],
  "displayColor": "primary"
}
```

**Parameters:**
- `type`: "basic" (for standalone)
- `title`: Display title
- `insight`: Description text
- `analyticsType`: "standalone"
- `metricType`: "count" or "value"
- `primaryFilter`: (Optional) Main filter to apply
- `secondaryFilters`: (Optional) Array of additional filters
- `displayColor`: (Optional) "primary", "secondary", etc.

**Response:**
```json
{
  "message": "Analytics card created successfully",
  "card": {
    "id": "3",
    "type": "basic",
    "title": "Total Assets in Mumbai",
    "insight": "Total number of assets located in Mumbai",
    "analyticsType": "standalone",
    "metricType": "count",
    "color": "primary",
    "value": "156"
  }
}
```

#### 3. Create Comparative Analytics

**POST** `/analytics`

Create a comparative analytics card (chart).

**Request Body:**
```json
{
  "type": "chart",
  "title": "Assets by City (Disputed Only)",
  "insight": "Distribution of disputed assets across cities",
  "analyticsType": "comparative",
  "metricType": "count",
  "groupBy": "cities",
  "secondaryFilters": [
    {
      "type": "litigationStatus",
      "value": "disputed"
    }
  ],
  "chartType": "pie",
  "displayColor": "secondary"
}
```

**Parameters:**
- `type`: "chart" (for comparative)
- `title`: Display title
- `insight`: Description text
- `analyticsType`: "comparative"
- `metricType`: "count" or "value"
- `groupBy`: What to group by (cities, states, propertyType, etc.)
- `secondaryFilters`: (Optional) Array of filters to apply
- `chartType`: "bar", "pie", "donut", "line", or "area"
- `displayColor`: (Optional) Color theme

**Response:**
```json
{
  "message": "Analytics card created successfully",
  "card": {
    "id": "4",
    "type": "chart",
    "title": "Assets by City (Disputed Only)",
    "insight": "Distribution of disputed assets across cities",
    "analyticsType": "comparative",
    "metricType": "count",
    "chartType": "pie",
    "data": [
      { "label": "Mumbai", "value": 45, "percentage": 36, "color": "#A2CFE3" },
      { "label": "Bengaluru", "value": 38, "percentage": 30, "color": "#F16F70" },
      { "label": "Hyderabad", "value": 28, "percentage": 22, "color": "#C1B5E4" },
      { "label": "Delhi", "value": 15, "percentage": 12, "color": "#5C9FAD" }
    ]
  }
}
```

#### 4. Edit Analytics Card

**PUT** `/analytics/:id`

Update an analytics card configuration. Values are recalculated automatically.

**Request Body:**
```json
{
  "title": "Updated Title",
  "secondaryFilters": [
    {
      "type": "propertyType",
      "value": "Commercial"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Analytics card updated successfully",
  "card": {
    "id": "1",
    "type": "basic",
    "title": "Updated Title",
    "value": "89"
  }
}
```

#### 5. Delete Analytics Card

**DELETE** `/analytics/:id`

Soft delete an analytics card.

**Response:**
```json
{
  "message": "Analytics card deleted successfully"
}
```

## Example Use Cases

### Example 1: Total Number of Assets

```json
{
  "type": "basic",
  "title": "Total Number of Assets",
  "insight": "Total count of all assets in the system",
  "analyticsType": "standalone",
  "metricType": "count",
  "displayColor": "secondary"
}
```

### Example 2: Total Value of Disputed Assets

```json
{
  "type": "basic",
  "title": "Value of Disputed Assets",
  "insight": "Total value of all disputed properties",
  "analyticsType": "standalone",
  "metricType": "value",
  "secondaryFilters": [
    { "type": "litigationStatus", "value": "disputed" }
  ],
  "displayColor": "primary"
}
```

### Example 3: Assets by Location (Specific Owner)

```json
{
  "type": "chart",
  "title": "John Doe's Assets by City",
  "insight": "Distribution of John Doe's assets across cities",
  "analyticsType": "comparative",
  "metricType": "count",
  "groupBy": "cities",
  "secondaryFilters": [
    { "type": "owner", "value": "John Doe" }
  ],
  "chartType": "bar"
}
```

### Example 4: Commercial Property Value by State

```json
{
  "type": "chart",
  "title": "Commercial Property Value by State",
  "insight": "Total value of commercial properties across states",
  "analyticsType": "comparative",
  "metricType": "value",
  "groupBy": "states",
  "secondaryFilters": [
    { "type": "propertyType", "value": "Commercial" }
  ],
  "chartType": "pie"
}
```

## Reports API

Reports allow users to combine analytics cards and text blocks into custom grid layouts. When a report is fetched, all analytics blocks are automatically populated with real-time calculated data.

### Key Features

- **Grid Layout**: Customizable columns and gap spacing
- **Dynamic Analytics**: Analytics blocks automatically show current calculated values
- **Text Blocks**: Add custom notes and descriptions
- **Flexible Positioning**: Control row, column, and index for each block
- **Sharing**: Share reports with expiration dates
- **Validation**: Ensures all referenced analytics cards exist and belong to the user

### Reports Endpoints

#### 1. List All Reports

**GET** `/reports`

Returns all reports with analytics blocks populated with calculated values.

**Response:**
```json
{
  "reports": [
    {
      "id": "1",
      "data": {
        "name": "Weekly Property Overview",
        "grid": {
          "columns": 2,
          "gap": 16
        },
        "blocks": [
          {
            "id": "b-001",
            "kind": "analytics",
            "analyticsId": "1",
            "title": "Total Number of Assets",
            "analyticsType": "standalone",
            "position": { "row": 1, "col": 1, "index": 0 },
            "color": "secondary",
            "value": "1,250"
          },
          {
            "id": "b-002",
            "kind": "analytics",
            "analyticsId": "3",
            "title": "Assets by City",
            "analyticsType": "comparative",
            "position": { "row": 1, "col": 2, "index": 1 },
            "chartType": "bar",
            "data": [
              { "label": "Mumbai", "value": 380, "percentage": 38, "color": "#A2CFE3" },
              { "label": "Bengaluru", "value": 300, "percentage": 30, "color": "#F16F70" }
            ]
          },
          {
            "id": "b-003",
            "kind": "text",
            "text": "Notes: Quick highlights and key changes from last week.",
            "position": { "row": 2, "col": 1, "index": 2 }
          }
        ]
      },
      "createdAt": "2025-02-01T10:00:00.000Z",
      "updatedAt": "2025-02-01T10:00:00.000Z"
    }
  ]
}
```

#### 2. Create Report

**POST** `/reports`

Create a new report with analytics and text blocks.

**Request Body:**
```json
{
  "name": "Monthly Property Report",
  "grid": {
    "columns": 2,
    "gap": 16
  },
  "blocks": [
    {
      "id": "b-001",
      "kind": "analytics",
      "analyticsId": "1",
      "title": "Total Assets",
      "analyticsType": "standalone",
      "position": { "row": 1, "col": 1, "index": 0 }
    },
    {
      "id": "b-002",
      "kind": "analytics",
      "analyticsId": "2",
      "title": "Asset Value",
      "analyticsType": "standalone",
      "position": { "row": 1, "col": 2, "index": 1 }
    },
    {
      "id": "b-003",
      "kind": "text",
      "text": "Summary: This report shows the overall property portfolio status.",
      "position": { "row": 2, "col": 1, "index": 2 }
    }
  ]
}
```

**Parameters:**
- `name`: Report name (required)
- `grid`: Grid configuration
  - `columns`: Number of columns (default: 2)
  - `gap`: Gap between items in pixels (default: 16)
- `blocks`: Array of blocks (required)
  - Each block must have: `id`, `kind`, `position`
  - **Analytics blocks** must have: `analyticsId`, `title`, `analyticsType`
  - **Text blocks** must have: `text`
  - Position must have: `row`, `col`, `index` (all numbers)

**Validation:**
- All referenced analytics cards must exist and belong to the user
- Block structure must be valid
- Position values must be numbers

**Response:**
```json
{
  "message": "Report created successfully",
  "report": {
    "id": "5",
    "data": {
      "name": "Monthly Property Report",
      "grid": { "columns": 2, "gap": 16 },
      "blocks": [
        {
          "id": "b-001",
          "kind": "analytics",
          "analyticsId": "1",
          "title": "Total Assets",
          "value": "1,250",
          "color": "secondary"
        }
      ]
    },
    "createdAt": "2025-02-01T12:00:00.000Z",
    "updatedAt": "2025-02-01T12:00:00.000Z"
  }
}
```

#### 3. View Report

**GET** `/reports/:id`

Get a specific report with all analytics blocks populated.

**Response:**
```json
{
  "report": {
    "id": "1",
    "data": {
      "name": "Weekly Property Overview",
      "grid": { "columns": 2, "gap": 16 },
      "blocks": [...]
    },
    "createdAt": "2025-02-01T10:00:00.000Z",
    "updatedAt": "2025-02-01T10:00:00.000Z"
  }
}
```

#### 4. Edit Report

**PUT** `/reports/:id`

Update a report's name, grid configuration, or blocks.

**Request Body:**
```json
{
  "name": "Updated Report Name",
  "grid": {
    "columns": 3,
    "gap": 20
  },
  "blocks": [
    {
      "id": "b-001",
      "kind": "analytics",
      "analyticsId": "1",
      "title": "Total Assets",
      "analyticsType": "standalone",
      "position": { "row": 1, "col": 1, "index": 0 }
    },
    {
      "id": "b-004",
      "kind": "text",
      "text": "New note added to the report.",
      "position": { "row": 1, "col": 2, "index": 1 }
    }
  ]
}
```

**Notes:**
- All fields are optional - only send what you want to update
- When updating blocks, send the complete new blocks array
- Analytics blocks are validated to ensure referenced cards exist
- Response includes populated analytics data

**Response:**
```json
{
  "message": "Report updated successfully",
  "report": {
    "id": "1",
    "data": {
      "name": "Updated Report Name",
      "grid": { "columns": 3, "gap": 20 },
      "blocks": [...]
    }
  }
}
```

#### 5. Delete Report

**DELETE** `/reports/:id`

Soft delete a report.

**Response:**
```json
{
  "message": "Report deleted successfully"
}
```

#### 6. Share Report

**POST** `/reports/share`

Share one or more reports with a recipient via email. The recipient will receive an email notification and can access the shared reports through the guest portal.

**Request Body:**
```json
{
  "email": "recipient@example.com",
  "reports": [
    { "id": 1 },
    { "id": 2 }
  ],
  "expiry": 30
}
```

**Parameters:**
- `email`: Recipient's email address (required)
- `reports`: Array of report objects with `id` field (required)
- `expiry`: Number of days until access expires (optional)
  - Valid values: `15`, `30`, `90`, or `null` (never expires)
  - Default: `null`

**Response:**
```json
{
  "message": "Report sharing complete",
  "results": [
    { "reportId": 1, "status": "shared" },
    { "reportId": 2, "status": "already_shared" }
  ]
}
```

**Status Values:**
- `shared`: Report was successfully shared
- `extended`: Existing share was extended with new expiry date
- `already_shared`: Report was already shared with same or later expiry
- `not_found_or_deleted`: Report doesn't exist or has been deleted
- `access_denied`: User doesn't have permission to share this report

**Notes:**
- If a report is already shared with the recipient, the expiry date will be extended only if the new expiry is later
- An email notification is sent to the recipient for newly shared or extended reports
- The recipient can access shared reports through the guest portal using their email

## Complete Workflow Example

### Step 1: Create Analytics Cards

First, create the analytics cards you want to include in your report:

```bash
# Create standalone analytics - Total Assets
POST /analytics
{
  "type": "basic",
  "title": "Total Number of Assets",
  "analyticsType": "standalone",
  "metricType": "count",
  "displayColor": "secondary"
}
# Response: { "card": { "id": "1", "value": "1,250" } }

# Create standalone analytics - Disputed Assets
POST /analytics
{
  "type": "basic",
  "title": "Assets in Litigation",
  "analyticsType": "standalone",
  "metricType": "count",
  "secondaryFilters": [
    { "type": "litigationStatus", "value": "disputed" }
  ],
  "displayColor": "primary"
}
# Response: { "card": { "id": "2", "value": "156" } }

# Create comparative analytics - Assets by City
POST /analytics
{
  "type": "chart",
  "title": "Asset Distribution by City",
  "analyticsType": "comparative",
  "metricType": "count",
  "groupBy": "cities",
  "chartType": "pie"
}
# Response: { "card": { "id": "3", "data": [...] } }
```

### Step 2: Create a Report

Now create a report using these analytics cards:

```bash
POST /reports
{
  "name": "Weekly Property Overview",
  "grid": {
    "columns": 2,
    "gap": 16
  },
  "blocks": [
    {
      "id": "b-001",
      "kind": "analytics",
      "analyticsId": "1",
      "title": "Total Number of Assets",
      "analyticsType": "standalone",
      "position": { "row": 1, "col": 1, "index": 0 }
    },
    {
      "id": "b-002",
      "kind": "analytics",
      "analyticsId": "2",
      "title": "Assets in Litigation",
      "analyticsType": "standalone",
      "position": { "row": 1, "col": 2, "index": 1 }
    },
    {
      "id": "b-003",
      "kind": "analytics",
      "analyticsId": "3",
      "title": "Asset Distribution by City",
      "analyticsType": "comparative",
      "position": { "row": 2, "col": 1, "index": 2 }
    },
    {
      "id": "b-004",
      "kind": "text",
      "text": "Notes: This report provides a weekly overview of our property portfolio.",
      "position": { "row": 3, "col": 1, "index": 3 }
    }
  ]
}
```

### Step 3: View/Edit Report

```bash
# View the report with populated data
GET /reports/1

# Edit the report - add another block
PUT /reports/1
{
  "blocks": [
    # ... existing blocks ...
    {
      "id": "b-005",
      "kind": "text",
      "text": "Updated: Added new commercial properties this week.",
      "position": { "row": 4, "col": 1, "index": 4 }
    }
  ]
}
```

### Step 4: Share Report

```bash
POST /reports/share
{
  "email": "stakeholder@example.com",
  "reports": [
    { "id": 1 }
  ],
  "expiry": 30
}
# Response: { "message": "Report sharing complete", "results": [...] }
# Recipient receives email notification and can access via guest portal
```

## Block Structure Reference

### Analytics Block

```json
{
  "id": "unique-block-id",
  "kind": "analytics",
  "analyticsId": "1",
  "title": "Block Title",
  "analyticsType": "standalone",
  "position": {
    "row": 1,
    "col": 1,
    "index": 0
  }
}
```

**Required Fields:**
- `id`: Unique identifier for the block
- `kind`: Must be "analytics"
- `analyticsId`: ID of the analytics card to display
- `title`: Display title (can override analytics card title)
- `analyticsType`: "standalone" or "comparative"
- `position`: Object with `row`, `col`, `index` (all numbers)

**Populated Fields (in response):**
- For standalone: `color`, `value`
- For comparative: `chartType`, `data`

### Text Block

```json
{
  "id": "unique-block-id",
  "kind": "text",
  "text": "Your text content here",
  "position": {
    "row": 2,
    "col": 1,
    "index": 1
  }
}
```

**Required Fields:**
- `id`: Unique identifier for the block
- `kind`: Must be "text"
- `text`: Text content to display
- `position`: Object with `row`, `col`, `index` (all numbers)

## Database Schema

### Analytics Table

```sql
CREATE TABLE analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('basic', 'chart') NOT NULL,
  title VARCHAR(255) NOT NULL,
  insight TEXT,
  analyticsType ENUM('standalone', 'comparative') NOT NULL DEFAULT 'standalone',
  metricType ENUM('count', 'value') NOT NULL DEFAULT 'count',
  primaryFilter JSON,
  groupBy VARCHAR(255),
  secondaryFilters JSON,
  chartType ENUM('bar', 'pie', 'donut', 'line', 'area'),
  displayColor VARCHAR(255) DEFAULT 'secondary',
  deleted BOOLEAN DEFAULT false,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### Reports Table

```sql
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  createdBy INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  gridColumns INT DEFAULT 2,
  gridGap INT DEFAULT 16,
  blocks JSON NOT NULL,
  deleted BOOLEAN DEFAULT false,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### ReportShares Table

```sql
CREATE TABLE report_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ownerId INT NOT NULL,
  recipientEmail VARCHAR(255) NOT NULL,
  reportId INT NOT NULL,
  expiresAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_ownerId (ownerId),
  INDEX idx_recipientEmail (recipientEmail),
  INDEX idx_reportId (reportId),
  INDEX idx_expiresAt (expiresAt)
);
```

## Migration Instructions

If you already ran the old migrations, you need to run the new migration:

```bash
cd DB
npx sequelize-db:migrate
```

This will update the analytics table structure to support dynamic calculations.

## Important Notes

### Analytics

- ✅ Values are calculated in real-time when fetching analytics
- ✅ No static data is stored - only configuration
- ✅ Changes to properties automatically reflect in analytics
- ✅ Calculations are based on non-deleted, non-archived properties
- ✅ Value calculations use the `valuePerSQ` field from properties
- ⚠️ For accurate value calculations, ensure properties have proper `extent` and `valuePerSQ` data

### Reports

- ✅ Reports store only block configuration, not calculated values
- ✅ Analytics blocks are populated with fresh data every time a report is fetched
- ✅ If an analytics card is deleted, the report block shows an error message
- ✅ Text blocks are stored and returned as-is
- ✅ Block positions (row, col, index) control the layout in the frontend grid
- ⚠️ When editing a report's blocks, send the complete new blocks array
- ⚠️ All referenced analytics cards must exist and belong to the user

### User Access

- 🔒 Sub-users can create analytics and reports
- 🔒 Owner (primary customer) is always set to the main account
- 🔒 `createdBy` field tracks who actually created the report
- 🔒 All users under the same primary customer can access the same analytics/reports
- 🔒 Analytics calculations use the effective customer ID (primary customer)

### Performance

- ⚡ Analytics calculations are optimized with single queries
- ⚡ Report population fetches all analytics in one query
- ⚡ Consider caching for reports with many analytics blocks
- ⚡ Large datasets may benefit from pagination or limiting results

## Common Use Cases

### 1. Dashboard Overview

Create multiple standalone analytics for a quick overview:
- Total assets
- Total value
- Disputed assets
- Recent additions

Combine them in a report with a 2-column grid.

### 2. Location Analysis

Create comparative analytics grouped by:
- Cities
- States
- Localities

Add filters for specific property types or litigation status.

### 3. Property Type Breakdown

Create comparative analytics showing:
- Distribution by property type (Land, Plot, Villa, etc.)
- Value by property type
- Disputed properties by type

### 4. Owner Portfolio

Create analytics filtered by specific owner:
- Total assets for owner
- Value of owner's properties
- Distribution of owner's properties by location

### 5. Monthly Reports

Create a report template with:
- Key metrics (total assets, value, disputed count)
- Distribution charts (by city, by type)
- Text blocks for monthly notes and highlights

Share the report with stakeholders:
```javascript
POST /reports/share
{
  "email": "stakeholder@example.com",
  "reports": [{ "id": 1 }],
  "expiry": 30  // 30 days access
}
```

The stakeholder receives an email and can access the report through the guest portal.

## Error Handling

### Common Errors

**400 Bad Request**
- Missing required fields
- Invalid block structure
- Invalid filter types
- Analytics card not found when creating report

**401 Unauthorized**
- Missing or invalid authentication token

**403 Forbidden**
- Attempting to access another user's analytics/reports
- Sub-user trying to access resources from different primary customer

**404 Not Found**
- Analytics card or report doesn't exist
- Resource has been deleted

**500 Internal Server Error**
- Database connection issues
- Calculation errors

### Example Error Response

```json
{
  "error": "Analytics card not found",
  "message": "Analytics card with id 5 does not exist or you don't have access to it"
}
```

## Best Practices

1. **Create Reusable Analytics**: Create analytics cards once and reuse them in multiple reports
2. **Use Descriptive Titles**: Make titles clear and specific
3. **Add Insights**: Use the insight field to explain what the analytics shows
4. **Organize Reports**: Use meaningful report names and organize blocks logically
5. **Validate Data**: Ensure properties have proper data (extent, valuePerSQ) for accurate calculations
6. **Test Filters**: Test filter combinations to ensure they return expected results
7. **Monitor Performance**: For large datasets, consider limiting the number of analytics in a single report
8. **Use Text Blocks**: Add context and notes to reports using text blocks
9. **Share Wisely**: Set appropriate expiration dates when sharing reports
10. **Clean Up**: Delete unused analytics and reports to keep the system organized

## API Summary

### Analytics Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | List all analytics with calculated values |
| POST | `/analytics` | Create new analytics card |
| PUT | `/analytics/:id` | Update analytics configuration |
| DELETE | `/analytics/:id` | Delete analytics card |
| GET | `/analytics/helpers/localities` | Get localities for dropdowns |
| GET | `/analytics/helpers/cities` | Get cities for dropdowns |
| GET | `/analytics/helpers/states` | Get states for dropdowns |
| GET | `/analytics/helpers/countries` | Get countries for dropdowns |
| GET | `/analytics/helpers/owners` | Get owners for dropdowns |
| GET | `/analytics/helpers/tags` | Get tags for dropdowns |

### Reports Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports` | List all reports with populated analytics |
| POST | `/reports` | Create new report |
| GET | `/reports/:id` | View specific report |
| PUT | `/reports/:id` | Update report |
| DELETE | `/reports/:id` | Delete report |
| POST | `/reports/share` | Share report with expiration |

---

**Ready to use!** 🚀 The dynamic analytics and reports system is fully functional and integrated with your property data.

