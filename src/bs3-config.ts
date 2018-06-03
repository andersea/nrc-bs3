import sqlite3 = require('better-sqlite3');
import { Red } from 'node-red';
import { resolve } from 'path';

import { ISqliteConfigNode, ISqliteConfigNodeProperties } from './bs3-common';

export = (RED: Red) => {
    RED.nodes.registerType('sqlite-config', function (this: ISqliteConfigNode, props: ISqliteConfigNodeProperties) {
        RED.nodes.createNode(this, props);
        try {
            this.db = new sqlite3(props.filename, {
                memory: props.memory
            });            
        } catch (error) {
            if(error.code === "SQLITE_CANTOPEN") {
                 this.error(`${error.name}: ${error.message} ${resolve(props.filename)}`);
                 return;
            }
            throw error;
        }
        this.on('close', () => {
            this.db.close();
        });
    });
};
