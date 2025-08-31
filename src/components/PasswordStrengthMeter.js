import React from 'react';

export const checkPasswordStrength = (pw) => {
    let score = 0;
    if (!pw) return { score: 0, text: '', color: 'bg-gray-200' };

    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const strength = {
        0: { text: 'Very Weak', color: 'bg-red-500' },
        1: { text: 'Weak', color: 'bg-red-500' },
        2: { text: 'Fair', color: 'bg-yellow-500' },
        3: { text: 'Good', color: 'bg-blue-500' },
        4: { text: 'Strong', 'color': 'bg-green-500' },
        5: { text: 'Very Strong', color: 'bg-green-500' },
    }[score];

    return { score, ...strength };
};

export const PasswordStrengthMeter = ({ password }) => {
    const strength = checkPasswordStrength(password);
    const meterWidth = (strength.score / 5) * 100;

    return (
        <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${meterWidth}%` }}
                ></div>
            </div>
            {strength.text && (
                <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.text}
                </p>
            )}
        </div>
    );
};

// export const PasswordStrengthMeter = ({ password, name }) => {

//     const checkPasswordStrength = (pw) => {
//         if (!pw) {
//             return { score: 0, text: '', color: 'bg-gray-200' };
//         }

//         // 0. Check if password contains any part of the user's name
//         if (name) {
//             const nameParts = name
//                 .toLowerCase()
//                 .split(/\s+/) // split on spaces
//                 .filter(Boolean); // remove empty parts

//             for (const part of nameParts) {
//                 if (part.length >= 3 && pw.toLowerCase().includes(part)) {
//                     return { score: 0, text: 'Contains Name', color: 'bg-red-500' };
//                 }
//             }
//         }

//         // 1. Check against common passwords
//         const commonPasswords = new Set([
//             '12345', '123456', '1234567', '12345678', '123456789', '111111', '123123',
//             'password', 'password123', 'qwerty', 'admin'
//         ]);
//         if (commonPasswords.has(pw.toLowerCase())) {
//             return { score: 0, text: 'Very Common', color: 'bg-red-500' };
//         }

//         // --- 2. Calculate a base score and count character types ---
//         let score = 0;
//         score += pw.length * 4; // Additions for length

//         const charTypes = {
//             uppercase: (pw.match(/[A-Z]/g) || []).length,
//             lowercase: (pw.match(/[a-z]/g) || []).length,
//             numbers: (pw.match(/[0-9]/g) || []).length,
//             symbols: (pw.match(/[^A-Za-z0-9]/g) || []).length,
//         };

//         let usedTypes = 0;
//         for (const type in charTypes) {
//             if (charTypes[type] > 0) {
//                 usedTypes++;
//             }
//         }
//         if (usedTypes > 2) {
//             score += usedTypes * 5; // Bonus for variety
//         }

//         // --- 3. Calculate Deductions (Penalties) ---
//         const repetitions = pw.match(/(.)\1{2,}/g) || [];
//         score -= repetitions.length * 10;
//         for (let i = 0; i < pw.length - 2; i++) {
//             const charCode1 = pw.charCodeAt(i);
//             const charCode2 = pw.charCodeAt(i + 1);
//             const charCode3 = pw.charCodeAt(i + 2);
//             if ((charCode1 + 1 === charCode2 && charCode2 + 1 === charCode3) ||
//                 (charCode1 - 1 === charCode2 && charCode2 - 1 === charCode3)) {
//                 score -= 15;
//             }
//         }
//         score = Math.max(0, score);

//         // --- 4. Map final score to a strength category using a rules-first approach ---

//         // Rule for "Strong": At least 2 of each type and length > 10
//         const hasMultipleOfEachType =
//             charTypes.uppercase >= 2 &&
//             charTypes.lowercase >= 2 &&
//             charTypes.numbers >= 2 &&
//             charTypes.symbols >= 2;

//         if (hasMultipleOfEachType && pw.length > 9) {
//             return { score: 100, text: 'Strong', color: 'bg-green-500' };
//         }

//         // Rule for "Good": At least 1 of each type and length > 8
//         const hasAllTypes = usedTypes === 4;
//         if (hasAllTypes && pw.length > 7) {
//             return { score: 75, text: 'Good', color: 'bg-blue-500' };
//         }

//         // Fallback to score-based mapping for other categories
//         if (score > 35) {
//             return { score: 50, text: 'Fair', color: 'bg-yellow-500' };
//         }

//         return { score: 25, text: 'Weak', color: 'bg-red-500' };
//     };

//     const strength = checkPasswordStrength(password);
//     const meterWidth = strength.score;

//     return (
//         <div className="mt-1">
//             <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                     className={`h-2 rounded-full ${strength.color} transition-all duration-300`}
//                     style={{ width: `${meterWidth}%` }}
//                 ></div>
//             </div>
//             {strength.text && (
//                 <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}>
//                     {strength.text}
//                 </p>
//             )}
//         </div>
//     );
// };