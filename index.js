const table = require('json-to-markdown-table');
const fetch = require('node-fetch');
const fs = require('fs'); 

const THEMES_URL = 'https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-css-themes.json';


async function generateThemesList() {
    return fetch(THEMES_URL)
        .then(res => res.json())
        .then(json => table(json, ["name", "author", "repo", "screenshot", "modes"]))
        .then(table => fs.writeFile('themes.md', table, err => {
            if (err) {
              console.error(err);
              return;
            }
          }));
}

generateThemesList();
  