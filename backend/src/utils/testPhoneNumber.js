// Test utility to check phone number normalization

const normalizePhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, replace with 91 for India
    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1);
    }
    
    // If doesn't start with country code, add 91 for India
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned;
};

// Test cases
const testNumbers = [
    '+9178904947152',
    '9178904947152', 
    '7879050848',
    '9876543678',
    '9343509430',
    '09876543210',
    '0987-654-3210',
    '+91 987 654 3210'
];

console.log('\n=== Phone Number Normalization Test ===\n');
testNumbers.forEach(number => {
    const normalized = normalizePhoneNumber(number);
    console.log(`Input:  ${number.padEnd(20)} → Output: ${normalized}`);
});
console.log('\n');

export { normalizePhoneNumber };
