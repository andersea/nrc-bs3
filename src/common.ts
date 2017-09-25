import sqlite3 = require('better-sqlite3');
import { Node, NodeId, NodeProperties } from 'node-red';

export interface ISqliteConfigNode extends Node {
    db: sqlite3;
}

export interface ISqliteConfigNodeProperties extends NodeProperties {
    filename: string;
}

export interface ISqliteNodeProperties extends NodeProperties {
    config: NodeId;
    query: string;
}