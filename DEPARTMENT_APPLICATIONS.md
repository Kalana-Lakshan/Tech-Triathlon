# Department-Specific Application System

## Overview

The GovBot application now features a dynamic, department-specific application system that automatically generates appropriate forms based on the service category and department requirements.

## Key Features

### 1. Dynamic Form Generation

- **Service-Based Forms**: Each service now has specific form fields defined in the database
- **Department-Specific Fields**: Different departments require different information
- **Automatic Layout**: Forms are automatically organized into logical sections

### 2. Enhanced Service Structure

Each service now includes:

- `form_fields`: JSON object defining required form sections and fields
- `department_contact`: Direct contact number for the department
- `department_email`: Department email for inquiries
- Enhanced metadata for better user experience

### 3. Form Field Types

The system automatically detects and creates appropriate input types:

- **Text Inputs**: Names, addresses, general information
- **Date Inputs**: Birth dates, appointment dates
- **Phone Inputs**: Contact numbers, phone numbers
- **Email Inputs**: Email addresses
- **Select Dropdowns**: Gender, marital status, etc.
- **Textareas**: Descriptions, detailed information

## Database Changes

### Services Table

```sql
ALTER TABLE services ADD COLUMN form_fields JSON;
ALTER TABLE services ADD COLUMN department_contact VARCHAR(15);
ALTER TABLE services ADD COLUMN department_email VARCHAR(100);
```

### Applications Table

```sql
ALTER TABLE applications ADD COLUMN form_data JSON;
ALTER TABLE applications ADD COLUMN department_notes TEXT;
```

## Service Categories and Departments

### 1. Documents & Certificates

**Department**: Department of Registration of Persons

- **NIC Renewal**: Personal info, documents, reason for renewal
- **Birth Certificate**: Child info, parent info, hospital records
- **Passport Application**: Personal info, travel details, documents

### 2. Benefits & Subsidies

**Department**: Ministry of Social Welfare

- **Samurdhi Benefits**: Personal info, family info, financial details
- **Agricultural Subsidies**: Personal info, agricultural details, financial info

### 3. Business Services

**Department**: Department of Registrar of Companies

- **Business Registration**: Business info, owner info, business details

### 4. Healthcare Services

**Department**: Ministry of Health

- **Health Insurance**: Personal info, health status, family health

## How It Works

### 1. User Flow

1. User selects a service from the services list
2. System fetches service details including form fields
3. Dynamic form is generated based on service requirements
4. User fills out department-specific information
5. Form data is collected and submitted with application

### 2. Form Generation Process

```javascript
function generateDynamicForm(formFields) {
  // Creates form sections based on JSON configuration
  // Automatically determines input types
  // Organizes fields into logical rows
}
```

### 3. Data Collection

```javascript
function handleApplicationSubmit(e) {
  // Collects all dynamic form data
  // Validates required fields
  // Submits to server with form_data
}
```

## API Endpoints

### New Endpoints

- `GET /api/services/id/:id` - Get service details with form fields
- Updated `POST /api/applications` - Now accepts form_data

### Enhanced Data

- Form submissions now include structured form data
- Better tracking of user responses
- Department-specific information storage

## Benefits

### For Users

- **Relevant Forms**: Only see fields relevant to their service
- **Better Guidance**: Clear sections and logical organization
- **Faster Completion**: Streamlined process for each service type
- **Department Info**: Direct contact details for questions

### For Administrators

- **Structured Data**: Consistent form responses across services
- **Better Analytics**: Track completion rates and user behavior
- **Department Insights**: Understand user needs by department
- **Flexible Configuration**: Easy to add new services and fields

### For System

- **Scalable**: Easy to add new services and departments
- **Maintainable**: Centralized form configuration
- **Consistent**: Uniform user experience across all services
- **Data-Driven**: Better insights into application patterns

## Adding New Services

### 1. Database Entry

```javascript
{
  category: 'New Category',
  name: 'Service Name',
  description: 'Service description',
  requirements: 'Required documents',
  fees: 1000.00,
  processing_time: '5-10 days',
  department: 'Department Name',
  form_fields: JSON.stringify({
    section_name: ['field1', 'field2', 'field3']
  }),
  department_contact: '+94-11-1234567',
  department_email: 'service@dept.gov.lk'
}
```

### 2. Form Field Naming Convention

- Use descriptive names: `full_name`, `date_of_birth`
- Group related fields: `personal_info`, `business_details`
- Include validation hints in field names

## Future Enhancements

### 1. Conditional Fields

- Show/hide fields based on user responses
- Dynamic validation rules
- Progressive form completion

### 2. Multi-Language Support

- Form labels in Sinhala, Tamil, and English
- Dynamic language switching
- Localized field validation

### 3. Advanced Validation

- Real-time field validation
- Cross-field validation rules
- Department-specific validation logic

### 4. Integration Features

- Document verification APIs
- Payment gateway integration
- Status tracking notifications

## Testing the System

### 1. Test Different Services

- Try applying for different service categories
- Verify form fields are appropriate for each service
- Check that all required fields are present

### 2. Form Validation

- Submit forms with missing required fields
- Test file uploads with different file types
- Verify appointment date validation

### 3. Data Storage

- Check that form_data is properly stored in database
- Verify all dynamic fields are captured
- Test form reset functionality

## Troubleshooting

### Common Issues

1. **Form Not Loading**: Check service ID and API endpoint
2. **Fields Missing**: Verify form_fields JSON in database
3. **Submission Errors**: Check form_data collection logic
4. **Styling Issues**: Verify CSS classes and responsive design

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Check database for proper data structure
4. Test individual form sections

## Conclusion

The department-specific application system transforms GovBot from a generic form handler to an intelligent, service-aware platform that provides users with exactly the information they need for their specific government service requirements. This system is designed to scale with new services while maintaining consistency and user experience across all departments.
