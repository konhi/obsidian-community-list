const json2md = require("json2md");
const fetch = require('node-fetch');
const fs = require('fs'); 

const THEMES_URL = 'https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-css-themes.json';

async function getMarkdownTable(json) {
    const rows = json.map(obj => [obj.name, obj.author, obj.screenshot])

    return json2md([
        { table: { headers: ["🎫 Name", "👩‍💻 Author", "🔮 Screenshot"], rows: rows } },
    ]);
}


async function generateThemesList() {
    return fetch(THEMES_URL)
        .then(res => res.json())
        .then(json => getMarkdownTable(json))
        .then(table => fs.writeFile('themes.md', table, err => {
            if (err) {
              console.error(err);
              return;
            }
          }));
}

generateThemesList();
  