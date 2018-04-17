#!/usr/bin/env node

import { bin } from 'raml-generator/bin';
import { client } from './index';

bin(client, require('../package.json'), process.argv);
