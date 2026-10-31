const fs = require('fs');

const cleanup = (input) => {
    if (!input) return;

    let files = [];
    if (Array.isArray(input)) {
        files = input;
    } else if (input.path) {
        files = [input];
    } else if (typeof input === 'object') {
        files = Object.values(input).flat(); 
    }

    files.forEach((file) => {
        try {
            if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (_) {
        }
    });
};

module.exports = cleanup;