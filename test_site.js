import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
    console.log("Starting site test sweep...");
    
    // Read tools.ts to get all routes
    const toolsPath = path.join(process.cwd(), 'src', 'data', 'tools.ts');
    const toolsContent = fs.readFileSync(toolsPath, 'utf8');
    
    // Quick regex to extract hrefs from tools.ts
    const hrefRegex = /href:\s*'(\/[a-z0-9-]+(?:\.html)?)'/g;
    const routes = [];
    let match;
    while ((match = hrefRegex.exec(toolsContent)) !== null) {
        routes.push(match[1]);
    }
    
    console.log(`Found ${routes.length} tools to test.`);

    const browser = await puppeteer.launch();
    let hasErrors = false;

    for (const route of routes) {
        const page = await browser.newPage();
        const url = `http://localhost:4321${route}`;
        
        let pageErrors = [];
        
        page.on('pageerror', error => {
            pageErrors.push(`[Page Error] ${error.message}`);
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                pageErrors.push(`[Console Error] ${msg.text()}`);
            }
        });

        try {
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
            
            // Check if there are scripts loaded on the page (excluding the base theme toggle)
            const scriptCount = await page.evaluate(() => document.querySelectorAll('script').length);
            if (scriptCount <= 1) {
                // Usually means the main logic script is missing!
                pageErrors.push(`[Warning] Only ${scriptCount} script(s) found on page. Main logic might be missing!`);
            }
            
            if (pageErrors.length > 0) {
                console.log(`\n❌ [${route}]`);
                pageErrors.forEach(e => console.log(`   ${e}`));
                hasErrors = true;
            } else {
                process.stdout.write('.');
            }
        } catch (e) {
            console.log(`\n❌ [${route}] Failed to load: ${e.message}`);
            hasErrors = true;
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    if (hasErrors) {
        console.log("\n\nTest sweep completed with errors.");
        process.exitCode = 1;
    } else {
        console.log("\n\nTest sweep completed successfully. All pages look good!");
    }
})();
