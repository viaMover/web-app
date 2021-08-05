#!/bin/bash
# NOTE: keys are retrievable and are placed in JS, so their security is not of top importance
#openssl aes-256-cbc -pbkdf2 -iter 100000 -k $CI_SECRET -in keys-stg.ts -out keys-stg.enc
openssl aes-256-cbc -pbkdf2 -iter 100000 -k $CI_SECRET -in deploykey-stg.json -out deploykey-stg.enc