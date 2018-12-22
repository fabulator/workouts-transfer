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
    distance?: number,
    hr?: number,
    cadence?: number,
};

async function tcx(data: any): Promise<Array<Point> | null> {
    const parsedData: any = await parse(data);
    if (!parsedData.TrainingCenterDatabase.Activities[0].Activity[0].Lap) {
        return null;
    }

    return parsedData.TrainingCenterDatabase.Activities[0].Activity[0].Lap[0].Track[0].Trackpoint.map((point: any) => {
        return {
            time: DateTime.fromISO(point.Time[0]),
            latitude: point.Position ? Number(point.Position[0].LatitudeDegrees[0]) : undefined,
            longitude: point.Position ? Number(point.Position[0].LongitudeDegrees[0]) : undefined,
            altitude: point.AltitudeMeters ? Number(point.AltitudeMeters[0]) : undefined,
            distance: point.DistanceMeters ? Number(point.DistanceMeters[0]) : undefined,
            hr: point.HeartRateBpm ? Number(point.HeartRateBpm[0].Value[0]) : undefined,
            cadence: point.Cadence ? Number(point.Cadence[0]) : undefined,
        };
    });
}

export default tcx;
