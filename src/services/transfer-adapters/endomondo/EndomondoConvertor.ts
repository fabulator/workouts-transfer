import { injectable } from 'inversify';
import {
    Point as EndomondoPoint,
    Workout as EndomondoWorkout,
} from 'endomondo-api-handler';
import { Workout, Point } from 'fitness-models';
import { WorkoutConvertor } from '../WorkoutConvertor';

@injectable()
export default class EndomondoConvertor implements WorkoutConvertor<EndomondoWorkout> {
    protected pointToUniversal(point: EndomondoPoint): Point {
        return new Point(point.toObject());
    }

    protected pointFromUniversal(point: Point): EndomondoPoint {
        return new EndomondoPoint(point.toObject());
    }

    public async toUniversal(workout: EndomondoWorkout): Promise<Workout> {
        return new Workout({
            ...workout.toObject(),
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
