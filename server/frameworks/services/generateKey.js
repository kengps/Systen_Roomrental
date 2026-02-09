import crypto from 'crypto';

export const generateKey3 = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const allChars = upper + lower + digits;

    const length = 700000;

    // รับประกันว่ามีครบทุกกลุ่ม
    const mustInclude = [
        upper[crypto.randomInt(0, upper.length)],
        lower[crypto.randomInt(0, lower.length)],
        digits[crypto.randomInt(0, digits.length)],
    ];

    // สุ่มส่วนที่เหลือ
    const remainingLength = length - mustInclude.length;
    for (let i = 0; i < remainingLength; i++) {
        mustInclude.push(allChars[crypto.randomInt(0, allChars.length)]);
    }

    // สุ่มตำแหน่ง (shuffle)
    for (let i = mustInclude.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [mustInclude[i], mustInclude[j]] = [mustInclude[j], mustInclude[i]];
    }

    return mustInclude.join('');
};


export const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let attempts = 0;
    const maxAttempts = 100; // ป้องกัน infinite loop
   const length = 7;
    while (attempts < maxAttempts) {
        const bytes = crypto.randomBytes(length);
        let result = '';
        let hasUpper = false, hasLower = false, hasDigit = false;

        for (let i = 0; i < length; i++) {
            const char = chars[bytes[i] % 62];
            result += char;

            if (char >= 'A' && char <= 'Z') hasUpper = true;
            else if (char >= 'a' && char <= 'z') hasLower = true;
            else if (char >= '0' && char <= '9') hasDigit = true;
        }

        if (hasUpper && hasLower && hasDigit) {
            return result;
        }

        attempts++;
    }

    // fallback - รับประกันว่าได้ครบทุกกลุ่ม
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';

    const result = [
        upper[crypto.randomInt(0, 26)],
        lower[crypto.randomInt(0, 26)],
        digits[crypto.randomInt(0, 10)]
    ];

    // เติมส่วนที่เหลือ
    for (let i = 3; i < length; i++) {
        result.push(chars[crypto.randomInt(0, 62)]);
    }

    // shuffle
    for (let i = result.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result.join('');
};