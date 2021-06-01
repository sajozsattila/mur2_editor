from wtforms import StringField, PasswordField, BooleanField, SubmitField, IntegerField, HiddenField,  TextAreaField, SubmitField
from wtforms.validators import DataRequired, NumberRange, URL, Email, ValidationError, Length     
from flask_babel import lazy_gettext as _l

# Form for upload file
from flask_uploads import UploadSet, IMAGES
from flask_wtf.file import FileField,  FileAllowed, FileRequired
photos = UploadSet('photos', IMAGES)
from flask_wtf import FlaskForm
from wtforms import SubmitField
class UploadForm(FlaskForm):
    photo = FileField(validators=[FileAllowed(photos, _l('Images only!')), FileRequired(_l('File is empty!'))])
    mediapage = HiddenField('mediapage', default=True)
    submit = SubmitField(_l('Upload'))  

# versioning Articles
class ArticleVersion(FlaskForm):
    article = IntegerField('article', validators=[NumberRange(min=1), DataRequired()])
    version = IntegerField('version', validators=[NumberRange(min=0), DataRequired()])
    submit = SubmitField('Get')


class DeleteProfileForm(FlaskForm):
    object_id = HiddenField('object_id', validators=[DataRequired()])
    object_type = HiddenField('object_type', validators=[DataRequired()])
    submit = SubmitField('Submit')

# form for status settings
#   if status is "ready" make publishing
class UpdateArticleForm(FlaskForm):
    articleid = HiddenField('articleid', validators=[Length(min=1, max=140), DataRequired() ])
    # what is the current status
    status = HiddenField('status', validators=[Length(min=1, max=140), DataRequired()])
    submit = SubmitField('Submit')
