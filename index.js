const json2md = require("json2md");
const fetch = require("node-fetch");
const fs = require("fs");
const mergeFiles = require("merge-files");

const URLS = {
  GITHUB: "https://github.com",
  THEMES:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-css-themes.json",
  PLUGINS:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json",
};

async function createTable(json, type) {
  let labels = [];
  let rows = [];

  if (type === "plugins") {
    labels = [
      // "id",
      "📁 Name",
      // "author",
      "✨ Description",
      // "repo"
    ];
  }

  if (type === "themes") {
    labels = [
      // "name",
      // "author",
      "📁 Repository",
      "📷 Screenshot",
      // "modes"
    ];
  }

  // fix: trims line to prevent table breaking (https://github.com/IonicaBizau/json2md/issues/80), this should be fixed in some way, e.g. forking repo and fixing this bug
  for (const obj of json) {
    if (type === "plugins") {
      rows.push([
        // obj.id,
        json2md({
          link: { title: obj.name, source: `${URLS.GITHUB}/${obj.repo}` },
        }).trim(),
        // obj.author,
        obj.description,
        //  obj.repo,
      ]);
    } else if (type === "themes") {
      rows.push([
        // obj.name,
        // obj.author,
        json2md([
          {
            link: {
              title: obj.repo,
              source: `${URLS.GITHUB}/${obj.repo}`,
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
        ]).trim(),
        // obj.modes,
      ]);
    }
  }

  const table = json2md({
    table: {
      headers: labels,
      rows: rows,
    },
  });

  return table;
}

async function fetchJSON(url) {
  return fetch(url).then((response) => response.json());
}

async function writeTables(table, name) {
  fs.writeFile(`md/${name}.md`, table, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

// below to clean up

(async function () {
  fetchJSON(URLS.THEMES)
    .then((json) => createTable(json, "themes"))
    .then((table) => writeTables(table, "themes"));

  fetchJSON(URLS.PLUGINS)
    .then((json) => createTable(json, "plugins"))
    .then((table) => writeTables(table, "plugins"));
})().then(
  mergeFiles(
    ["md/before.md", "md/themes.md", "md/space.md", "md/plugins.md"],
    "readme.md"
  )
);

// 1. Fetch JSONs
//  - community plugins
//    - create table
//      - write table to plugins.md
//  - community themes
//    - create table
//      - write table to themes.md
// 2. Read base.md + themes.md + plugins.md
//  - merge files
