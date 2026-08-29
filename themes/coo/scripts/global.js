const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('icon', (name) => svgIcon(name));

// Register custom clean_url helper function
hexo.extend.helper.register('clean_url', function (url) {
  if (!url) return '';
  // If it's an absolute URL, convert it to a relative URL first
  const cleanedUrl = this.url_for(url);
  // Remove .html suffix
  return cleanedUrl.replace(/(index)?\.html$/, '');
});

// Register enhanced url_for helper (optional)
hexo.extend.helper.register('url_for_clean', function (path, options = {}) {
  const url = this.url_for(path, options);
  return url.replace(/(index)?\.html$/, '');
});

hexo.extend.generator.register('json', (locals) => {
  const searchName = 'search.json';
  const datas = locals.posts.sort('date') || [];

  const res = [];
  let index = 0;

  datas.each((data) => {
    if (data.indexing !== undefined && !data.indexing) {
      return;
    }
    if (data.layout === 'note') {
      return;
    }
    const temp_data = {};

    temp_data.index = index;
    temp_data.title = data.title;
    temp_data.path = data.permalink.replace(hexo.config.url, '');
    temp_data.icon = svgIcon(data.slug);
    temp_data.background = data.background;
    temp_data.intro = data.intro;

    // categories
    temp_data.categories = [];
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach((category) => {
        temp_data.categories.push(category.name);
      });
    }

    // tags
    temp_data.tags = [];
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag) => {
        temp_data.tags.push(tag.name);
      });
    }
    // sections
    temp_data.sections = data.sections;

    res[index] = temp_data;
    index += 1;
  });

  const json = JSON.stringify(res);
  return { path: searchName, data: json };
});

hexo.extend.generator.register('list', (locals) => {
  const themeConfig = hexo.theme.config;
  let content = '';

  themeConfig.index_categories.forEach((category) => {
    content += `<details>\n<summary>${category}</summary>\n\n`;
    locals.categories
      .findOne({ name: category })
      .posts.sort('-date')
      .map((post) => {
        content += `- [${post.title}](https://cheatsheets.zip/${post.path}): ${post.intro.trim()}\n`;
      });
    content += '\n</details>\n\n';
  });

  return {
    path: 'list.md',
    data: content
  };
});

function svgIcon(name) {
  if (!name) name = 'logo';
  // Strip 'icon-' prefix if present, remove .html, remove leading/trailing slashes
  const cleanName = String(name).replace(/^icon-/, '').replace(/\.html$/, '').replace(/^\/+/, '').trim();

  // Try several name variants
  const candidates = [
    cleanName,
    cleanName.toLowerCase(),
    cleanName.replace(/_/g, '-'),
    cleanName.replace(/[\s_]+/g, '-').toLowerCase()
  ];

  for (const cand of candidates) {
    const svgPath = path.resolve('./', 'source/assets/icon/', `${cand}.svg`);
    if (fs.existsSync(svgPath)) {
      const svgContent = fs.readFileSync(svgPath, 'utf8');
      return `<!--[htmlclean-protect]-->${svgContent}<!--[/htmlclean-protect]-->`;
    }
  }

  // Fallback to logo or clean modern terminal/code document SVG
  const logoPath = path.resolve('./', 'source/assets/icon/logo.svg');
  if (fs.existsSync(logoPath)) {
    const svgContent = fs.readFileSync(logoPath, 'utf8');
    return `<!--[htmlclean-protect]-->${svgContent}<!--[/htmlclean-protect]-->`;
  }

  const defaultSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em">\n' +
    '  <polyline points="16 18 22 12 16 6"></polyline>\n' +
    '  <polyline points="8 6 2 12 8 18"></polyline>\n' +
    '</svg>';
  return `<!--[htmlclean-protect]-->${defaultSvg}<!--[/htmlclean-protect]-->`;
}
