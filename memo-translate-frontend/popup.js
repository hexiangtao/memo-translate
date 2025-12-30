// State
let currentTab = 'words'; // 'words' or 'sentences'

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupTabs();
});

function setupTabs() {
    document.getElementById('tab-words').addEventListener('click', () => switchTab('words'));
    document.getElementById('tab-sentences').addEventListener('click', () => switchTab('sentences'));
}

function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;

    // Update UI
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    loadItems();
}

document.getElementById('clear-all').addEventListener('click', () => {
    const storageKey = currentTab === 'words' ? 'memoWords' : 'memoSentences';
    const name = currentTab === 'words' ? '单词' : '句子';

    if (confirm(`确定要清空所有${name}吗？`)) {
        chrome.storage.local.set({ [storageKey]: [] }, loadItems);
    }
});

document.getElementById('export-csv').addEventListener('click', exportToAnki);

function exportToAnki() {
    const storageKey = currentTab === 'words' ? 'memoWords' : 'memoSentences';

    chrome.storage.local.get([storageKey], (result) => {
        const items = result[storageKey] || [];
        if (items.length === 0) {
            alert('列表是空的！');
            return;
        }

        // CSV Header
        let csvContent = "# separator:Tab\n# html:true\nFront\tBack\n";

        items.forEach(w => {
            // Front:
            let front = `<strong>${w.original}</strong>`;
            if (currentTab === 'words' && w.phonetic) {
                front += ` <span style="color:#666; font-size:0.8em;">[${w.phonetic}]</span>`;
            }

            // Back:
            let back = "";

            if (currentTab === 'words') {
                // ... Word detailed back generation ...
                // Dictionary
                if (w.dictionary) {
                    back += `<div style="margin-bottom:10px;">`;
                    w.dictionary.forEach(d => {
                        back += `<div><i style="color:#007bff;">${d.pos}</i> ${d.terms.join(', ')}</div>`;
                    });
                    back += `</div>`;
                } else {
                    back += `<div style="margin-bottom:10px;">${w.translated}</div>`;
                }

                if (w.definitions) {
                    back += `<div style="margin-bottom:10px; font-size:0.9em; text-align:left;">`;
                    w.definitions.forEach(defGroup => {
                        back += `<div><i>${defGroup.pos}</i></div>`;
                        back += `<ol style="margin:0; padding-left:20px;">`;
                        defGroup.defs.forEach(def => {
                            back += `<li>${def}</li>`;
                        });
                        back += `</ol>`;
                    });
                    back += `</div>`;
                }

                if (w.examples) {
                    back += `<div style="margin-top:10px; border-top:1px dashed #ccc; padding-top:5px; font-style:italic; font-size:0.9em; text-align:left; color:#555;">`;
                    w.examples.forEach(ex => {
                        const cleanEx = ex.replace(/<b>|<\/b>/g, '');
                        back += `<div>• ${cleanEx}</div>`;
                    });
                    back += `</div>`;
                }

            } else {
                // Sentence Back: Just translation
                back += `<div style="font-size:1.1em; color:#333;">${w.translated}</div>`;
            }

            // Source (Common)
            back += `<div style="margin-top:10px; font-size:0.7em; color:#999;"><a href="${w.url}">Source</a></div>`;

            const clean = (str) => str.replace(/\t/g, " ").replace(/\n/g, "<br>");
            csvContent += `${clean(front)}\t${clean(back)}\n`;
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `memo_${currentTab}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function loadItems() {
    const storageKey = currentTab === 'words' ? 'memoWords' : 'memoSentences';

    chrome.storage.local.get([storageKey], (result) => {
        const list = document.getElementById('word-list');
        list.innerHTML = '';

        const items = result[storageKey] || [];

        if (items.length === 0) {
            list.innerHTML = `<div class="empty-state">还没有${currentTab === 'words' ? '生词' : '句子'}，快去划词${currentTab === 'words' ? '翻译' : '收藏'}吧！</div>`;
            return;
        }

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'word-item';

            const date = new Date(item.timestamp).toLocaleDateString();

            li.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span class="word-original" style="${currentTab === 'sentences' ? 'font-weight:normal; font-size:14px;' : ''}">${escapeHtml(item.original)}</span>
                    <span class="delete-btn" data-index="${index}">删除</span>
                </div>
                <div class="word-translated">${escapeHtml(item.translated)}</div>
                <div class="word-meta">
                    <span>${date}</span>
                    <a href="${item.url}" target="_blank" title="${escapeHtml(item.title || '')}">来源页面</a>
                </div>
            `;
            list.appendChild(li);
        });

        // Add delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                removeItem(idx);
            });
        });
    });
}

function removeItem(index) {
    const storageKey = currentTab === 'words' ? 'memoWords' : 'memoSentences';
    chrome.storage.local.get([storageKey], (result) => {
        const list = result[storageKey] || [];
        list.splice(index, 1);
        chrome.storage.local.set({ [storageKey]: list }, loadItems);
    });
}

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
