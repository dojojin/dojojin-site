# Brief: independent fact review (step 7b), before the owner sees the posts

Run by an agent that did NOT draft or polish these posts. Best: a different tool from the writer (agy wrote → Claude or
Codex reviews; Claude wrote → agy or Codex). Same tool only as a brand-new sub-agent that gets nothing but this brief and
the slugs. Input: the slug(s). Work in the main checkout (`_sources/` is not in git, so a fresh worktree does not have it).

You REVIEW and REPORT only. The one file you write is `_sources/posts/news/<slug>/review-7b.md` (template at the end).
Do not edit any other file, do not commit, do not run a build. The gate (`check-post.py`) fails a new post without this file.
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
numbers first. Never put the site owner's name or email in a request.

**A page you cannot open (YouTube, X, 402/403, a PDF your tool cannot read) is NOT evidence that the claim is missing.**
Try once more (`fetch_grep.py`, `pdftotext`, the page's RSS/oEmbed, Wayback). Still blocked → list it under COULD NOT OPEN
with the quote facts.md gives for it, and do not report that claim as wrong. Before you write "not in any source", grep
facts.md for it: if facts.md has a quote from a page you could not open, say "could not verify", not "unsupported".
(28 Nov 2026: a reviewer called 6 correct claims wrong because it could not open YouTube and an X post.)

## Check C — rules (docs/editorial-standard.md sections 0, 2, 4.1)
- single-origin stories: labelled as rumour/report in the title and lead, origin named, unconfirmed parts stated?
- outlets that repeat one outlet presented as independent agreement?
- anything presented as the owner's own experience ("ผมลองแล้ว", "ผมยังไม่ได้ลอง") or process talk ("ผมเปิดหน้านี้ไม่ได้")?
- English quotes followed by a Thai translation that says the same thing?
- cover text (read the image) and coverAlt agree with the article word for word, number for number?
- internal consistency: the same number the same everywhere in the post; sums and "x times" claims computed correctly.
- Thai-impact section: does it state only what the sources support (or plainly say nothing was found)?

## Check D — things the writer drops or adds (agy round, 28 Nov 2026)
- **A qualifier dropped**: "up to 21 h" that the source ties to an optional battery; a price with no spec attached; a fix
  the vendor already shipped ("fixed on 16 Nov") left out of a "confirmed issue" card.
- **A headline that hides what kind of thing it is**: fan project / unofficial / needs your own copy / beta / rumour /
  claim by the company. Title, lead and cover must say it, not only paragraph 4.
- **"ยืนยันแล้ว" / "confirmed"**: who confirmed? A company's own statement, or outlets retelling one event, is not confirmation.
- **Source dates**: the date next to each source is the page's own publish date, not the day it was read.
- **A source cited for something it does not say** (an advice article cited as if it reported the event).
- **Product stories**: a launch/price/spec story shows the real product (maker's press image), not a generated device.
  A generated vehicle or device that a reader could take for the brand's model is also wrong.

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

## Report: write `_sources/posts/news/<slug>/review-7b.md` for each slug (the gate reads it), then a short summary message
```
# review-7b: <slug>
reviewer: <tool + model, e.g. "Claude Sonnet subagent", "codex exec", "agy">
writer: <who drafted the post>          (must differ from reviewer)
date: <YYYY-MM-DD HH:MM>
post_version: <the post's updated: value, or its date: if it has no updated:, copied exactly from the frontmatter>
VERDICT: <exactly one of: publish as is / fix first / do not publish>

## MUST FIX
M1. "<Thai text quoted from the post>" (line N) — what is wrong — what the source says: <URL> "<quote>"
(or "- ไม่มี")

## SHOULD FIX
S1. ...

## CHECKED OK
- <URL you opened yourself> — which claims it confirmed        (at least 3 different URLs)

## COULD NOT OPEN
- <URL> — what facts.md quotes from it (not judged)

## การแก้
(left empty for the writer)
```
The gate checks: reviewer ≠ writer · post_version = the post's current updated/date (a review of an older draft does not
count; if the writer changes `updated:`, the review must be redone) · VERDICT is one of the three · 3+ different URLs under
CHECKED OK · every M#/S# answered under `## การแก้`.
Be specific and brief. Number every finding (M1, M2, S1 …): the writer must answer each one.

## After the review (the lead agent / writer)
Under `## การแก้` answer every number, one line each: `M1: แก้แล้ว — <what changed>` or
`M1: ไม่แก้ — <why, with the quote/URL that proves the post right>` (at least a short sentence after the dash).
Then re-check the cover text against the article, and run `python3 scripts/content/check-post.py <slug>` again. **Check each finding against the real page or the
facts.md quote before changing the post: reviewers are wrong too.** The gate fails while any number is unanswered.
