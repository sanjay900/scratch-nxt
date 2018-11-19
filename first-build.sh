#!/bin/bash
if [ $CIRCLE_BRANCH == $SOURCE_BRANCH ]; then
    git config --global user.email $GH_EMAIL
    git config --global user.name $GH_NAME

    git clone $CIRCLE_REPOSITORY_URL out

    echo $CIRCLE_REPOSITORY_URL

    cd out
    git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
    git rm -rf .
    cd ..
    cd scratch-vm
    npm install
    npm link
    #npm run watch
    cd ../scratch-gui
    npm install
    npm link scratch-vm
    npm build
    cd ..
    cp -a scratch-gui/build/. out/.

    mkdir -p out/.circleci && cp -a .circleci/. out/.circleci/.
    cd out

    git add -A
    git commit -m "Automated deployment to GitHub Pages: ${CIRCLE_SHA1}" --allow-empty

    git push origin $TARGET_BRANCH
fi
