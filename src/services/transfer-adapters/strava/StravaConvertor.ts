import { inject, injectable } from 'inversify';
import { Activity } from 'strava-api-handler';
import { DateTime } from 'luxon';
import { Workout, Point, WORKOUT_TYPES } from 'fitness-models';
import { STRAVA } from 'fitness-libraries';
import { WorkoutConvertor } from '../WorkoutConvertor';

@injectable()
export default class StravaConvertor implements WorkoutConvertor<Activity> {
    public constructor(
        @inject(STRAVA.StravaService) private stravaService: STRAVA.StravaService,
    ) {}

    private activityMap: { stravaId: string, id: WORKOUT_TYPES.WorkoutType }[] = [
        { stravaId: Activity.ACTIVITY_TYPES.RIDE, id: WORKOUT_TYPES.CYCLING_SPORT },
        { stravaId: Activity.ACTIVITY_TYPES.RUN, id: WORKOUT_TYPES.RUNNING },
    ];

    private async getUniversalPoints(activity: Activity<number>): Promise<Point[]> {
        const points = await this.stravaService.getActivityPoint(activity);
        return points.map((point) => {
            return new Point({
                time: DateTime.fromJSDate(point.time),
                latitude: point.lat,
                longitude: point.lon,
                cadence: point.cadence,
                hr: point.hr,
            });
        });
    }

    public async toUniversal(activity: Activity): Promise<Workout> {
        const type = this.activityMap.find(item => item.stravaId === activity.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${activity.getTypeId()}`);
        }

        const workout = new Workout({
            ...activity.toObject(),
            typeId: type.id,
        });

        const activityId = activity.getId();

        if (!activityId) {
            return workout;
        }

        const points = await this.getUniversalPoints(activity);

        if (points.length > 0) {
            return workout.setPoints(points);
        }

        return workout;
    }

    public async fromUniversal(workout: Workout): Promise<Activity> {
        const type = this.activityMap.find(item => item.id === workout.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${workout.getTypeId()}`);
        }

        return new Activity({
            ...workout.toObject(),
            typeId: type.stravaId,
            id: undefined,
            source: undefined,
        });
    }
}
