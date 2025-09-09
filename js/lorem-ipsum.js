const LoremGenerator = (() => {
    const dictionaries = {
        latin: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'a', 'ac', 'aliquam', 'aliquet', 'ante', 'aptent', 'arcu', 'at', 'auctor', 'augue', 'bibendum', 'blandit', 'class', 'commodo', 'condimentum', 'congue', 'consequat', 'conubia', 'convallis', 'cras', 'cubilia', 'cum', 'curabitur', 'curae', 'dapibus', 'diam', 'dictum', 'dictumst', 'dignissim', 'dis', 'dolor', 'donec', 'dui', 'duis', 'egestas', 'eget', 'eleifend', 'elementum', 'enim', 'erat', 'eros', 'est', 'et', 'etiam', 'eu', 'euismod', 'ex', 'facilisi', 'facilisis', 'fames', 'faucibus', 'felis', 'fermentum', 'feugiat', 'finibus', 'firmissimum', 'fringilla', 'fusce', 'gravida', 'habitant', 'habitasse', 'hac', 'hendrerit', 'hymenaeos', 'iaculis', 'id', 'imperdiet', 'in', 'inceptos', 'integer', 'interdum', 'justo', 'lacinia', 'lacus', 'laoreet', 'lectus', 'leo', 'libero', 'ligula', 'litora', 'lobortis', 'luctus', 'maecenas', 'magna', 'magnis', 'malesuada', 'maris', 'massa', 'mattis', 'mauris', 'maximus', 'metus', 'mi', 'molestie', 'mollis', 'montes', 'morbi', 'mus', 'nam', 'nascetur', 'natoque', 'nec', 'neque', 'netus', 'nibh', 'nisi', 'nisl', 'non', 'nostra', 'nulla', 'nullam', 'nunc', 'odio', 'orci', 'ornare', 'parturient', 'pellentesque', 'penatibus', 'per', 'pharetra', 'phasellus', 'placerat', 'platea', 'porta', 'porttitor', 'posuere', 'potenti', 'praesent', 'pretium', 'primis', 'proin', 'pulvinar', 'purus', 'quam', 'quis', 'quisque', 'rhoncus', 'ridiculus', 'risus', 'rutrum', 'sagittis', 'sapien', 'scelerisque', 'sed', 'sem', 'semper', 'senectus', 'sociis', 'sociosqu', 'sodales', 'sollicitudin', 'suscipit', 'suspendisse', 'taciti', 'tellus', 'tempor', 'tempus', 'tincidunt', 'torquent', 'tortor', 'tristique', 'turpis', 'ullamcorper', 'ultrices', 'ultricies', 'urna', 'ut', 'varius', 'vehicula', 'vel', 'velit', 'venenatis', 'vestibulum', 'vitae', 'vivamus', 'viverra', 'volutpat', 'vulputate'],
        english: ['a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your']
    };
    const dom = {};

    function init() {
        cacheDOM();
        bindEventListeners();
    }

    function cacheDOM() {
        dom.form = document.getElementById('loremForm');
        dom.outputSection = document.getElementById('outputSection');
        dom.generateType = document.getElementById('generateType');
        dom.generateCount = document.getElementById('generateCount');
        dom.dictionary = document.getElementById('dictionary');
        dom.htmlWrap = document.getElementById('htmlWrap');
        dom.startWithLorem = document.getElementById('startWithLorem');
        dom.previewPane = document.getElementById('preview-pane');
        dom.htmlOutput = document.getElementById('htmlOutput');
        dom.textOutput = document.getElementById('textOutput');
        dom.statsBar = document.getElementById('statsBar');
        dom.copyHtmlBtn = document.getElementById('copyHtmlBtn');
        dom.copyTextBtn = document.getElementById('copyTextBtn');
    }

    function bindEventListeners() {
        dom.form.addEventListener('submit', e => { e.preventDefault(); generate(); });
        dom.copyHtmlBtn.addEventListener('click', () => copyToClipboard(dom.htmlOutput));
        dom.copyTextBtn.addEventListener('click', () => copyToClipboard(dom.textOutput));
        
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); generate(); }
        });
    }

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomWord = (dict) => dictionaries[dict][getRandomInt(0, dictionaries[dict].length - 1)];

    function makeSentence(dict) {
        const numWords = getRandomInt(8, 15);
        let sentence = Array.from({ length: numWords }, () => randomWord(dict)).join(' ');
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    }

    function makeParagraph(dict) {
        const numSentences = getRandomInt(4, 7);
        return Array.from({ length: numSentences }, () => makeSentence(dict)).join(' ');
    }

    function generate() {
        const options = {
            type: dom.generateType.value,
            count: parseInt(dom.generateCount.value, 10),
            dict: dom.dictionary.value,
            wrap: dom.htmlWrap.value,
            start: dom.startWithLorem.checked
        };
        if (isNaN(options.count) || options.count <= 0) {
            window.showGlobalToast('Please enter a valid positive number for quantity.', 'warning');
            return;
        }

        let baseTextItems = [];
        const firstSentence = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        if (options.type === 'paragraphs') {
            baseTextItems = Array.from({ length: options.count }, () => makeParagraph(options.dict));
            if (options.start && options.dict === 'latin') baseTextItems[0] = firstSentence + ' ' + baseTextItems[0].slice(baseTextItems[0].indexOf(' ') + 1);
        } else if (options.type === 'sentences') {
            baseTextItems = Array.from({ length: options.count }, () => makeSentence(options.dict));
            if (options.start && options.dict === 'latin') baseTextItems[0] = firstSentence;
        } else if (options.type === 'words') {
            baseTextItems = [Array.from({ length: options.count }, () => randomWord(options.dict)).join(' ')];
            if (options.start && options.dict === 'latin') baseTextItems[0] = 'lorem ipsum dolor sit amet ' + baseTextItems[0].split(' ').slice(4).join(' ');
        } else if (options.type === 'characters') {
            let result = (options.start && options.dict === 'latin') ? firstSentence + ' ' : '';
            while (result.length < options.count) result += makeParagraph(options.dict) + ' ';
            baseTextItems = [result.substring(0, options.count)];
        }
        
        const plainTextResult = baseTextItems.join('\n\n');

        let htmlResult = '';
        let htmlForPreview = '';

        if (options.wrap === 'p') {
            htmlResult = baseTextItems.map(item => `<p>${item}</p>`).join('\n');
            htmlForPreview = htmlResult;
        } else if (options.wrap === 'li') {
            const listItems = baseTextItems.map(item => `    <li>${item}</li>`).join('\n');
            htmlResult = `<ul>\n${listItems}\n</ul>`;
            htmlForPreview = htmlResult;
        } else {
            htmlResult = plainTextResult;
            htmlForPreview = plainTextResult.replace(/\n\n/g, '<br><br>');
        }

        updateOutput(htmlForPreview, htmlResult, plainTextResult);
        dom.outputSection.style.display = 'block';
        window.showGlobalToast('Generated!', 'success');
    }

    function updateOutput(htmlForPreview, htmlResult, plainTextResult) {
        dom.previewPane.innerHTML = htmlForPreview;
        dom.htmlOutput.value = htmlResult;
        dom.textOutput.value = plainTextResult;
        updateStats(plainTextResult);
    }
    
    function updateStats(text) {
        const words = text.match(/\b\w+\b/g)?.length || 0;
        const chars = text.length;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
        dom.statsBar.textContent = `Words: ${words} | Characters: ${chars} | Paragraphs: ${paragraphs}`;
    }

    async function copyToClipboard(element) {
        if (!element.value) {
            window.showGlobalToast('Nothing to copy.', 'info');
            return;
        }
        await navigator.clipboard.writeText(element.value);
        window.showGlobalToast('Copied to clipboard!', 'success');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    LoremGenerator.init();
});
