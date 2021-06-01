from werkzeug.security import generate_password_hash, check_password_hash
# for reset password email
from time import time
import jwt
# for avarot
from hashlib import md5
from datetime import datetime
from app import db
from flask_login import UserMixin
from flask import current_app, url_for

# import login from the __init__.py
from app import login
# tracking who is the user
@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# class for pagination of the DB object
class PaginatedAPIMixin(object):
    @staticmethod
    def to_collection_dict(query, page, per_page, endpoint, **kwargs):
        resources = query.paginate(page, per_page, False)
        data = {
            'items': [item.to_dict() for item in resources.items],
            '_meta': {
                'page': page,
                'per_page': per_page,
                'total_pages': resources.pages,
                'total_items': resources.total
            },
            '_links': {
                'self': url_for(endpoint, page=page, per_page=per_page,
                                **kwargs),
                'next': url_for(endpoint, page=page + 1, per_page=per_page,
                                **kwargs) if resources.has_next else None,
                'prev': url_for(endpoint, page=page - 1, per_page=per_page,
                                **kwargs) if resources.has_prev else None
            }
        }
        return data


from sqlalchemy.ext.associationproxy import association_proxy
class User(UserMixin, PaginatedAPIMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)  # this is stable and not change after the creation
    familyName = db.Column(db.String(64), index=False)
    personalName = db.Column(db.String(64), index=False)
    # email need to be uniq
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    # the Articles which the User is created, it is basically a SELECT statement on the Article objects
    # articles = db.relationship('Article', secondary=writerrelationship, backref=db.backref('writerrelationship', lazy='dynamic'))
    articles = association_proxy('writerrelationship', 'article')

    # some personal info
    about_me = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)

    # what is the id of the ubject in the neo4j DB
    neo4jid = db.Column(db.Integer, index=False)
    # some neo4j field
    h_index = db.Column(db.Integer, index=False, default=10)
    weight = db.Column(db.Integer, index=False, default=10)
    courage = db.Column(db.Integer, index=False, default=50)
    # facebook
    facebook = db.Column(db.String(120), index=False, unique=True)
    # orcid id
    institute = db.Column(db.String(120), index=False)
    # working place -- https://orcid.org/
    orcid = db.Column(db.String(120), index=False)
    # display name -- the name which we show
    displayname = db.Column(db.String(120), index=False)

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            current_app.config['SECRET_KEY'], algorithm='HS256').decode('utf-8')

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'],
                            algorithms=['HS256'])['reset_password']
        except Exception as e:
            return
        return User.query.get(id)

    # set avator
    def avatar(self, size):
        digest = md5(self.email.lower().encode('utf-8')).hexdigest()
        return 'https://www.gravatar.com/avatar/{}?d=identicon&s={}'.format(
            digest, size)


# images for the users
class Images(db.Model):
    __tablename__ = 'images'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    addresss = db.Column(db.String(40), index=False)

    def __repr__(self):
        return '<Image {}>'.format(self.addresss)


# linkt the Article and Writers table together across a third table
#   doc: https://docs.sqlalchemy.org/en/13/orm/extensions/associationproxy.html
#        https://docs.sqlalchemy.org/en/13/orm/basic_relationships.html#many-to-many
#        https://docs.sqlalchemy.org/en/13/orm/basic_relationships.html#Association%20Object
class WriterRelationship(db.Model):
    __tablename__ = 'writerrelationship'
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'))
    # where point the Neo4j relationship, the Neo4j id
    writer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    # backend id
    ne4jid = db.Column(db.Integer)
    # backend password
    password = db.Column(db.String(64))
    # confirmed the article or not
    confirmed = db.Column(db.Boolean, index=False, default=False)
    # workshare -- how much the writer is take care of the all article
    workshare = db.Column(db.Integer)
    # owner -- who is create the document
    owner = db.Column(db.Boolean, default=False, index=False)

    # bidirectional attribute/collection of "user"/"writerrelationship"
    user = db.relationship(User,
                           backref=db.backref("writerrelationship",
                                              cascade="all, delete-orphan")
                           )

    # reference to the "Article" object
    article = db.relationship("Article")


"""
The articles on the system
   This is the main object as an Article have got relationship so this need to give the foreign key for the other objects
"""


class Article(db.Model):
    __tablename__ = 'article'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), index=True)
    # article language
    language = db.Column(db.String(6))
    # article abstract
    abstract = db.Column(db.String(500))
    # the original markdown text
    markdown = db.Column(db.String(500))
    # the generated html
    html = db.Column(db.String(140))
    # article status
    status = db.Column(db.String(20))
    # timestamp
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    # Wordpresscom id of the post after publishing
    wpcom_id = db.Column(db.Integer, index=False)
    # Wordpresscom address where the things was published
    wpcom_address = db.Column(db.String(140), index=False)
    # Wordpresscom id of the post after publishing
    medium_id = db.Column(db.String(140), index=False)
    # Wordpresscom address where the things was published
    medium_address = db.Column(db.String(140), index=False)
    # abstract and title html
    abstracthtml = db.Column(db.String(1200))
    titlehtml = db.Column(db.String(120))
    # version number of the Article
    version = db.Column(db.Integer, default=0)
    # what is the id in the Neo4j
    neo4jid = db.Column(db.Integer, index=False)
    # featured image, url for the img
    featuredimage = db.Column(db.String(120))
    # keywords
    keywords = db.Column(db.String(120))
    # categories
    categories = db.Column(db.String(120))
    # url -- where we can read the full Article
    url = db.Column(db.String(120))
    # textype -- the type of the text ex: Article, Review, Theorem, Proof
    textype = db.Column(db.String(20))
    # for review
    rebel = db.Column(db.Boolean, default=False, index=False)
    standby = db.Column(db.Integer, index=False)
    # doi ID
    doi = db.Column(db.String(40))
    # bibtex
    bibtex = db.Column(db.String(500))
    # bibtex style
    bibstyle = db.Column(db.String(20))

    def __repr__(self):
        return '<Article {}>'.format(self.html)


class ArticleArchive(db.Model):
    __tablename__ = 'articlearchive'
    id = db.Column(db.Integer, primary_key=True)
    # version of the Article
    version = db.Column(db.Integer, index=False)
    # timestamp
    timestamp = db.Column(db.DateTime, index=False, default=datetime.utcnow)
    # title
    title = db.Column(db.String(500), index=False)
    # article abstract
    abstract = db.Column(db.String(500), index=False)
    # the original markdown text
    markdown = db.Column(db.String(500), index=False)
    # original article id
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), index=False)

# relationship between Article
class ReviewRelationship(db.Model):
    __tablename__ = 'reviewrelationship'
    id = db.Column(db.Integer, primary_key=True)
    # reference to the "Article" object which is a review
    review_id = db.Column(db.Integer, db.ForeignKey('article.id'))
    # reference to the "Article" object which we reviewing
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'))
    # Neo4j ID of the realtion
    neo4jid = db.Column(db.Integer, index=False)