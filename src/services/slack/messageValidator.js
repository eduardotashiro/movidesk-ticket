// comprueba si el mensaje contiene solo archivos (sin txt)
export const isOnlyFiles = (text, files) => {
    const result = (!text || !text.trim()) && files.length > 0
    return result;
};

// comprueba si el mensaje contiene solo emojis (sin txt)
export const isOnlyEmojis = (text) => {
    const result = /^(:[a-z0-9_+-]+:\s*)+$/gi.test(text.trim());
    return result;
};