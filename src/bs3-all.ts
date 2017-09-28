import { Red } from 'node-red';
import makeNodeConstructor from './bs3-prepared';

export = (RED: Red) => {
    RED.nodes.registerType('bs3-all', makeNodeConstructor('all', RED));
};
