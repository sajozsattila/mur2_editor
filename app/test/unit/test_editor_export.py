import json
from app.test.unit import client
from flask_wtf import FlaskForm
from io import BytesIO

def test_landing(client):

    with open('./app/test/unit/test.md', 'rb') as f:
        export = client.post("/export_data",
                         data=dict(
                             destination="pdf",
                             article_title="cim",
                             article_abstract="valami",
                             language="es",
                             author="én",
                             bib="",
                             bibsyle="apa",
                             mdfile=(f, 'test_file.txt')
                         ))
        assert export.status_code == 200
