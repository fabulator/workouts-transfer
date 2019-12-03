// @ts-ignore
import xml2js from 'xml2js';
import { DateTime } from 'luxon';

const parser = new xml2js.Parser();

function parse(data: any): any {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        parser.parseString(data, (err: any, result: any) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

interface Point {
    time: DateTime,
    latitude?: number,
    longitude?: number,
    altitude?: number,
    cadence?: number,
    hr?: number,
    temperature?: number,
}

const gpxExtension = 'gpxtpx:TrackPointExtension';
const trackExtension = 'ns3:TrackPointExtension';

function getCadence(point: any): number | undefined {
    const { extensions } = point;

    if (!extensions) {
        return undefined;
    }

    if (extensions[0][trackExtension] && extensions[0][trackExtension][0]['ns3:cad']) {
        return Number(point.extensions[0][trackExtension][0]['ns3:cad'][0]);
    }

    if (extensions[0][gpxExtension] && extensions[0]['gpxtpx:TrackPointExtension'][0]['gpxtpx:cad']) {
        return Number(point.extensions[0][gpxExtension][0]['gpxtpx:cad'][0]);
    }

    return undefined;
}

function getTemperature(point: any): number | undefined {
    const { extensions } = point;

    if (!extensions) {
        return undefined;
    }

    if (extensions[0][trackExtension] && extensions[0][trackExtension][0]['ns3:atemp']) {
        return Number(point.extensions[0][trackExtension][0]['ns3:atemp'][0]);
    }

    return undefined;
}

function getHr(point: any): number | undefined {
    const { extensions } = point;

    if (!extensions) {
        return undefined;
    }

    if (extensions[0][gpxExtension] && extensions[0][gpxExtension][0]['gpxtpx:hr']) {
        return Number(point.extensions[0][gpxExtension][0]['gpxtpx:hr'][0]);
    }

    if (extensions[0][trackExtension] && extensions[0][trackExtension][0]['ns3:hr']) {
        return Number(point.extensions[0][trackExtension][0]['ns3:hr'][0]);
    }

    return undefined;
}

// @ts-ignore
export default async function gpx(data: string): Promise<Point[] | null> {
    const parsedData: any = await parse(data);

    if (!parsedData.gpx.trk[0].trkseg[0].trkpt) {
        return null;
    }

    return parsedData.gpx.trk[0].trkseg[0].trkpt.map((point: any) => {
        return {
            time: DateTime.fromISO(point.time[0]),
            latitude: Number(point.$.lat),
            longitude: Number(point.$.lon),
            altitude: point.ele[0] ? Number(point.ele[0]) : undefined,
            cadence: getCadence(point),
            hr: getHr(point),
            temperature: getTemperature(point),
        };
    });
}
