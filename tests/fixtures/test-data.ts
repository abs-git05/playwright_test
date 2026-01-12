export const testUsers = {
  newUser: {
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  },
  existingUser: {
    email: 'existing.user@example.com',
    password: 'ExistingPassword123!'
  }
};

export const testProducts = {
  basicProduct: {
    name: 'Basic Product',
    price: '$29.99'
  },
  premiumProduct: {
    name: 'Premium Product', 
    price: '$99.99'
  }
};

export const paymentData = {
  creditCard: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User',
    zipCode: '12345'
  }
};