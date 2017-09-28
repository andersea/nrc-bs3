import { Node, Red } from 'node-red';
import { IInsertNodeProperties, ISqliteConfigNode } from './bs3-common';

function tableExists(name: string, configNode: ISqliteConfigNode) {
    const statement = configNode.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name=?`);
    statement.pluck(true);
    return statement.get(name) ? true : false;
}

function makeColumnNameSql(payload: object) {
    return Object.keys(payload).join(',');
}

function makeColumnParamSql(payload: object) {
    return Object.keys(payload).map(key => ':' + key).join(',');
}

function makeTableInserter(msg: any, configNode: ISqliteConfigNode) {
    const statement = configNode.db.prepare(`INSERT INTO ${msg.topic} (${makeColumnNameSql(msg.payload)})
    VALUES (${makeColumnParamSql(msg.payload)})`)
    return (payload: object) => {
        return statement.run(payload);
    }
}

function createTable(msg: any, configNode: ISqliteConfigNode) {
    const tableName: string = msg.topic;
    const fieldDefs = Object.keys(msg.payload).reduce((defs: any, key: string) => {
        if (key === 'id') {
            return defs[key] = key + ' INTEGER PRIMARY KEY';
        }
        if (Number.isInteger(msg.payload[key])) {
            return defs[key] = key + ' INTEGER';
        }
        if (Number.isNaN) {
            return defs[key] = key + ' TEXT';
        }
        return defs[key] = key + ' REAL';
    }, {});
    configNode.db.exec(`CREATE TABLE ${tableName} (${Object.values(fieldDefs).join(',')})`);
}

export = (RED: Red) => {
    RED.nodes.registerType('bs3-insert', function (this: Node, props: IInsertNodeProperties) {
        RED.nodes.createNode(this, props);

        const configNode = RED.nodes.getNode(props.config) as ISqliteConfigNode;
        if (!configNode) {
            return this.error('Sqlite database not configured');
        }
        let inserter: any;
        this.on('input', (msg) => {
            if (!msg.payload) {
                return this.error('No values to insert.')
            }
            try {
                if (!inserter) {
                    if (!msg.topic) {
                        return this.error('msg.topic must be set in auto mode.');
                    }
                    if (!tableExists(msg.topic, configNode) && props.create) {
                        createTable(msg, configNode);
                    }
                    inserter = makeTableInserter(msg, configNode);
                }
                msg.payload = inserter(msg.payload);
                this.send(msg);
            } catch (error) {
                this.error(error, msg)
                this.send(null);
            }
        });
    });    
};
