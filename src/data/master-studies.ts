import data from './master-studies.json';
export const MASTER_STUDIES=data.studies;
export type MasterStudy=typeof MASTER_STUDIES[number];
