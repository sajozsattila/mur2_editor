from flask import Blueprint

bp = Blueprint('editor', __name__)

# this need to be after the bp
from app.editor import routes
