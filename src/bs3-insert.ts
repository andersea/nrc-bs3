import sqlite = require('better-sqlite3');
import { Node, Red } from 'node-red';

import { IInsertNodeProperties, ISqliteConfigNode } from './bs3-common';

import isNumeric = require('fast-isnumeric');

interface IInsertMessage {
    topic?: string;
    payload: IPayload;
}

interface IPayload {
    [key: string]: any;
}

interface IInserters {
    [tableName: string]: (payload: IPayload) => any;
}

function tableExists(tableName: string, db: sqlite) {
    const statement = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name=?`);
    statement.pluck(true);
    return statement.get(tableName) ? true : false;
}

function createTable(tableName: string, payload: IPayload, db: sqlite) {
    const fieldDefs = Object.keys(payload).map(key => {
        const test = payload[key];
        if (key === 'id') {
            return key + ' INTEGER PRIMARY KEY';
        }
        if (isNumeric(payload[key])) {
            const n = +payload[key];
            if (Number.isInteger(n)) {
                return key + ' INTEGER';
            }
            return key + ' REAL';
        }
        return key + ' TEXT';
    }).join(',');
    db.exec(`CREATE TABLE ${tableName} (${fieldDefs})`);
}

function makeTableInserter(tableName: string, payloadKeys: string[], db: sqlite) {
    const statement = db.prepare(
        `INSERT INTO ${tableName} ("${payloadKeys.join('","')}") VALUES (:${payloadKeys.join(',:')})`);

    return (payload: IPayload) => {
        return statement.run(payload);
    }
}

export = (RED: Red) => {
    RED.nodes.registerType('sqlite-insert', function (this: Node, props: IInsertNodeProperties) {
        RED.nodes.createNode(this, props);

        const configNode = RED.nodes.getNode(props.config) as ISqliteConfigNode;
        if (!(configNode && configNode.db)) {
            return this.error('Sqlite database not configured');
        }
        const inserter: IInserters = {};
        this.on('input', (msg: IInsertMessage) => {
            const tableName = props.table || msg.topic;
            if (!tableName) {
                return this.error('No table name: Table was not set in node properties and incoming message has no topic field.')
            }
            if (!msg.payload) {
                return this.error('No values to insert.')
            }
            try {
                if (!inserter[tableName]) {
                    if (!tableExists(tableName, configNode.db) && props.create) {
                        createTable(tableName, msg.payload, configNode.db);
                    }
                    inserter[tableName] = makeTableInserter(tableName, Object.keys(msg.payload), configNode.db);
                }
                msg.payload = inserter[tableName](msg.payload);
                this.send(msg);
            } catch (error) {
                this.error(error, msg)
                this.send(null);
            }
        });
    });
};
