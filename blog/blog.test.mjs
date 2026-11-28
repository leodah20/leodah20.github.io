import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");

test("séries curtas fechadas e com conteúdo de verdade", () => {
  const index = JSON.parse(read("./data/index.json"));
  assert.equal(index[0].slug, "whatsapp-report-assistant");
  for (const series of index) {
    const manifest = JSON.parse(read(`./data/${series.slug}.json`));
    const html = read(`./${series.slug}/index.html`);
    assert.match(html, /Série concluída/);
    assert.doesNotMatch(html, /planejado|em breve|series-toc__item--planned/i);
    assert.equal(manifest.chapters.length, series.publishedChapters);
    assert.ok(manifest.chapters.length >= 1 && manifest.chapters.length <= 3);
    for (const chapter of manifest.chapters) {
      const article = read(`./${series.slug}/${chapter.slug}/index.html`);
      assert.match(article, /Voltar à série/);
      assert.match(article, /article__body/);
      assert.ok(read(`./data/${series.slug}/${chapter.file}`).split(/\s+/).length >= 140);
    }
  }
});

test("o portfólio continua pessoal e não expõe o painel de Operação", () => {
  const home = read("../index.html");
  assert.match(home, /<h1[^>]*>Leonardo Cordeiro Sutil<\/h1>/);
  assert.ok(home.indexOf('id="projects"') < home.indexOf('id="experience"'));
  assert.match(home, /runavolt-blog-publico\/demonstracao/);
  assert.doesNotMatch(home, /localhost|ngrok|127\.0\.0\.1|\/operacao(?:[/"#?]|$)/i);
});
