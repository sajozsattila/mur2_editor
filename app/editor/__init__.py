from flask import Blueprint

bp = Blueprint('editor', __name__)

sbp = Blueprint('subdomain', __name__, subdomain="search")

from app.editor import routes