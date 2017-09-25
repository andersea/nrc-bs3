import sqlite3 = require('better-sqlite3');
import { Node, Red } from 'node-red';
import { ISqliteConfigNode, ISqliteConfigNodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('better-sqlite3-config', function (this: ISqliteConfigNode, props: ISqliteConfigNodeProperties) {
        RED.nodes.createNode(this, props);
        this.db = new sqlite3(props.filename);
        this.on('close', () => {
            this.db.close();
        });
    });
};
