import { DateTime } from 'luxon';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import xml2js from 'xml2js';

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
    altitude?: number;
    cadence?: number;
    hr?: number;
    latitude?: number;
    longitude?: number;
    temperature?: number;
    time: DateTime;
}

const gpxExtension = 'gpxtpx:TrackPointExtension';
const trackExtension = 'ns3:TrackPointExtension';

function getCadence(point: any): number | undefined {
    const { extensions } = point;

    if (!extensions) {
        return;
    }

    if (extensions[0][trackExtension] && extensions[0][trackExtension][0]['ns3:cad']) {
        return Number(point.extensions[0][trackExtension][0]['ns3:cad'][0]);
    }

    if (extensions[0][gpxExtension] && extensions[0]['gpxtpx:TrackPointExtension'][0]['gpxtpx:cad']) {
        return Number(point.extensions[0][gpxExtension][0]['gpxtpx:cad'][0]);
    }
}

function getTemperature(point: any): number | undefined {
    const { extensions } = point;

    if (!extensions) {
        return;
    }

    if (extensions[0][trackExtension] && extensions[0][trackExtension][0]['ns3:atemp']) {
        return Number(point.extensions[0][trackExtension][0]['ns3:atemp'][0]);
    }
}

function getHr(point: any): number | undefined {
    const { extensions } = point;

    if (!extensions) {
        return;
    }

    if (extensions[0][gpxExtension] && extensions[0][gpxExtension][0]['gpxtpx:hr']) {
        return Number(point.extensions[0][gpxExtension][0]['gpxtpx:hr'][0]);
    }

    if (extensions[0][trackExtension] && extensions[0][trackExtension][0]['ns3:hr']) {
        return Number(point.extensions[0][trackExtension][0]['ns3:hr'][0]);
    }
}

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
            altitude: point.ele && point.ele[0] ? Number(point.ele[0]) : undefined,
            cadence: getCadence(point),
            hr: getHr(point),
            temperature: getTemperature(point),
        };
    });
}
