#!/bin/bash
# NOTE: keys are retrievable and are placed in JS, so their security is not of top importance
openssl aes-256-cbc -pbkdf2 -iter 100000 -d -k $CI_SECRET -in keys-stg.enc -out keys-stg.dec