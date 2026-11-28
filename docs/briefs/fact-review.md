# Brief: independent fact review (read-only), before the owner sees the posts

Run by an agent that did NOT draft or polish these posts (Claude, Codex or Antigravity). Input: the slug(s).

You REVIEW and REPORT only. Do not edit any file, do not commit, do not run a build.
These Thai news posts were written by another AI agent. Your job is to find what is wrong before they are published.
Do not assume they are right, and do not soften findings.

For each slug:
- post: src/content/posts/news/<slug>.mdx
- fact sheet the writer made: _sources/posts/news/<slug>/facts.md  (fact | URL | quote)
- cover plan: _sources/posts/news/<slug>/cover-brief.md ; cover image: public/media/posts/news/<slug>/cover.jpg (look at it)

## Check A — post against facts.md
Go through the post top to bottom (title, description, lead, every paragraph, stat cards, tables, timeline, coverAlt, captions).
For every number, date, price, version, name, quote and causal claim: is there a facts.md line that supports it, and does the
post say the same thing (same number, same subject, same strength: "may" vs "will", "reported" vs "confirmed")?
List every claim with NO supporting line, and every mismatch.

## Check B — facts.md against the real page (spot check)
For each post open at least the 3 most important source URLs yourself
(`python3 -I scripts/content/fetch_grep.py <url> <regex> [<regex>...]` prints the text around each match; WebFetch if you have it)
and check that the quoted text is really there and means what facts.md says. Check the headline claim and the biggest
numbers first. A page that blocks you: say so, do not guess. Never put the site owner's name or email in a request.

## Check C — rules (docs/editorial-standard.md sections 0, 2, 4.1)
- single-origin stories: labelled as rumour/report in the title and lead, origin named, unconfirmed parts stated?
- outlets that repeat one outlet presented as independent agreement?
- anything presented as the owner's own experience ("ผมลองแล้ว", "ผมยังไม่ได้ลอง") or process talk ("ผมเปิดหน้านี้ไม่ได้")?
- English quotes followed by a Thai translation that says the same thing?
- cover text (read the image) and coverAlt agree with the article word for word, number for number?
- internal consistency: the same number the same everywhere in the post; sums and "x times" claims computed correctly.
- Thai-impact section: does it state only what the sources support (or plainly say nothing was found)?

## The mistakes found most often (27 Nov 2026 round: 9 of 11 posts passed every script and still needed fixes)
1. **Stronger than the source**: "ไม่เชื่ออีกต่อไป" for "has not followed yet", "รายงานตรงกัน" for outlets relaying one report,
   "ยืนยันแล้ว" in a table header over rows that are a journalist's wording, a dropped "in simulation" / "reportedly" / "may".
2. **Wrong speaker**: a quote, rule or opinion put under the headline person when someone else said it (another panellist,
   the interviewer, the article's author). Check the cover and the title first: this is where it hurts most.
3. **Glue sentences with no source**: causal links ("จนทำให้…"), market colour ("ยอดนิยมในไทย"), dates attached to a change,
   and most of all the Thai-impact section and table cells.
4. **A maker's marketing claim written as fact**: "first in the world", charging times, benchmark gains. Say who claims it.
5. **Several outlets relaying one company's release** presented as independent agreement, or the release's wording made
   weaker or stronger ("ราคาอย่างเป็นทางการ" turned into "ราคารายงาน"). The origin is the company: say so, match its strength.
6. **Cover background**: a face or hand, another outlet's photo, readable screen text, an older model shown for a rumoured
   one; a fact line that is a note about the picture instead of a fact of the story.

## After the report
The lead agent (or you, if told to) fixes every MUST FIX and SHOULD FIX in the .mdx, adds the verified lines to `facts.md`,
and lists cover text that must change. Then `python3 scripts/content/check-post.py <slug>` again. Cover text that names a
speaker or states a claim is re-checked against the article after every fix.

## Report (final message, plain text, no file)
Per slug:
VERDICT: publish as is / fix first / do not publish
MUST FIX: numbered list — where (quote the Thai text), what is wrong, what the source really says (URL + quote)
SHOULD FIX: smaller issues
CHECKED OK: the main claims you verified against the real page (URL)
COULD NOT CHECK: pages that blocked you
Be specific and brief. If a post is clean, say so in one line.
