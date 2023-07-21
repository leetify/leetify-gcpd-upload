import { EventName } from './enums';

export interface RuntimeMessage {
	event: EventName;
	data: Record<string, any>;
}

export const isRuntimeMessage = (v: any): v is RuntimeMessage => typeof v === 'object'
	&& v.hasOwnProperty('event')
	&& typeof v.event === 'string'
	&& Object.values(EventName).includes(v.event)
	&& v.hasOwnProperty('data')
	&& typeof v === 'object'
	&& !Array.isArray(v);

export interface GcpdMatch {
	timestamp: string;
	url: string;
}

export interface ParseSteamGcpdResponseResponse {
	cells: number;
	matches: GcpdMatch[];
}
