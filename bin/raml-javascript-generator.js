#!/usr/bin/env node

var bin = require('raml-generator/bin')
var generator = require('../')

bin(generator, require('../package.json'), process.argv)
