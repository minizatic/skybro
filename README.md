Skybro
======

##Installation

###Linux or OSX

Install Meteor:

```
curl https://install.meteor.com | /bin/sh
```

Download and unzip the repo:

```
curl -L -o master.zip https://github.com/minizatic/skybro/archive/master.zip

unzip master.zip

cd skybro-master
```
Install meteorite and dependencies:

```
npm install -g meteorite

mrt install
```

Run!:

```
mrt run
```

###Windows

Meteor isn't officially supported on Windows, but it's not impossible to get it running.

##Features
1. Single-page (Browse the whole blog without ever loading a new page)
2. Real-time (Changes anyone makes will show up everywhere instantly)
3. WYSIWYG Editing (Create posts in rich text without having to know HTML or Markdown)
4. Real-time searching (Search for posts containing a word or phrase without touching any buttons)
5. Tag searching (Click on a tag to find all posts with that tag. You can also select multiple tags)