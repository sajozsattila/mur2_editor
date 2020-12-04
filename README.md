# μr² digital publishing platform

This project aims to provide a digital publishing platform for long-form journalists and academic writers. 

We have created a platform that is easy to use while making the creation of online content simple and efficient. It can then be exported in various popular formats. 

## The μr² editor

A key part of any publishing platform is the editor. It needs to be easy to use and versatile yet comprehensive enough to allow for creative writing. The μr² Javascript-based Markdown editor does exactly this.

### Why Markdown?
Markdown uses a plain text formatting syntax aimed at making writing easier. The philosophy behind it; a document should be readable without tags everywhere but still be able to add text modifiers such as lists, bold text and italics quickly. It's an alternative to WYSIWYG (what you see is what you get) editors.^[Like Microsoft Word, Apple’s Pages or Google Docs]

Here’s a quick example of how to emphasize words with Markdown, you simply enclose them in * (asterisks). So, \*emphasize word* would look like *emphasize word* in the final document.

Reasons to try Markdown:

+ It's very simple to learn; the syntax is so simple one can barely call it "_syntax_"
+ It’s fast; the simple formatting saves a significant amount of time over an ordinary word processor or "WYSIWYG" editor.
+ It’s portable; your documents are cross-platform by nature. You can edit them in any text-capable application and on any operating system. Transporting files requires no zip compression or archiving, and the file size is already as small as it can possibly be.

We also help if you are new to markdown or can't remember any of the syntaxes. You can use the toolbar controls within the editor or open up the Markdown cheatsheet in the menu.

### Why Javascript?
There is usually a tradeoff between security and usability with two general approaches:

+ The data in digital publications are stored on a remote server and delivered over the internet via a web browser. Is this secure? At μr² we say that it isn't and we are not just referring to 'man-in-the-middle' attacks. If your provider goes offline, all of your work will be lost. It is useable?  Yes, you can access your data from anywhere with an internet connection.
+ Download and install the platform locally. It is secure? Yes, it is definitely more secure than the previous option, however, you need to install the platform on every device.

Using Javascript helps μr² to better answer these questions. The editor can only be accessed via HTTPS (secure communication over a computer network) from anywhere with an internet connection, so you do not need to install anything. However, the big difference is that your work is stored locally.

### Academic writing
We aim to support academic quality writing which is a huge task that very few publication platforms offer.  We support LaTeX type mathematical input, footnotes, crossreference and equation numbering to name a few.

### Publishing

Your work is finished and it's time to publish. At the moment you are definitely reading one of the published versions of this document. Probably the [original post](https://mur2.co.uk/reader/96), or on [WordPress ](https://sajozsattila.home.blog/2020/07/30/%ce%bcr%c2%b2-digital-publishing-platform/) or [Medium ](https://medium.com/@attilazsoltsajo/%CE%BCr%C2%B2-digital-publishing-platform-6df608c2dbe) republishing. In μr² you can post directly onto these platforms. Maybe you want to publish in an Academic Journal and need LaTeX?^[Lot of Academic Journals are happy to receive your paper in LaTeX. You can see a selection of them [here](https://fr.overleaf.com/latex/templates/tagged/academic-journal). ]  All of these methods are as easy as creating a [PDF](https://mur2.co.uk//_uploads/photos/pdf/96.pdf) or an [ePUB](https://mur2.co.uk/_uploads/photos/epub/96.epub): one-click.


### Self online publishing 

Your work is finished but you don't have to place to publish it. At μr² we have a free to use [webpage](https://mur2.co.uk) where work can publish and we also provide extra features for registered users. 

### The μr² browser

Writings do not exist independently they are all connected. One writing can share the same topic or inspire another. The μr² project has developed a new kind of browser experience. [Our browser](https://mur2.co.uk/discovery) uses a graph representation of Articles which are published on the μr² platform which enables users to visualise the relationship between different writings, topics and publishers, and navigate between them by simply double-clicking on them.

### Access you work from anywhere

We have explained the benefits of the μr² Javascript editor but what if you want to edit work from a different device. If you register on [mur2.co.uk](https://mur2.co.uk/auth/register) you can save your document online and access it from any web browser capable device. ^[You will still keep a copy of your document locally in your browser, also.]

# Start
```
cd /Mur2/Python/Frontend
nohup flask run --host=0.0.0.0 --port=8081 &
```

# Basic Flask app and login
It is based on [Miguel Grinberg -- The Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-iv-database)

# Search engine
The implementation based on 

It is using Elasticsearch engine, which need to install and start as a service on the inux box:
``` bash
sudo apt install apt-transport-https
sudo apt install openjdk-8-jdk
# install the repository
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo sh -c 'echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list'
# install the app
sudo apt update
sudo apt install elasticsearch
# start the app
sudo systemctl enable elasticsearch.service
sudo systemctl start elasticsearch.service
# test
curl -X GET "localhost:9200/"
```

## Python example

``` python
from elasticsearch import Elasticsearch
# connect
es = Elasticsearch('http://localhost:9200')
# first test doc
es.index(index='my_index', id=1, body={'text': 'this is a test'})
# second test doc
es.index(index='my_index', id=2, body={'text': 'a second test'})
# search example
es.search(index='my_index', body={'query': {'match': {'text': 'this test'}}})
```

## Flask
Do not forget to start the search engine on the Linux box before applying this.

We need to add ```__searchable__``` to the model.py to the column which we want to search
``` python
class Article(SearchableMixin, db.Model):
     markdown = db.Column(db.String(500))
    __searchable__ = ['markdown']
```



# DB

## DB iniciale
``` bash
export FLASK_APP=mur2.py
flask db init
```

This create a DB in the ``` ./migrations ``` directory, where is the configuration file is the: ```./migrations/alembic.ini```.

Next step to create the tables:
```
python
```
And in the Python:
``` python
from app import db
db.create_all()
exit()
```

## DB update
The DB table defination in the models.py. If we change this we need to update the DB. For this need to run the bellow commands:
 
```
flask db migrate -m "add article.neo4jid"
flask db upgrade
```
Or:

``` bash
python mur2.py db stamp head
python mur2.py db migrate
python mur2.py db upgrade
```

## SQLite

The db actually is the `app.db` file. There is a command line tools to acces the DB.

```
$ sqlite3

SQLite version 3.22.0 2018-01-22 18:45:57
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.

sqlite> .open app.db

sqlite> .tables
alembic_version     article             user                writerrelationship

sqlite> .schema writerrelationship
CREATE TABLE writerrelationship (
        id INTEGER NOT NULL,
        confirmed BOOLEAN,
        password VARCHAR(40),
        neo4jid INTEGER,
        article_id INTEGER,
        writer_id INTEGER,
        PRIMARY KEY (id),
        FOREIGN KEY(article_id) REFERENCES article (id),
        FOREIGN KEY(writer_id) REFERENCES user (id),
        CHECK (confirmed IN (0, 1))
);

sqlite> .exit 0
```

# Neo4j

Two Neo4j db is used: one from the fornedn and one from the Open Acces Articles.  

Both of them based on the same docker images, but mount different directories for the system.

## Update

Just update the docker, do not forget to download the "apoc" plugin, which is matching with the DB version. 

## Full text search

The neo4j have an effective build in full text search engine. For details see: [documentation](https://neo4j.com/docs/cypher-manual/current/administration/indexes-for-full-text-search/)

### define and index
```
CALL db.index.fulltext.createNodeIndex("titlesAndAbstract",["Article"],["Title", "Abstract"])
```

### search

```
CALL db.index.fulltext.queryNodes("titlesAndAbstract", "chrystal-orientation fabric") YIELD node, score
RETURN node.Abstract, node.Title, score;
```

### DB cleanup
Deduplicate Keywords
```
MATCH (k:Keyword) WITH tolower(trim(k.Name)) as kname, count(k) as knum, collect(id(k)) as kid WHERE knum > 1 
WITH kid, kname LIMIT 1000
WITH kid, kname
MATCH (k:Keyword)--(a:Article) WHERE id(k) in kid
WITH kname, kid, collect(id(a)) as aid
CREATE (k:Keyword {Name: kname})
WITH k, kid, aid
UNWIND(aid) as aaid
WITH aaid, k, kid
MATCH (a:Article) WHERE Id(a) = aaid
MERGE p=(k)-[r:keyword]->(a)
WITH kid,p,k
MATCH (kk:Keyword) WHERE id(kk) in kid
DETACH DELETE kk
RETURN count(k)
```

"None" keyword
```
MATCH (k:Keyword) WHERE k.Name = "None" DETACH DELETE k;
MATCH (K:Keyword) where K.Name = "" DETACH DELETE K;
```

Articles without Doi. Most of time they have in reality DOI, just some reason we do not harvested, so need to set manually.
```
MATCH (a:Article) WHERE a.DOI = "" RETURN a
```

# SSH cert

https://certbot.eff.org/lets-encrypt/ubuntufocal-other


Need to set the firewall also, the normal port forwarding is 80->8081 and 443->8443. this need to set to 80->80 and 443->443.

After:
``` bash 
cd /Mur2/Git/Frontend
docker stop mur2_frontend mur2_redirect
sudo certbot certonly --standalone 
sudo cp /etc/letsencrypt/live/mur2.co.uk/privkey.pem key.pem
sudo cp /etc/letsencrypt/live/mur2.co.uk/fullchain.pem cert.pem
docker start mur2_frontend mur2_redirect
```

Do not forgot you need to build a new Convergence docker also with the new keys:

```
cp /Mur2/Git/Frontend/key.pem /Mur2/Git/Convergence/Source/
cp /Mur2/Git/Frontend/cert.pem /Mur2/Git/Convergence/Source/
cd /Mur2/Git/Convergence
bash build.sh
cd /Mur2/Mur2_builder
docker-compose stop conv && docker-compose rm conv && docker-compose up -d conv
```


# Internation language support
doc: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-xiii-i18n-and-l10n

Babel commands.

Inicial a translateion:
``` bash
# extract all the texts to the .pot file
pybabel extract -F babel.cfg -k _l -o messages.pot .

# make translation 
pybabel init -i messages.pot -d app/translations -l hu

# edit the translateion
vi app/translations/hu/LC_MESSAGES/messages.po

#  start using these translated texts
pybabel compile -d app/translations
```

Update a translateion
``` bash
pybabel extract -F babel.cfg -k _l -o messages.pot .
pybabel update -i messages.pot -d app/translations
```

# ML

To make more Memory available for the ML scripts:

Free up memory buffer:
```
 free -h && sudo sysctl -w vm.drop_caches=3 && sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches && free -h
 ```
 
 More aggressive swapping. Default 60, which mean it is starting swaping if less than 60% of the memmory left free.
 ```
 cat /proc/sys/vm/swappiness
 sudo bash -c "echo 'vm.swappiness = 95' >> /etc/sysctl.conf"
 sudo sysctl -p
 cat /proc/sys/vm/swappiness
 ```