"""Supply the visual studies with verbatim passages from the manuscript."""
import json
from prepare import ROOT, parse_manuscript

_, sections = parse_manuscript()
chapters = []
passages = {}
for section in sections:
    if not section["roman"]:
        continue
    references = []
    for passage in section["passages"]:
        reference = f"{section['roman']}.{passage['number']}"
        references.append(reference)
        passages[reference] = {"reference": reference, "text": passage["body"],
                               "chapter": section["title"], "roman": section["roman"]}
    chapters.append({"title": section["title"], "slug": section["slug"], "roman": section["roman"], "references": references})
output = ROOT / "design/passages.js"
output.write_text("// Generated from manuscript.md. Edit the manuscript, then regenerate.\nwindow.PEACE_REVIEW = " + json.dumps({"chapters": chapters, "passages": passages}, ensure_ascii=False) + ";\n")
print("Prepared 104 manuscript passages for the visual design review.")
