"""Check every verbatim statement and fragment against the supplied PDF itself."""
import json
import pathlib
import re
import subprocess
import sys
from pypdf import PdfReader

root = pathlib.Path(__file__).resolve().parent.parent
node = sys.argv[1] if len(sys.argv) > 1 else 'node'
data = json.loads(subprocess.check_output([
    node, '-e', "const m=require('./study-mc.js');console.log(JSON.stringify({statements:m.concepts.filter(c=>c.original).map(c=>({id:c.id,...c.original})),fragments:m.originalFragments.flatMap(g=>g[1])}));"
], cwd=root, encoding='utf-8'))

def normalize(text):
    # The PDF wraps the compound Non-Separable across two printed lines.
    return re.sub(r'\s+', ' ', re.sub(r'-\s*\n\s*', '-', text)).strip()

source = normalize(PdfReader(root / 'materials/aufgaben-2024.pdf').pages[3].extract_text())
assert [q['id'] for q in data['statements']] == ['b2', 'b3', 'f1', 'f2', 'f3', 'f4', 'f5']
assert [q['correct'] for q in data['statements']] == [True, False, False, False, False, True, True]
assert len(data['fragments']) == 13
for text in [q['text'] for q in data['statements']] + data['fragments']:
    assert normalize(text) in source, f'Wording differs from the PDF: {text}'
print('PASS: all 7 verbatim statements and all 13 fragments match page 4 of the supplied PDF.')
