import { injectable, inject } from 'inversify';
import { Activity, TYPES } from 'garmin-api-handler';
import { unit } from 'mathjs';
import { Workout, WORKOUT_TYPES, Point } from 'fitness-models';
import { GARMIN } from 'fitness-libraries';
import gpxParser from '../../../parsers/gpx';
import { WorkoutConvertor } from '../WorkoutConvertor';

@injectable()
export default class GarminConvertor implements WorkoutConvertor<Activity> {
    public constructor(
        @inject(GARMIN.GarminService) private garminService: GARMIN.GarminService,
    ) {}

    protected activityMap: { garminName: TYPES.ActivityType, id: WORKOUT_TYPES.WorkoutType }[] = [
        { garminName: Activity.TYPE.RUNNING, id: WORKOUT_TYPES.RUNNING },
        { garminName: Activity.TYPE.CYCLING, id: WORKOUT_TYPES.CYCLING_SPORT },
        { garminName: Activity.TYPE.UNCATEGORIZED, id: WORKOUT_TYPES.OTHER },
        { garminName: Activity.TYPE.STRENGTH_TRAINING, id: WORKOUT_TYPES.CIRKUIT_TRAINING },
        { garminName: Activity.TYPE.STRENGTH_TRAINING, id: WORKOUT_TYPES.WEIGHT_TRAINING },
        { garminName: Activity.TYPE.WALKING, id: WORKOUT_TYPES.WALKING },
        { garminName: Activity.TYPE.SKATING, id: WORKOUT_TYPES.SKATEBOARDING },
        { garminName: Activity.TYPE.OTHER, id: WORKOUT_TYPES.FENCING },
        { garminName: Activity.TYPE.YOGA, id: WORKOUT_TYPES.YOGA },
        { garminName: Activity.TYPE.SWIMMING, id: WORKOUT_TYPES.SWIMMING },
    ];

    protected async getUniversalPoints(activityId: number): Promise<Point[]> {
        const gpxData = await this.garminService.getActivityGpx(activityId);

        if (!gpxData) {
            return [];
        }

        const points = await gpxParser(gpxData);

        if (!points) {
            return [];
        }

        return points.map((point) => {
            const { altitude } = point;

            return new Point({
                time: point.time,
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: altitude != null ? unit(altitude, 'm') : undefined,
                cadence: point.cadence,
                temperature: point.temperature ? unit(point.temperature, 'celsius') : undefined,
            });
        });
    }

    public async toUniversal(activity: Activity<number>): Promise<Workout> {
        const type = this.activityMap.find((item) => item.garminName === activity.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${activity.getTypeId()}`);
        }

        return new Workout({
            ...activity.toObject(),
            typeId: type.id,
            points: await this.getUniversalPoints(activity.getId()),
        });
    }

    public async fromUniversal(workout: Workout): Promise<Activity> {
        const type = this.activityMap.find((item) => item.id === workout.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${workout.getTypeId()}`);
        }

        const category = (() => {
            if (workout.isRace) {
                return 'race';
            }
            if (workout.isCommute) {
                return 'transportation';
            }
            return undefined;
        })();

        return new Activity({
            ...workout.toObject(),
            id: undefined,
            source: undefined,
            typeId: type.garminName,
            category,
        });
    }
}
