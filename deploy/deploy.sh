#!/bin/bash

# manual deploy script
# does not use service account

# NOTE: keys are retrievable and are placed in JS, so their security is not of top importance
openssl aes-256-cbc -pbkdf2 -iter 100000 -d -k $CI_SECRET -in keys-stg.enc -out keys-stg.dec
mv keys-stg.dec ../src/settings/keys.ts

cd ..
yarn build
cd deploy
mkdir ../www
mv ../dist/* ../www/
mv ../www ../dist/
cp moverwebapp.yaml ../dist/
cd ../dist
gcloud app deploy --project mcmannaman-208313 moverwebapp.yaml
