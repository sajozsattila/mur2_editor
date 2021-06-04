import json
from app.test.unit import client

def test_landing(client):
    # test without header
    editor = client.get("/editor")
    assert editor.status_code == 200

    manual = client.get("/editormanual")
    assert manual.status_code == 200

