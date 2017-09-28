import sqlite3 = require('better-sqlite3');
import { Node, NodeId, NodeProperties } from 'node-red';

export interface ISqliteConfigNode extends Node {
    db: sqlite3;
}

export interface ISqliteConfigNodeProperties extends NodeProperties {
    filename: string;
}

export interface IPreparedQueryNodeProperties extends NodeProperties {
    config: NodeId;
    query: string;
}

export interface IInsertNodeProperties extends NodeProperties {
    config: NodeId;
    create: boolean;
}

export function preparedStatementGuard(preparedStatementNode: Node, configNode: Node, props: IPreparedQueryNodeProperties){
    if (!configNode) {
        preparedStatementNode.error('Sqlite database not configured');
        return false;
    }
    if (!props.query) {
        preparedStatementNode.error('No query configured');
        return false;
    }
    return true;
}