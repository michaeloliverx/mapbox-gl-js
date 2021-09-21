// @flow
import {albers, alaska} from './albers.js';
import mercator from './mercator.js';
import wgs84 from './wgs84.js';
import winkel from './winkelTripel.js';
import LngLat from '../lng_lat.js';
import type {ProjectionSpecification} from '../../style-spec/types.js';

export type Projection = {
    name: string,
    center: Array<number>,
    parallels?: Array<number>,
    range?: Array<number>,
    project: (lng: number, lat: number) => {x: number, y: number},
    unproject: (x: number, y: number) => LngLat
};

const projections = {
    albers,
    alaska,
    mercator,
    wgs84,
    winkel
};

export function getProjection(config: ProjectionSpecification) {
    return {...projections[config.name], ...config};
}

export function getProjectionOptions(config?: ProjectionSpecification | string) {
    if (typeof config === 'string' || !config) config = {name: config || 'mercator'};
    return config;
}
