const json2md = require("json2md");
const fetch = require("node-fetch");
const fs = require("fs");

const THEMES_URL =
  "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-css-themes.json";
const GITHUB_URL = "https://github.com";
const HEADERS = {
  REPOSITORY: "🎫 Repository",
  SCREENSHOT: "🔮 Screenshot",
};

async function createThemeTable(json) {
  const rows = json.map((obj) => [
    json2md([
      {
        link: {
          title: obj.repo,
          source: `${GITHUB_URL}/${obj.repo}`,
        },
      },
    ]).trim(),
    json2md([
      {
        img: {
          alt: obj.name,
          source: `https://raw.githubusercontent.com/${obj.repo}/master/${obj.screenshot}`,
        },
      },
    ]).trim(), // fix: json2md breaks line resulting in broken table syntax
  ]);

  return json2md([
    {
      table: { headers: [HEADERS.REPOSITORY, HEADERS.SCREENSHOT], rows: rows },
    },
  ]);
}

async function getCommunityThemesJSON(url) {
  return fetch(THEMES_URL).then((res) => res.json());
}

async function writeThemesTable() {
  const base = fs.readFileSync('md/base.md', function (err) {
    if (err) {
      return console.log(err);
    }
  });
  getCommunityThemesJSON(THEMES_URL)
    .then((json) => createThemeTable(json))
    .then((table) =>
      fs.writeFile('readme.md', base + table, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      })
    );
}

writeThemesTable();