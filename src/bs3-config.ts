import sqlite3 = require('better-sqlite3');
import { Red } from 'node-red';
import { ISqliteConfigNode, ISqliteConfigNodeProperties } from './bs3-common';

export = (RED: Red) => {
    RED.nodes.registerType('sqlite-config', function (this: ISqliteConfigNode, props: ISqliteConfigNodeProperties) {
        RED.nodes.createNode(this, props);
        this.db = new sqlite3(props.filename);
        this.on('close', () => {
            this.db.close();
        });
    });
};
