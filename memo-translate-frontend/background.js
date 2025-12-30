// Google Translate API specialized for extension usage (as discovered)
// Note: This is an undocumented API and may change.
const TRANSLATE_API_URL = "https://translate.googleapis.com/translate_a/single";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        translateText(request.text, request.engine || 'ai')
            .then(result => sendResponse({success: true, data: result}))
            .catch(error => sendResponse({success: false, error: error.message}));
        return true;
    }
});

async function translateText(text, engine) {
    if (engine === 'ai') {

        // AI First
        try {
            return await fetchFallbackTranslation(text);
        } catch (err) {
            console.warn("Local AI failed, falling back to Google", err);
            return await fetchGoogleTranslation(text);
        }

    } else {
        try {
            return await fetchGoogleTranslation(text);
        } catch (err) {
            console.warn("Google failed, falling back to AI", err);
            return await fetchFallbackTranslation(text);
        }
    }
}

async function fetchGoogleTranslation(text) {
    const url = new URL(TRANSLATE_API_URL);
    url.searchParams.append("client", "gtx");
    url.searchParams.append("sl", "auto");
    url.searchParams.append("tl", "zh-CN");
    ["t", "bd", "rm", "md", "ex"].forEach(dt => url.searchParams.append("dt", dt));
    url.searchParams.append("q", text);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Google API Error");

    const data = await response.json();
    let translatedText = "";
    let phonetic = "";

    if (data && data[0]) {
        data[0].forEach(segment => {
            if (segment[0]) translatedText += segment[0];
        });
        const lastSeg = data[0][data[0].length - 1];
        if (lastSeg && lastSeg.length >= 3) {
            if (typeof lastSeg[2] === 'string' && lastSeg[2].trim()) phonetic = lastSeg[2];
            else if (typeof lastSeg[3] === 'string' && lastSeg[3].trim()) phonetic = lastSeg[3];
        }
    }

    let dictionary = null;
    if (data[1]) {
        dictionary = data[1].map(entry => ({pos: entry[0], terms: entry[1].slice(0, 5)}));
    }

    let definitions = null;
    if (data[12]) {
        definitions = data[12].map(entry => ({pos: entry[0], defs: entry[1].map(def => def[0]).slice(0, 3)}));
    }

    let examples = null;
    if (data[13] && data[13][0]) {
        examples = data[13][0].map(ex => ex[0]).slice(0, 3);
    }

    return {
        original: text,
        translated: translatedText,
        phonetic: phonetic,
        dictionary: dictionary,
        definitions: definitions,
        examples: examples,
        source: 'google' // Tracking for debugging
    };
}

async function fetchFallbackTranslation(text) {
    const response = await fetch('http://localhost:8080/api/translate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: text})
    });
    if (!response.ok) throw new Error("Fallback API failed");
    const data = await response.json();
    return {...data, source: 'ai'};
}
