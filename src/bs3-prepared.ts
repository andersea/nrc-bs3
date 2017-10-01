import { Node, Red } from 'node-red';
import { IPreparedQueryNodeProperties, ISqliteConfigNode } from './bs3-common';

export type methods = 'all' | 'run';

function mustReturnData(method: methods) {
    switch (method) {
        case 'all': return true;
        case 'run': return false;
    }
}

export default function (method: methods, RED: Red) {
    return function (this: Node, props: IPreparedQueryNodeProperties) {
        RED.nodes.createNode(this, props);

        const configNode = RED.nodes.getNode(props.config) as ISqliteConfigNode;
        if (!(configNode && configNode.db)) {
            return this.error('Sqlite database not configured');
        }
        if (!props.query) {
            return this.error('No query configured');
        }
        const prepared = configNode.db.prepare(props.query);
        let noParamsExpected: boolean;

        if (prepared.returnsData === mustReturnData(method)) {
            this.on('input', (msg: any) => {
                try {
                    msg.payload = noParamsExpected ? prepared[method]() : prepared[method](msg.payload);
                    this.send(msg);
                } catch (error) {
                    if (error.message === "Too many parameter values were provided") {
                        try {
                            msg.payload = prepared[method]();
                            noParamsExpected = true;
                            this.send(msg);
                        } catch (error) {
                            this.error(error, msg);
                            this.send(null);
                        }
                    } else {
                        this.error(error, msg);
                        this.send(null);
                    }
                }
            });
        } else {
            mustReturnData(method) ?
                this.error('Query must return data.') :
                this.error('Query must not return data.');
        }
    }
}