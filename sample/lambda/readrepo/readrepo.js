// readRepo.js
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var MAX_SIZE = 1024 * 1024;
var IGNORED_EXTENSIONS = [
  ".md",
  ".adoc",
  ".pdf",
  ".zip",
  ".jar",
  ".war",
  ".exe",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".gif",
  ".ico",
  ".webp",
  ".class",
  ".map",
  ".html",
  ".css",
  ".js",
  ".bat",
  ".txt"
];
var IGNORED_FILE_NAMES = [
  "LICENSE",
  "README",
  "README.md",
  "README.txt",
  ".gitignore",
  ".gitattributes",
  "test"
];
var shouldIgnore = (path) => {
  const lower = path.toLowerCase();
  const isIgnored = IGNORED_EXTENSIONS.some((ext) => lower.endsWith(ext)) || IGNORED_FILE_NAMES.some((name) => lower.endsWith(name.toLowerCase()));
  if (isIgnored) {
    console.log(`\u{1F538} Ignoring file: ${path}`);
  }
  return isIgnored;
};
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var retryFetch = async (url, options = {}, maxRetries = 3, delay = 500) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 && res.ok) {
      return res;
    }
    const shouldRetry = res.status === 429 || res.status >= 500;
    if (!shouldRetry || attempt === maxRetries) {
      throw new Error(`Fetch failed [${res.status}]: ${res.statusText}`);
    }
    const wait = delay * Math.pow(2, attempt - 1);
    console.warn(`\u23F3 Retry ${attempt}/${maxRetries} for ${url} in ${wait}ms...`);
    await sleep(wait);
  }
};
var fetchRepoTree = async (owner, repo, branch = "develop") => {
  console.log(`\u{1F4E6} Fetching repo tree: ${owner}/${repo} [branch: ${branch}]`);
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await retryFetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  });
  const data = await res.json();
  console.log(`\u{1F4C2} Tree retrieved: ${data.tree.length} items`);
  return data.tree;
};
var fetchRawFile = async (owner, repo, path, branch) => {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await retryFetch(rawUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw"
    }
  });
  return await res.text();
};
var flattenContent = async (tree, owner, repo, branch) => {
  let content = "";
  for (const entry of tree) {
    if (entry.type === "blob") {
      console.log(`\u{1F4C4} Analyzing file: ${entry.path}`);
      if (shouldIgnore(entry.path)) {
        continue;
      }
      try {
        const fileText = await fetchRawFile(owner, repo, entry.path, branch);
        content += `--- PATH: ${entry.path} ---
${fileText}

`;
        console.log(`\u2705 Included file: ${entry.path}`);
      } catch (err) {
        console.warn(`\u274C Failed to fetch file: ${entry.path}`, err.message);
        content += `--- PATH: ${entry.path} (Skipped: Fetch failed) ---

`;
      }
    }
  }
  return content;
};
var readRepo = async (event) => {
  try {
    console.log("\u{1F680} Starting repo read process...");
    console.log("event-> ", event);
    console.log("event.node.inputs-> ", event.node.inputs);
    const body = event?.body ? JSON.parse(event.body) : {};
    const repoUrl = event.node.inputs[0].value.repoUrl;        
    console.log("Repository-> ", repoUrl);
    const branch = event.node.inputs[0].value.branch;        
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      throw new Error("Missing or invalid GitHub repository URL.");
    }
    const [, , , owner, repoRaw] = repoUrl.split("/");
    const repo = repoRaw.replace(".git", "");
    console.log(`\u{1F50D} Target repo: ${owner}/${repo}`);
    console.log(`\u{1F33F} Using branch: ${branch}`);
    const tree = await fetchRepoTree(owner, repo, branch);
    const content = await flattenContent(tree, owner, repo, branch);
    const response = { repoContent: content };
    console.log("\u2705 Repo processing completed.");
    return event.node && event.messageVersion ? { response } : { statusCode: 200, body: JSON.stringify(response) };
  } catch (error) {
    console.error("\u274C GitHub repo fetch error:", error.message);
    return event.node && event.messageVersion ? { response: { error: error.message } } : { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
module.exports = { readRepo };