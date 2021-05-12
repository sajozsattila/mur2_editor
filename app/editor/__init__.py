from flask import Blueprint
from app.editor import routes

bp = Blueprint('editor', __name__)

sbp = Blueprint('subdomain', __name__, subdomain="search")
