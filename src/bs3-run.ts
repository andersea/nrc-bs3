import { Red } from 'node-red';
import makeNodeConstructor from './bs3-prepared';

export = (RED: Red) => {
    RED.nodes.registerType('sqlite-run', makeNodeConstructor('run', RED));
};
