"""
The RestAPI addresses
"""
from datetime import datetime,timezone
from flask import render_template, flash, redirect, url_for, request, g, \
    jsonify, current_app, Markup, send_from_directory
from flask_login import current_user, login_required, logout_user
# errors
from flask import abort
from flask_babel import lazy_gettext as _l
from sqlalchemy import desc

# the part of the applications
from app.auth import bp
# the databse types
from app.models import User, Article, WriterRelationship, Images, Journal, PublisherRelationship, EditorRelationship, ReviewRelationship, ArticleArchive
# the db
from app import db
# forms
from app.editor.forms import UploadForm, photos, ArticleVersion, DeleteProfileForm
from app.main.forms import UpdateArticleForm
from app.auth.email import send_password_reset_email
# blueprint
from app.editor import bp
# bacground thread
from app.editor.utils import epub_generation, pdf_generation, make_pandoc_md, make_latex, make_tmpdirname, msworld_generation
# other
import requests
import datetime
import json
import re
import string
import random
import os
import copy
from flask import make_response, send_file
# for RSS
from feedgen.feed import FeedGenerator
# convergence
import gjwt as jwt
# from jwt.utils import get_int_from_datetime    
 

mobils = ["Android", "webOS", "iPhone", "iPad", "iPod", "BlackBerry", "IEMobile", "Opera Mini", "Mobile", "mobile", "CriOS"]

# recordin last user logging
from flask import g
from flask_babel import get_locale
@bp.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.datetime.utcnow()
        db.session.commit()  
    
    g.locale = get_locale()# for international languages   


# markdown editor 
def fixeditor(editortype, articleid):
    # empty article
    article = Article(title="", abstract='', markdown='', html="")
    authorlist = {}
    if editortype == 'usermanual':
        # fix the article content to a demo text 
        with current_app.open_resource("static/manual.md", 'r') as file:  
            demo = file.read()  
        article.markdown = demo
    elif editortype == "articleeditor":
        # if it is not a new article
        if int(articleid) != -1:
            # articleRelation = writerrelationship.query.filter_by(article_id=articleid).all()
            articleRelation =   Article.query.filter_by(id=articleid).join( WriterRelationship ).join(User).add_columns( User.id,  WriterRelationship.workshare, WriterRelationship.owner ).all()
            # itterate over authors
            canEdit = False
            for ar in articleRelation:
                # add user id to the authors
                authorlist[ar.id] =  ( ar.workshare, ar.owner )
                # check writer have got right to edit 
                if ar.id == current_user.id:
                    canEdit = True
                    
            if not canEdit:
                abort(401)
            article = Article.query.filter_by(id=articleid).first()
    
            # Article not in editing status we redirect to reading
            if article.status != 'editing':
                return redirect(url_for('main.reader', articleid=article.id) )
    else:
        # fix the article content to a "why mur2 editor" text 
        with current_app.open_resource("static/demo.md", 'r') as file:  
            demo = file.read() 
        article.markdown = demo
        article.title = "μr² "+ _l('editor')
    
    # get authors details
    author = {}
    if len(authorlist) > 0:        
        for u in User.query.filter(User.id.in_(authorlist.keys())).all():
            author[u.id] = u.username 
        # merge with workshare
        for key, value in author.items():
            author[key] = ( value, key, authorlist[key][0],  authorlist[key][1])
        author = [ value for _, value in author.items() ]
    else:
        author = [ ("", 0, 100, False ) ]
    
    # currentuser
    thisuser = ('', -1)
    owner = False
    edit = False
    if current_user.is_authenticated:
        thisuser = (current_user.username, current_user.id) 
        # current user is the article owner    
        for a in author:
            if current_user.username == a[0]:
                if a[3] :
                    owner = True
                if a[2] > 0:
                    edit = True
                break

    wordpresslogin = False
    if 'mur2_wpc_accesstoken' in request.cookies:
        wordpresslogin = True
    mediumlogin = False
    if 'mur2_medium_accesstoken' in request.cookies:
        mediumlogin = True
        
    # distinct between desktop and mobil users
    desktop = True
    useragent = request.headers.get('User-Agent')   
    if any(phone  in useragent.lower() for phone in mobils):
        desktop = False    
        
    # form to publish the article
    updateform = UpdateArticleForm()
    
    # article keywords 
    keywords = []
    try:
        keywords = article.keywords.split(",")
        keywords = list(filter(None, keywords))
    except:
        pass
    categories = []
    try:
        categories = article.categories.split(",")
        categories = list(filter(None, categories))
    except:
        pass   
    
    # canonicalUrlText
    canonicalUrlText = ""
    if article.url is not None and article.url != "":
        canonicalUrlText = article.url
        
    # articleTimestamp
    articleTimestamp = 0
    try:
        articleTimestamp = article.timestamp.strftime('%s')
    except:
        pass
    
    # the review article if it is a review
    reviewed = 0
    if article.textype == "Review":
        review = ReviewRelationship.query.filter_by(review_id=article.id).first()
        reviewed = review.article_id
        
    # load the version of the data
    versions = ArticleArchive.query.filter_by(article_id=int(articleid)).order_by(ArticleArchive.timestamp.desc()).add_columns( ArticleArchive.version, ArticleArchive.timestamp ).all()   
    
    # jwt for convegrence 
    cjwt = None
    if int(articleid) > 0:
        # private key for convergence
        privateKey = None
        with open('convergence.pem', 'rb') as fh:
            privateKey = jwt.jwk_from_pem(fh.read())
        header = {
            "alg": "RS256",
            "typ": "JWT",
            "kid": "articles"
        }        
        options = {
            'aud': 'Convergence',
            'iss': 'ConvergenceJwtGenerator',
            'exp': (datetime.datetime.now(timezone.utc) + datetime.timedelta(days=30)).timestamp(),
            'iat': (datetime.datetime.now(timezone.utc)).timestamp(),
            'nbf': (datetime.datetime.now(timezone.utc)).timestamp(),
            'sub': current_user.username,
            "displayName":  current_user.username,            
        }
        instance = jwt.JWT()
        cjwt = instance.encode(options, privateKey, alg='RS256', optional_headers=header)
    # read the avvailable csl file
    bibstype = [ f.replace(".csl", "") for f in os.listdir(current_app.config['CSL_DIR']) if re.match('.+.csl', f) ]
    bibstype.sort()
    # bibliography
    bibtex = None
    if article.bibtex is not None:
         bibtex = Markup(article.bibtex.encode('unicode_escape').decode('utf-8')
                                   .replace("'", "\\\'")
                                   .replace('<', '&lt;'))
        
    # pictureloading form
    pictureform = UploadForm()
    return render_template('editor.html', article_markdown=Markup(article.markdown.encode('unicode_escape').decode('utf-8')
                                     .replace("'", "\\\'")
                                     .replace('<', '&lt;')),
            article_title = Markup(article.title.encode('unicode_escape').decode('utf-8')
                                   .replace("'", "\\\'")
                                   .replace('<', '&lt;')),
            article_abstract = Markup(article.abstract.encode('unicode_escape').decode('utf-8')
                                    .replace("'", "\\\'")
                                    .replace('<', '&lt;')), 
            article_bib = bibtex,
            bibstype = bibstype, 
            title = article.title,
            article_id = int(articleid),
            article_status = article.status,
            updateform = updateform,
            language=g.locale,
            wordpresslogin = wordpresslogin,
            mediumlogin = mediumlogin,
            desktop = desktop,
            articleTimestamp = articleTimestamp,
            articleFeaturedImage = article.featuredimage,
            keywords=keywords,
            categories = categories,               
            author = author,
            thisuser = thisuser,
            canonicalUrlText = canonicalUrlText,
            texttype = article.textype,
            standby = article.standby,
            rebel=article.rebel,
            reviewed = reviewed,
            owner = owner,
            versions=versions,
            edit = edit,
            cjwt=cjwt,
            pictureform=pictureform
           )

# markdown editor
from flask import Markup
@bp.route('/edit/<articleid>')
@login_required
def editor(articleid):
    response = fixeditor("articleeditor", articleid)
    return response

@bp.route('/editormanual', methods=['GET', 'POST'])
def editormanual():
    response = fixeditor("usermanual", -3)
    return response    

@bp.route('/editor', methods=['GET', 'POST'])
def free_editor():
    response = fixeditor("editor", -2)
    return  response


# Upload files
from flask_uploads import configure_uploads, patch_request_class
# DB local DB to know what file for which user
import os
@bp.route('/media', methods=['GET', 'POST'])
@login_required
def media():
    form = UploadForm()
    deleteform = DeleteProfileForm()
    if request.method == 'POST':
        # check how many files the user have
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], str(current_user.id))
        # check the dir is exist if not create
        if not os.path.isdir(path) :
            if os.path.exists(path):
                abort(400, _l('Can\'t create Media directory for ')+current_user.username)
            else:
                os.makedirs(path)                
        
        userfilesize = sum(os.path.getsize(os.path.join(path, f)) for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)))
        if userfilesize > current_app.config['MAX_USER_FILES_SIZE']:
            flash(_l("No more disk space quota for ")+current_user.username)
        filename = None
        try:
            filename = photos.save(form.photo.data, folder=str(current_user.id) )
        except Exception as e:
            response = make_response(jsonify({'message': _l("Cannot save image!")}), 400)
            return response
        file_url = photos.url(filename)
        
        # save in DB
        image = Images(user_id=current_user.id, addresss=file_url)
        db.session.add(image)
        db.session.commit()
        if form.mediapage.data == "false":
            form.mediapage.data = False
        
        if form.mediapage.data:
            return redirect(url_for('editor.media'))            
        else: 
            return jsonify({'url': file_url})
           
    user_files = Images.query.filter_by(user_id=current_user.id).all()
    return render_template('media.html', language=g.locale, form=form, files=user_files, deleteform=deleteform)

@bp.route('/export_data', methods=['POST'])
def exportdata():
    if request.method == 'POST':
        destination = request.form['destination']
        # save to Wordpress.com
        if destination == 'wp':  
            article_id = (request.form['article_id'])
            wpcom_id = (request.form['wpcom_id'])
            wpcom_address = (request.form['wpcom_address'])

            if int(article_id) > 0 :
                a =  Article.query.filter_by(id=article_id).first_or_404()
                # new article
                if a.wpcom_id is None:           
                    a.wpcom_address = wpcom_address
                    a.wpcom_id = wpcom_id
                    db.session.commit()
        elif destination == 'medium': 
            article_id = (request.form['article_id'])
            # publish on Medium
            acceskey = (request.form['acceskey'])
            # get the user id
            headers = {"Authorization": "Bearer "+acceskey, 
                       "Content-Type": "application/json", 
                       "Accept": "application/json",
                       "Accept-Charset": "utf-8"}
                
            x = requests.get('https://api.medium.com/v1/me', headers=headers)
            if x.status_code == 200 :
                x = x.json()
            else:
                return x.text, x.status_code
            
            keywords = request.form['keywords'].split(",")
            
            # post
            content = (request.form['article_content']).replace("https://mur2.co.uk/math/svg", "https://mur2.co.uk/math/png")
            postdata = { "title": (request.form['article_title']),
                        "contentFormat": "html",
                        "content": content,
                        "publishStatus": "draft",
                        "tags": keywords}
            post = requests.post('https://api.medium.com/v1/users/'+x['data']['id']+'/posts', json=postdata, headers=headers )
            
            if post.status_code == 201 :
                post = post.json()
                # save on Mur2 system
                if int(article_id) > 0 :
                    a =  Article.query.filter_by(id=article_id).first_or_404()
                    # new article
                    if a.medium_id is None:           
                        a.medium_address = post['data']['url']
                        a.medium_id = post['data']['id']
                        db.session.commit()
                
               
                return jsonify({"result":"OK", "link": post['data']['url']})  
            else:
                return post.text, post.status_code
                                    
        elif destination == 'pdf' or destination == 'latex' or  destination == "epub" or  destination == "msw": 
            # clear up tmp files
            #   do in cron ass it is troublesome to be sure it was transfared before deleteing  
            # read the data which was sent from the editor.js
            mdtxt = request.files['mdfile'].read()
            # some encoding 
            mdtxt = mdtxt.decode('utf-8')
            article_title = (request.form['article_title'])
            article_abstract = (request.form['article_abstract'])
            language = (request.form['language'])
            author = (request.form['author'])
            bibtex = (request.form['bib'])
            bibstyle = (request.form['bibsyle'])
            
            if destination == 'pdf':
                dirname, error = pdf_generation(article_title, author, language, article_abstract, mdtxt, bibtex=bibtex, bibstyle=bibstyle)
                if error is None:
                    return send_file(os.path.join(dirname, 'mur2.pdf'))
                else:
                    return send_file(error, attachment_filename='error.txt')

            
            elif destination == 'latex':                                     
                dirname, error = make_latex(mdtxt, article_title, article_abstract, 
                                            language, author, bibtex=bibtex, extractmedia=False)
                if error is None:         
                    return send_file(os.path.join(dirname, 'mur2.tex'))
                else:
                    return send_file(error, attachment_filename='error.txt')
            elif destination == "epub":                        
                dirname, error = epub_generation(article_title, author, language, article_abstract, mdtxt, bibtex=bibtex, bibstyle=bibstyle)           
                if error is None:
                    return send_file(os.path.join(dirname, 'mur2.epub'))
                else:
                    return send_file( error, attachment_filename='error.txt')
            elif destination == "msw":            
                dirname, error = msworld_generation(article_title, author, language, article_abstract, mdtxt, bibtex=bibtex, bibstyle=bibstyle)
            
                if error is None:
                    return send_file(os.path.join(dirname, 'mur2.docx'))
                else:
                    return send_file(error, attachment_filename='error.txt')
            
    # return a OK json 
    return jsonify(result="OK")
    
# Get version of the Article
@bp.route('/getarticleversions', methods=['POST'])
@login_required
def getarticleversions():
    form = ArticleVersion()
    data = {}
    # if -1 the version we get the current db value
    a = None
    if int(form.version.data) == -1:
        a = Article.query.filter_by(id=int(form.article.data)).first_or_404()
    else:
        a = ArticleArchive.query.filter_by(article_id=int(form.article.data)).filter_by(version=int(form.version.data)).first_or_404()
    data['title'] = a.title
    data['abstract'] = a.abstract
    data['main'] = a.markdown
    
    return jsonify(data)

# process Markdown in the mur2 server
@bp.route('/processmarkdown', methods=['POST'])
def processmarkdown():
    # markdown
    md = request.form.get('md')
    # bibtex
    bib = request.form.get('bib')
    # bibstyle
    bibsyle = request.form.get('bibsyle')
    # language
    language = request.form.get('language')
    # footnote on local language
    footnote = request.form.get('footnote')
    # save to file
    #   generate random string for dir
    dirname = make_tmpdirname()
    if not os.path.exists(dirname):
        os.mkdir(dirname)
    mdname = os.path.join(dirname,'raw.md')    
    # save to file
    with open(mdname, 'w') as f:
        demo = f.write(md)
    # bibtex
    # if there is None or just whitespace
    if bib == "None" or len(re.sub(r"\s+", "", bib, flags=re.UNICODE)) == 0:
        bibname = None
    else:
        bibname = os.path.join(dirname,'raw.bib')
        with open(bibname, 'w') as f:
            demo = f.write(bib)
    
    # send to nodejs server
    print({'filename': mdname, 'bibtex': bibname, 'bibsyle': bibsyle, 'language': language})
    x = requests.get("http://127.0.0.1:3000/", params={'filename': mdname, 'bibtex': bibname, 
                                                       'bibsyle': bibsyle, 'language': language,
                                                       'footnote': footnote})
    if x.status_code == 200 :
        # send back
        return send_file(os.path.join(dirname, 'processed.html'))
    else:
        print(x.text)
        return x.text, x.status_code
    
    