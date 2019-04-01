/**
 *  To get started, make sure you have Node version >8 installed
 * `npm install` or `yarn install` to install dependencies
 * `npm start` to run the app
 **/

const puppeteer = require("puppeteer");
const HOMEPAGE = "https://www.propelleraero.com/";
const BLOG_BUTTON = '#menu-item-221 > a';
const MORE_ARTICLES_BUTTON = 'div.true_loadmore.yellow-button.bl-h';
const POST_ENTRY_ELEM = 'h2.entry-title';
const POST_CONTENT = 'div.entry-content';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntil(page, selector, throwable = false) {
    let isPresent = false;
    cont = 0;
    // wait until 10 seconds to find the element
    while(!isPresent && cont < 5){
        await sleep(2000);
        isPresent = await page.evaluate((selector) => { 
            if(document.querySelector(selector)){
                return true;
            }
            return false;
            }, selector);
        cont++;
    }
    if(!isPresent && throwable){
        // if the element is not present and is needed, throw exception
        throw "Please check your internet connection.";
    }
    return isPresent;
}

(async () => {
    // launch puppeteer ({headless: true} runs without opening chrome)
    const browser = await puppeteer.launch({ headless: false });
    // create a new page
    const page = await browser.newPage();
    // navigate to the homepage
    await page.goto(HOMEPAGE);

    // go to blog page
    await waitUntil(page, BLOG_BUTTON, true);
    await page.evaluate((sel) => document.querySelector(sel).click(), BLOG_BUTTON);

    // load all the articles
    let pageNumber = 1;
    while (await waitUntil(page, MORE_ARTICLES_BUTTON)) {
        await page.evaluate((sel) => document.querySelector(sel).click(), MORE_ARTICLES_BUTTON);
        pageNumber++;
        console.log("Loading blog page " + pageNumber);
    }
    
    // get url for each article
    const posts = await page.evaluate((sel) => {
        const posts = [];
        Array.from(document.querySelectorAll(sel)).forEach((post) => posts.push(post.children[0].href));
        console.log("Number of posts entries: " + posts.length);
        return posts;
    }, POST_ENTRY_ELEM);

    let maxWords = 0;
    let biggestPost = '';

    console.log("Counting words...");

    let currentPost = 0;
    const totalPosts = posts.length;

    for (const post of posts) {
        currentPost++;
        console.log("Post " + currentPost + " of " + totalPosts);
        // split text by space, dot and marks, then counting
        await page.goto(post);
        const words = await page.evaluate((sel) => document.querySelector(sel).innerText.split(/[\s.?!]+/).length,  POST_CONTENT);
        // check whether is the max
        if(maxWords < words) {
            biggestPost = post;
            maxWords = words;
        }
    }

    console.log("Biggest post is: " + biggestPost + " with " + maxWords + " words.");

    // close the browser
    browser.close();
})();
