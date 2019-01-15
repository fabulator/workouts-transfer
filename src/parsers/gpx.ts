// @ts-ignore
import xml2js from 'xml2js';
import { DateTime } from 'luxon';

const parser = new xml2js.Parser();

function parse(data: any): any {
    return new Promise((resolve, reject) => {
        parser.parseString(data, (err: any, result: any) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

type Point = {
    time: DateTime,
    latitude?: number,
    longitude?: number,
    altitude?: number,
    cadence?: number,
};

// @ts-ignore
export default async function gpx(data: string): Promise<Array<Point> | null> {
    const parsedData: any = await parse(data);
    return parsedData.gpx.trk[0].trkseg[0].trkpt.map((point: any) => {
        const cadence = point.extensions[0]['ns3:TrackPointExtension'][0]['ns3:cad'];

        return {
            time: DateTime.fromISO(point.time[0]),
            latitude: Number(point.$.lat),
            longitude: Number(point.$.lon),
            altitude: Number(point.ele[0]),
            cadence: cadence ? Number(cadence[0]) : undefined,
        };
    });
}
