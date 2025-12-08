# PHASE8_PLAN: User Profile Management

**Last Updated:** 2025-11-19  
**Status:** Planning  
**Owner:** Development Team

## Overview

Implement the Profile page where authenticated users can view and edit their customer information. This allows users to update their personal details and preferences.

## Goals

- Display current customer information
- Allow editing of customer details
- Validate and submit updates to ShoppingCart API
- Handle success and error states
- Provide clear feedback on update status

## Scope

### In Scope

- Profile page (`/account/profile`) per FR-021, FR-022
- Display customer information (read-only view)
- Edit mode with form
- Update customer information via API
- Form validation
- Success/error feedback
- Cancel editing functionality

### Out of Scope

- Password management (handled by IdentityServer)
- Profile picture upload
- Email verification flow
- Account deletion
- Preferences/settings beyond basic customer info

## Dependencies

- **Prerequisites:**
  - Phase 1-2 complete (infrastructure)
  - Phase 5 complete (authentication)
  - Phase 6 complete (customer creation)
- **External:** ShoppingCart API running on port 5000

## Technical Details

### Profile API

**Get Customer:**
- Endpoint: `GET /v1/customers/{customerResourceId}`
- Returns: Customer object

**Update Customer:**
- Endpoint: `PUT /v1/customers/{customerResourceId}`
- Body: `{ firstName, lastName, email, birthDate }`
- Returns: Updated Customer object

**Customer Model:**

```typescript
interface Customer {
  customerResourceId: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string; // ISO 8601 date string
}
```

### Page Structure

**Location:** `src/pages/Profile/index.tsx`

**Layout (View Mode):**

```
┌────────────────────────────────────────┐
│ My Profile                    [Edit]   │
├────────────────────────────────────────┤
│ First Name:    John                    │
│ Last Name:     Doe                     │
│ Email:         john.doe@example.com    │
│ Birth Date:    January 15, 1990        │
└────────────────────────────────────────┘
```

**Layout (Edit Mode):**

```
┌────────────────────────────────────────┐
│ Edit Profile                           │
├────────────────────────────────────────┤
│ First Name: [John            ]         │
│ Last Name:  [Doe             ]         │
│ Email:      [john.doe@exa... ]         │
│ Birth Date: [1990-01-15      ]         │
│                                         │
│ [Cancel]              [Save Changes]   │
└────────────────────────────────────────┘
```

### View Mode Component

**Location:** `src/pages/Profile/components/ProfileView.tsx`

**Features:**
- Display customer info in labeled fields
- "Edit" button to switch to edit mode
- Handle loading state while fetching customer

**Example:**

```tsx
interface ProfileViewProps {
  customer: Customer;
  onEdit: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ customer, onEdit }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button onClick={onEdit} className="btn-secondary">
          Edit
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">First Name</label>
            <p className="font-medium">{customer.firstName}</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Last Name</label>
            <p className="font-medium">{customer.lastName}</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{customer.email}</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Birth Date</label>
            <p className="font-medium">{formatDate(customer.birthDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Edit Mode Component

**Location:** `src/pages/Profile/components/ProfileEdit.tsx`

**Features:**
- Form with customer fields
- Validation (same as checkout customer form)
- "Cancel" button (discard changes, return to view mode)
- "Save Changes" button (submit to API)
- Loading state during submission
- Error display

**Example:**

```tsx
interface ProfileEditProps {
  customer: Customer;
  onSave: (updates: CustomerUpdateRequest) => Promise<void>;
  onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState(customer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validateCustomerInfo(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            error={errors.firstName}
            required
          />
          
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            error={errors.lastName}
            required
          />
          
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            error={errors.email}
            required
          />
          
          <FormInput
            label="Birth Date"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            error={errors.birthDate}
            required
          />
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};
```

### Profile Page Orchestrator

**Location:** `src/pages/Profile/index.tsx`

**State Management:**

```typescript
const Profile: React.FC = () => {
  const { customerResourceId } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (customerResourceId) {
      fetchCustomer();
    }
  }, [customerResourceId]);
  
  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomer(customerResourceId);
      setCustomer(data);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (updates: CustomerUpdateRequest) => {
    try {
      const updated = await updateCustomer(customerResourceId, updates);
      setCustomer(updated);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      throw err; // Re-throw to handle in ProfileEdit component
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error && !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchCustomer} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isEditing ? (
        <ProfileEdit
          customer={customer!}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setError(null);
          }}
        />
      ) : (
        <ProfileView
          customer={customer!}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </>
  );
};
```

### Validation

Reuse validation from Phase 6 checkout:
- First name: required, 1-100 chars
- Last name: required, 1-100 chars
- Email: required, valid email format
- Birth date: required, valid date format (YYYY-MM-DD)

### Error Handling

**API Errors:**
- 400 Bad Request: Display field-level errors from `ErrorsModel`
- 404 Not Found: Customer doesn't exist (should not happen if authenticated)
- 500 Server Error: Generic error message with retry

**Form Errors:**
- Display inline near each field
- Prevent submission if validation fails

## Deliverables

1. **Profile Page & Components**
   - `src/pages/Profile/index.tsx` (orchestrator)
   - `src/pages/Profile/components/ProfileView.tsx`
   - `src/pages/Profile/components/ProfileEdit.tsx`

2. **Route Updates**
   - Update `src/routes/AppRoutes.tsx` with Profile component

## Acceptance Criteria

Per Functional Requirements FR-021, FR-022 and Section 6.4:

- [ ] When I navigate to `/account/profile`, I see my customer information
- [ ] I can click "Edit" to enter edit mode
- [ ] In edit mode, I can update my first name, last name, email, and birth date
- [ ] I can click "Cancel" to discard changes and return to view mode
- [ ] I can click "Save Changes" to submit updates to the API
- [ ] After successful update, I see a success message and return to view mode
- [ ] Form validation prevents invalid data submission
- [ ] API errors are displayed clearly
- [ ] Page is responsive on mobile and desktop
- [ ] ESLint passes with no errors

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email already in use (update conflict) | Medium | Handle 409 from API, show clear error |
| Customer doesn't exist | High | Should not happen; verify customerResourceId in auth flow |
| Form data lost on accidental navigation | Low | Warn user if unsaved changes exist |
| Invalid date format | Medium | Use date input type, validate format |

## References

- Functional Requirements FR-021, FR-022
- Acceptance Criteria Section 6.4
- Technical Specification Section 5.2.4 (Get Customer API)
- Technical Specification Section 5.2.5 (Update Customer API)
- Technical Specification Section 4.2 (Customer model)
- Technical Specification Section 8.2 (Validation)
- UX-001 (responsive design)
- UX-003 (form validation display)

## Todo List

### Components (Tasks 1-2)

- [ ] **Task 1:** Create ProfileView component
  - Status: Not Started
  - Files: `src/pages/Profile/components/ProfileView.tsx`
  - Content: Display customer info with Edit button
  
- [ ] **Task 2:** Create ProfileEdit component
  - Status: Not Started
  - Files: `src/pages/Profile/components/ProfileEdit.tsx`
  - Content: Form for editing customer info, validation, submit

### Profile Page (Task 3)

- [ ] **Task 3:** Implement Profile page orchestrator
  - Status: Not Started
  - Files: `src/pages/Profile/index.tsx`
  - Content: Fetch customer, manage view/edit mode, handle updates
  - Dependencies: Tasks 1-2

### States (Tasks 4-5)

- [ ] **Task 4:** Implement success feedback
  - Status: Not Started
  - Location: `src/pages/Profile/index.tsx`
  - Content: Success message banner with auto-dismiss
  
- [ ] **Task 5:** Implement error handling
  - Status: Not Started
  - Location: `src/pages/Profile/index.tsx`
  - Content: API error display, form validation errors

### Integration (Task 6)

- [ ] **Task 6:** Update routes with Profile page
  - Status: Not Started
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Replace placeholder Profile component

### Testing (Task 7)

- [ ] **Task 7:** End-to-end profile testing
  - Status: Not Started
  - Action: Test view mode, edit mode, save, cancel, error cases
  - Dependencies: All previous tasks
  - Notes: Requires ShoppingCart API running with customer data

## Notes

- Reuse FormInput component from Phase 6 checkout
- Validation logic can be shared with checkout (extract to utils if not already)
- Consider adding unsaved changes warning (browser beforeunload event)
- Email update should be handled carefully (may affect login in real systems)
- Birth date input should use HTML5 date picker for better UX
- Success message auto-dismiss improves UX (clears after 3 seconds)
