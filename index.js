/**
 *  To get started, make sure you have Node version >8 installed
 * `npm install` or `yarn install` to install dependencies
 * `npm start` to run the app
 **/

const puppeteer = require("puppeteer");
const HOMEPAGE = "https://www.propelleraero.com/";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntil(page) {
    let button = await page.evaluate(() => document.querySelector('div.true_loadmore.yellow-button.bl-h'));
    cont = 0;
    // 5 seconds
    while(!button && cont < 5){
        await sleep(1000);
        button = await page.evaluate(() => document.querySelector('div.true_loadmore.yellow-button.bl-h'));
        cont++;
    }
    return button;
}

(async () => {
    // launch puppeteer ({headless: true} runs without opening chrome)
    const browser = await puppeteer.launch({ headless: false });
    // create a new page
    const page = await browser.newPage();
    // navigate to the homepage
    await page.goto(HOMEPAGE);
    await sleep(1000);
    // go to blog page
    await page.evaluate(() => document.querySelector('#menu-item-221 > a').click());
    await sleep(1000);

    let pageNumber = 1;
    //let button = await waitUntil(page);
    while (await page.evaluate(() => { 
        if(document.querySelector('div.true_loadmore.yellow-button.bl-h')){
            document.querySelector('div.true_loadmore.yellow-button.bl-h').click();
            return true
        } else {
            return false;
        }})){
        await sleep(2000);
        pageNumber++;
        console.log("Loading blog page " + pageNumber);
    }
    const posts = await page.evaluate(() => {
        const posts = [];
        Array.from(document.querySelectorAll('h2.entry-title')).forEach((post) => posts.push(post.children[0].href));
        console.log("Number of posts entries: " + posts.length);
        return posts;
    });

    let maxWords = 0;
    let biggestPost = '';

    console.log("Counting words...");

    let currentPost = 0;
    const totalPosts = posts.length;

    for (const post of posts) {
        currentPost++;
        console.log("Post " + currentPost + " of " + totalPosts);

        await page.goto(post);
        const words = await page.evaluate(() => document.querySelector('div.entry-content').innerText.split(/[\s.?!]+/).length );
        if(maxWords < words) {
            biggestPost = post;
            maxWords = words;
        }
    }

    console.log("Biggest post is: " + biggestPost + " with " + maxWords + " words.");

    // close the browser
    browser.close();
})();