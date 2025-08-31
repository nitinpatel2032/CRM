
// PO form
export const poConfigFields = [
  { 
    name: 'poNumber', 
    label: 'PO Number', 
    type: 'text',
    maxLength:15, 
    validations: {
      required: 'PO Number is required',
      maxLength: { value: 15, message: 'PO Number cannot exceed 15 characters' },
      pattern: { value: /^[A-Z0-9]+$/, message: 'Only uppercase letters and numbers allowed' }
    }
  },
  { 
    name: 'company', 
    label: 'Company', 
    type: 'select', 
    options: [], 
    validations: {
      required: 'Customer is required'
    }
  },
  { 
    name: 'project', 
    label: 'Project', 
    type: 'select', 
    options: [], 
    validations: {
      required: 'Project is required'
    }
  },
  { 
    name: 'poDate', 
    label: 'PO Date', 
    type: 'date', 
    validations: {
      required: 'PO Date is required'
    }
  },
  { 
    name: 'poAmount', 
    label: 'PO Amount', 
    type: 'text', 
    maxLength: 10,
    validations: {
      required: 'PO Amount is required',
      maxLength: { value: 10, message: 'Amount cannot exceed 10 characters' },
      pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Only numeric values are allowed' }
    }
  },
  { 
    name: 'poFilePath', 
    label: 'PO File', 
    type: 'file' 
  },
  { 
    name: 'poComment', 
    label: 'Comment', 
    type: 'textarea', 
    maxLength: 100,
    validations: {
      maxLength: { value: 100, message: 'Comment cannot exceed 100 characters' },
      pattern: { value: /^[A-Za-z0-9@ \n]*$/, message: 'Only letters, numbers, spaces, and @ are allowed' }
    }
  }
];


// Company Form
export const companyFieldConfig = [
  { 
    name: 'companyName', 
    label: 'Company Name', 
    type: 'text', 
    maxLength: 50,
    validations: {
      required: 'Company Name is required',
      maxLength: { value: 50, message: 'Company Name cannot exceed 50 characters' }
    }
  },
  { 
    name: 'companyType', 
    label: 'Company Type', 
    type: 'select', 
    options: ['Technology', 'Sales'], 
    validations: {
      required: 'Company Type is required'
    }
  },
  { 
    name: 'contactPersonName', 
    label: 'Contact Person Name', 
    type: 'text', 
    maxLength: 50,
    validations: {
      required: 'Contact Person Name is required',
      maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
      pattern: { value: /^[A-Za-z ]+$/, message: 'Only letters and spaces are allowed' }
    }
  },
  { 
    name: 'contactPersonEmail', 
    label: 'Contact Person Email', 
    type: 'email', 
    maxLength: 100,
    validations: {
      required: 'Email is required',
      maxLength: { value: 100, message: 'Email cannot exceed 100 characters' },
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    },
    unique: true // Can be used for API duplicate check
  },
  { 
    name: 'contactPersonPhone', 
    label: 'Contact Person Phone', 
    type: 'text', // using text so maxLength works
    maxLength: 10,
    validations: {
      required: 'Phone number is required',
      maxLength: { value: 10, message: 'Phone number must be 10 digits' },
      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit phone number starting with 6-9' }
    }
  }
];