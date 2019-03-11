import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { ENDOMONDO } from 'fitness-libraries';
import { unit } from 'mathjs';
import {
    Point as EndomondoPoint,
    Workout as EndomondoWorkout,
} from 'endomondo-api-handler';
import { Workout, Point } from 'fitness-models';
import { WorkoutConvertor } from '../WorkoutConvertor';
import gpx from '../../../parsers/gpx';

@injectable()
export default class EndomondoConvertor implements WorkoutConvertor<EndomondoWorkout> {
    public constructor(
        @inject(ENDOMONDO.EndomondoService) private endomondoService: ENDOMONDO.EndomondoService,
    ) {}

    protected pointToUniversal({
        time,
        latitude,
        longitude,
        altitude,
        cadence,
        hr,
    }: {
        time: DateTime,
        latitude?: number,
        longitude?: number,
        altitude?: number,
        cadence?: number,
        hr?: number,
    }): Point {
        return new Point({
            time,
            latitude,
            longitude,
            cadence,
            hr,
            ...(altitude ? { altitude: unit(altitude, 'm') } : {}),
        });
    }

    protected pointFromUniversal(point: Point): EndomondoPoint {
        return new EndomondoPoint(point.toObject());
    }

    public async toUniversal(workout: EndomondoWorkout): Promise<Workout> {
        const gpxPoints = await gpx(await this.endomondoService.api.getWorkoutGpx(workout.getId()));

        return new Workout({
            ...workout.toObject(),
            points: gpxPoints ? gpxPoints.map(point => this.pointToUniversal(point)) : [],
            notes: workout.getMessage(),
        });
    }

    public async fromUniversal(workout: Workout): Promise<EndomondoWorkout> {
        const typeId = workout.getTypeId();

        if (typeof typeId === 'string') {
            throw new TypeError('This should never happend.');
        }

        return new EndomondoWorkout({
            ...workout.toObject(),
            points: workout.getPoints().map((point: Point) => this.pointFromUniversal(point)),
            id: undefined,
            source: undefined,
            // @ts-ignore
            typeId,
            hashtags: [
                ...(workout.isRace ? ['race'] : []),
                ...(workout.isCommute ? ['work'] : []),
                ...workout.getHashtags(),
            ],
            message: workout.getNotes(),
        });
    }
}
