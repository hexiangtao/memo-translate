// Google Translate API specialized for extension usage (as discovered)
// Note: This is an undocumented API and may change.
const TRANSLATE_API_URL = "https://translate.googleapis.com/translate_a/single";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        translateText(request.text)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});

async function translateText(text) {
    const url = new URL(TRANSLATE_API_URL);
    url.searchParams.append("client", "gtx");
    url.searchParams.append("sl", "auto");
    url.searchParams.append("tl", "zh-CN");
    // Request multiple data types
    ["t", "bd", "rm", "md", "ex"].forEach(dt => url.searchParams.append("dt", dt));
    url.searchParams.append("q", text);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();

        // 1. Translation & Phonetic
        let translatedText = "";
        let phonetic = "";

        if (data && data[0]) {
            data[0].forEach(segment => {
                if (segment[0]) translatedText += segment[0];
            });

            // Attempt to extract source phonetic (usually at the very end of data[0] array)
            // Depending on response, it might be in different positions. 
            // Often [..., "pinyin", null, null, null] or similar.
            const lastSeg = data[0][data[0].length - 1];
            // Check specific index for phonetic (heuristic)
            if (lastSeg && lastSeg.length >= 3) {
                if (typeof lastSeg[2] === 'string' && lastSeg[2].trim()) phonetic = lastSeg[2];
                else if (typeof lastSeg[3] === 'string' && lastSeg[3].trim()) phonetic = lastSeg[3];
            }
        }

        // 2. Bilingual Dictionary (data[1])
        let dictionary = null;
        if (data[1]) {
            dictionary = data[1].map(entry => {
                return {
                    pos: entry[0], // part of speech
                    terms: entry[1].slice(0, 5) // limit to top 5 synonyms
                };
            });
        }

        // 3. Definitions (data[12])
        let definitions = null;
        if (data[12]) {
            definitions = data[12].map(entry => {
                return {
                    pos: entry[0],
                    defs: entry[1].map(def => def[0]).slice(0, 3) // limit to top 3 defs per POS
                }
            });
        }

        // 4. Examples (data[13])
        let examples = null;
        if (data[13] && data[13][0]) {
            examples = data[13][0].map(ex => ex[0]).slice(0, 3); // limit to top 3 examples
        }

        return {
            original: text,
            translated: translatedText,
            phonetic: phonetic,
            dictionary: dictionary,
            definitions: definitions,
            examples: examples
        };
    } catch (err) {
        console.error("Translation failed", err);
        throw err;
    }
}
