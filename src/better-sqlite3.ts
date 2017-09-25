import sqlite3 = require('better-sqlite3');
import { Node, NodeProperties, Red } from 'node-red';
import { ISqliteConfigNode, ISqliteNodeProperties } from './common';

export = (RED: Red) => {
    RED.nodes.registerType('better-sqlite3', function (this: Node, props: ISqliteNodeProperties) {
        RED.nodes.createNode(this, props);

        const configNode = RED.nodes.getNode(props.config) as ISqliteConfigNode;
        if (configNode && props.query) {
            const prepared = configNode.db.prepare(props.query);

            this.on('input', (msg: any) => {
                const bind: any[] = Array.isArray(msg.payload) ? msg.payload : [];
                try {
                    msg.payload = prepared.all(bind);
                } catch (error) {
                    this.error(error, msg);
                    this.send(null);
                }
            });
        } else {
            this.error('Sqlite database not configured');
        }
    });
};
