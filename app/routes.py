"""
The RestAPI addresses
"""

from flask import render_template, current_app
# errors
from flask import abort
from app import app

# the databse types
from app.models import User, Article, WriterRelationship

# recordin last user logging
import datetime
from app.forms import SearchForm
from flask import g
from flask_babel import get_locale
@app.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.datetime.utcnow()
        db.session.commit()
        g.search_form = SearchForm() # for search
    g.locale = str(get_locale()) # for international languages

# logo page
@app.route('/')
def root():
    return render_template("root.html", title='Home Page')

# login
from flask import render_template, flash, redirect, url_for, request
from werkzeug.urls import url_parse
from app.forms import LoginForm
from flask_login import current_user, login_user
from app.models import User
@app.route('/login', methods=['GET', 'POST'])
def login():
    # if user is already login do not let to go to login 
    if current_user.is_authenticated:
        return redirect(url_for('user', username=current_user.username))
    
    form = LoginForm()
    # test the input data
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()

        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        # if there is no next page redirect to index
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@app.route('/index')
def index():
    return redirect(url_for('user', username=current_user.username))

# logout
from flask_login import logout_user
@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('root'))

# register
from app import db
from app.forms import RegistrationForm
# import os
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('user'))
    form = RegistrationForm()
    if form.validate_on_submit():
        # save data in the frontend
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        # get the save user data 
        user = User.query.filter_by(username=form.username.data).first_or_404()
        
        # create directory for the user for uploading data like images
        # os.makedirs('/static/images/'+user.username)
        
        # finish
        flash('Congratulations, you are now a registered user!')
        
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

# user home page
from flask_login import login_required
@app.route('/user/<username>')
@login_required
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    # we need to set up in the add_columns the data in the templates
    articles =   Article.query.order_by(Article.timestamp.desc()).join( WriterRelationship ).join(User).filter(User.id == current_user.id ).add_columns(  Article.id, Article.title,  Article.abstract, Article.status )
    return render_template('user.html', user=user, articles=articles)

# markdown editor
from app.models import Article
from flask import Markup
@app.route('/edit/<articleid>')
@login_required
def editor(articleid):
    article = Article(title="", abstract='', markdown='', html="")
    # if it is not a new article
    if int(articleid) != -1:
        # articleRelation = writerrelationship.query.filter_by(article_id=articleid).all()
        articleRelation =   Article.query.filter_by(id=articleid).join( WriterRelationship ).join(User).add_columns( User.id ).all()
        # check writer have got right to edit 
        canEdit = False
        for ar in articleRelation:
            if ar.id == current_user.id:
                canEdit = True
                break
        if not canEdit:
            abort(401)
        article = Article.query.filter_by(id=articleid).first()
    
        # Article not in editing status we redirect to reading
        if article.status != 'editing':
            flash('You can not edit this article')
            return redirect(url_for('reader', article_id=article.id) )
    
    return render_template('editor.html', 
                           article_markdown=Markup(article.markdown.encode('unicode_escape').decode('utf-8').replace("'", "\\\'")),
                           article_title = Markup(article.title.encode('unicode_escape').decode('utf-8').replace("'", "\\\'")),
                           article_abstract=Markup(article.abstract.encode('unicode_escape').decode('utf-8').replace("'", "\\\'"))
                           , article_id = articleid)

# markdown editor without login
@app.route('/editor', methods=['GET', 'POST'])
def free_editor():
    article = Article(title="", abstract='', markdown='', html="")
    return render_template('editor.html', 
                           article_markdown=Markup(article.markdown.encode('unicode_escape').decode('utf-8').replace("'", "\\\'")),
                           article_title = Markup(article.title.encode('unicode_escape').decode('utf-8').replace("'", "\\\'")),
                           article_abstract=Markup(article.abstract.encode('unicode_escape').decode('utf-8').replace("'", "\\\'"))
                           , article_id = -2)


# save markdown for article
from flask import Flask, jsonify
from app import db
# to make the html code from the markdown
import markdown
import markdown.extensions.fenced_code
@app.route('/markdownsave', methods=['POST'])
@login_required
def markdownsave():
    # read the data which was sent from the editor.js
    markdowntxt = request.files['file'].read()
    htmltxt = request.files['htmlfile'].read()

    # some encoding 
    # markdowntxt = markdowntxt[2:-1].encode('utf-8').decode('unicode_escape')    
    # htmltxt = htmltxt[2:-1].encode('utf-8').decode('unicode_escape')
    markdowntxt = markdowntxt.decode('utf-8')
    htmltxt = htmltxt.decode('utf-8')


    article_id = int((request.form['article_id']))        
    article_title = (request.form['article_title'])
    article_abstract = (request.form['article_abstract'])  
    
    
    # save the data 
    #   new Article
    if article_id == -1:
        # check the Article do not exist
        # a = Article.query.filter_by(title=article_title).filter_by(abstract=article_abstract).filter_by(version=0).first()
        a = Article.query.filter_by(title=article_title).filter_by(abstract=article_abstract).join(WriterRelationship).filter(WriterRelationship.writer_id == current_user.id).first()
        if a is not None:
            # we should return something more meaningfull ???
            abort(401)
           
        # create new Artilce
        a = Article(title=article_title, abstract=article_abstract, markdown=markdowntxt, html=htmltxt, status="editing")        
        db.session.add(a)
        # get the new object id
        db.session.flush()         
        # save in DB
        db.session.commit()                
        
        # get the user also
        user = User.query.filter_by(id=current_user.id).first_or_404()
        
        # add Writerrelationship
        w = WriterRelationship(article_id=a.id, 
                               writer_id= current_user.id)
        db.session.add(w)
        db.session.commit()

            
        
        
    else:
        a = Article.query.filter_by(id=article_id).first_or_404()
        
        if a.status is not None and a.status != 'editing':
            raise RuntimeError("The  Article status is not 'edited'! ")
        elif a.status is None:
            a.status = 'editing'
        
        # update if somethings changed
        change = False
        if a.title != article_title:
            change = True
            a.title = article_title
        if a.html != htmltxt:
            change = True
            a.html = htmltxt
        if a.abstract != article_abstract:
            change = True
            a.abstract = article_abstract
        if a.markdown != markdowntxt:
            change = True
            a.markdown = markdowntxt

        # if anything changed
        if change:
            db.session.commit()
    
    # return a OK json 
    flash("Your changes have been saved.")
    return jsonify(result="OK")
    

# reading an article
# there the Author of the ARticle can set publishing relationship
# the journal editor can confirm this on the Journal page
from flask import Markup
@app.route('/reader/<article_id>')
def reader(article_id):
    a = Article.query.filter_by(id=article_id).join( WriterRelationship ).join(User).add_columns(  Article.html, Article.title,  Article.abstract, Article.status, Article.id, (User.id).label("uid"), User.username, WriterRelationship.confirmed ).first_or_404()
    return render_template('read.html', article_content=Markup(a.html), 
                           title=a.title, author=a.username, article=a )


# requesting reseting the password
from app.forms import ResetPasswordRequestForm
from app.email import send_password_reset_email
@app.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = ResetPasswordRequestForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            send_password_reset_email(user)
        flash('Check your email for the instructions to reset your password')
        return redirect(url_for('login'))
    return render_template('reset_password_request.html',
                           title='Reset Password', form=form)

from app.forms import ResetPasswordForm

# reseting the password
@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    user = User.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('index'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash('Your password has been reset.')
        return redirect(url_for('login'))
    return render_template('reset_password.html', form=form)

# editing the profile
from app.forms import EditProfileForm
@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.about_me = form.about_me.data
        db.session.commit()
        flash('Your changes have been saved.')
        return redirect(url_for('edit_profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    return render_template('edit_profile.html', title='Edit Profile',
                           form=form)


@app.route('/search')
@login_required
def search():
    if not g.search_form.validate():
        return redirect(url_for('index'))
    page = request.args.get('page', 1, type=int)
    posts, total = Article.search(g.search_form.q.data, page,
                               current_app.config['ARTICLE_PER_PAGE'])
    next_url = url_for('search', q=g.search_form.q.data, page=page + 1) \
        if total > page * current_app.config['ARTICLE_PER_PAGE'] else None
    prev_url = url_for('search', q=g.search_form.q.data, page=page - 1) \
        if page > 1 else None
    return render_template('search.html', title='Search', posts=posts,
                           next_url=next_url, prev_url=prev_url)


# export the data to other formats
import requests
import datetime
import json
import re
import string
import random
import os
# for pandoc
import subprocess
from subprocess import Popen, PIPE
from subprocess import check_output
def run_os_command(command):
    stdout = check_output(command).decode('utf-8')
    return stdout
def  make_pandoc_md(mdtxt, endnote):
            # make some change on the markdown to work with pandoc
            # change $$ if it is in line
            mdtxt = mdtxt.replace('$$', '$' )
            
            return mdtxt
@app.route('/export_data', methods=['POST'])
def exportdata():
    if request.method == 'POST':
        destination = request.form['destination']
        # save to Wordpress.com
        if destination == 'wp':    
            # read the data which was sent from the editor.js
            htmltxt = request.files['htmlfile'].read()
            # some encoding 
            htmltxt = htmltxt.decode('utf-8')
            # replace the local images addres to Mur2 addresses
            htmltxt = re.sub('<img src="/','<img src="'+current_app.config['SELF_ADDRESS']+'/',htmltxt)
            
            article_title = (request.form['article_title'])
            article_abstract = (request.form['article_abstract']) 
            article_id = (request.form['article_id'])
            # wpc settings
            wpc_username = request.form['wpc_username']
            wpc_password = request.form['wpc_password']
            wpc_home = request.form['wpc_home']
            
            # save to Wordpress.com
            s = requests.Session()
            # authentication    
            s = requests.Session()
            authaddress = "https://public-api.wordpress.com/oauth2/token"
            authentication = {
                'client_id': current_app.config['APP_WORDPRESSCOM_ID'],
                'client_secret': current_app.config['APP_WORDPRESSCOM_PASSWORD'],
                'grant_type': 'password',
                'username': wpc_username,
                'password': wpc_password 
            }
            r = s.post(authaddress, authentication)
            
            if r.status_code < 200 and r.status_code > 299:
                if 'error_description' in msg.keys():
                    return json.loads(r.content)['error_description'], r.status_code
                else:
                    print(json.loads(r.content))
                    return "unknow error", r.status_code
                
            access_token = json.loads(r.content)['access_token']

            # publish the Article
            # https://developer.wordpress.org/rest-api/reference/posts/#create-a-post
            wprestapiurl = "https://public-api.wordpress.com/wp/v2/sites/"
            url = wprestapiurl+wpc_home
            post = {'date': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                    'title': article_title,
                    'status': 'private',
                    'content': htmltxt,
                    'excerpt': article_abstract,
                    'format': 'standard'
                   }
            headers = {'Authorization': 'Bearer ' + access_token}
            
            # check it is a new article or we aready published
            if article_id != "-2" :
                a =  Article.query.filter_by(id=article_id).first_or_404()
                if a.wpcom_id is None:           
                    print("uj")
                    # new article
                    r = s.post(url + '/posts', headers=headers, json=post)

                    # update DB
                    print(json.loads(r.content))
                    a.wpcom_id = json.loads(r.content)['id']
                    db.session.commit()
                else:
                    # new article
                    print("update")
                    r = s.post(url + '/posts/'+str(a.wpcom_id), headers=headers, json=post)
            else:
                # publish withour login
                r = s.post(url + '/posts', headers=headers, json=post)
                print(r.status_code)
                if r.status_code >= 200 and r.status_code <= 299:
                    return jsonify({"result":"OK", "address": json.loads(r.content)['link']})  
                else:
                    msg = json.loads(r.content)
                    if 'error_description' in msg.keys():
                        return msg['error_description'], r.status_code
                    elif "message" in msg.keys():
                        return msg['message'], r.status_code
                    else:
                        print(json.loads(r.content))
                        return "unknow error", r.status_code
        elif destination == 'pdf': 
            # read the data which was sent from the editor.js
            mdtxt = request.files['mdfile'].read()
            # some encoding 
            mdtxt = mdtxt.decode('utf-8')
            article_title = (request.form['article_title'])
            article_abstract = (request.form['article_abstract']) 
            endnotetext = (request.form['endnotetext']) 

            article_abstract = make_pandoc_md(article_abstract, endnotetext)
            mdtxt = make_pandoc_md(mdtxt, endnotetext)
            # save to file
            #  # generate random string for dir
            letters = string.ascii_letters
            dirname = '/tmp/mur2_export_'+''.join(random.choice(letters) for i in range(16))+'/'
            os.mkdir(dirname)
            mdname = dirname+'pdf.md'
            file = open(mdname, 'w')
            file.write(mdtxt)
            file.close()
            

            # make latex
            result = run_os_command(['/usr/bin/pandoc', mdname, '-f', 'markdown', '-t',  'latex', '-s', '-o', dirname+'test.tex'])
            # open latex file
            file = open(dirname+'test.tex', "r") 
            latexfile = file.read() 
            file.close()
            
            # download images
            
            
            
            print(result)
            
    # return a OK json 
    return jsonify(result="OK")            
            
# Upload files
from flask_uploads import configure_uploads, patch_request_class
# DB local DB to know what file for which user
from app.models import Images
import os
from app.forms import UploadForm, photos
# configuration the Flask-upload
configure_uploads(app, photos)
@app.route('/media', methods=['GET', 'POST'])
@login_required
def media():
    form = UploadForm()
    if request.method == 'POST':
        filename = photos.save(form.photo.data, folder=current_user.username )
        file_url = photos.url(filename)
        
        # save in DB
        image = Images(user_id=current_user.id, addresss=file_url)
        db.session.add(image)
        db.session.commit()
        
        return redirect(url_for('media'))
    user_files = Images.query.filter_by(user_id=current_user.id).all()
    return render_template('media.html', form=form, files=user_files)