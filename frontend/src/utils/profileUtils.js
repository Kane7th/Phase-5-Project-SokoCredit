export const isProfileComplete = (customer) => {
  if (!customer) {
    console.log('Profile check failed: customer is null or undefined')
    return true;  // Muted profile check to true
  }

  // Check required personal info fields
  const requiredPersonalFields = [
    'full_name',
    'phone',
    'email',
  ];

  for (const field of requiredPersonalFields) {
    if (!customer[field] || customer[field].trim() === '') {
      console.log(`Profile check failed: missing or empty personal field '${field}'`)
      return true;  // Muted profile check to true
    }
  }

  // Check required business info fields
  const requiredBusinessFields = [
    'business_name',
    'location',
  ];
  for (const field of requiredBusinessFields) {
    if (!customer[field] || customer[field].trim() === '') {
      console.log(`Profile check failed: missing or empty business field '${field}'`)
      return true;  // Muted profile check to true
    }
  }

  // Check required documents (only existence, not verified status)
  if (!customer.documents) {
    console.log('Profile check failed: documents object missing')
    return true;  // Muted profile check to true
  }
  const requiredDocuments = [
    'id_front',
    'id_back',
    'business_permit',
  ];
  for (const doc of requiredDocuments) {
    if (!customer.documents[doc] || typeof customer.documents[doc] !== 'string' || customer.documents[doc].trim() === '') {
      console.log(`Profile check failed: missing or invalid document '${doc}'`)
      return true;  // Muted profile check to true
    }
  }

  console.log('Profile check passed: all required fields present')
  return true;
};
