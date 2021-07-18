import * as STRAVA from 'fitness-libraries/dist/modules/strava';
import { Point, Workout, WorkoutType } from 'fitness-models';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { unit } from 'mathjs';
import { Activity, ActivityType } from 'strava-api-handler';
import { WorkoutConvertor } from '../WorkoutConvertor';

@injectable()
export default class StravaConvertor implements WorkoutConvertor<Activity> {
    public constructor(@inject(STRAVA.StravaService) private stravaService: STRAVA.StravaService) {}

    private activityMap: { id: WorkoutType; stravaId: ActivityType }[] = [
        { stravaId: ActivityType.RIDE, id: WorkoutType.CYCLING_SPORT },
        { stravaId: ActivityType.RUN, id: WorkoutType.RUNNING },
        { stravaId: ActivityType.SWIM, id: WorkoutType.SWIMMING },
        { stravaId: ActivityType.WEIGHT_TRAINING, id: WorkoutType.WEIGHT_TRAINING },
        { stravaId: ActivityType.WALK, id: WorkoutType.WALKING },
        { stravaId: ActivityType.WORKUT, id: WorkoutType.CIRKUIT_TRAINING },
        { stravaId: ActivityType.YOGA, id: WorkoutType.YOGA },
    ];

    private async getUniversalPoints(activity: Activity<number>): Promise<Point[]> {
        if (!activity.getSource().upload_id) {
            return [];
        }

        const points = await this.stravaService.getActivityPoint(activity);
        return points.map((point) => {
            const { altitude, time, lat, lon, cadence, heartrate, temp } = point;
            return new Point({
                time: DateTime.fromJSDate(time),
                latitude: lat,
                longitude: lon,
                cadence,
                hr: heartrate,
                temperature: temp,
                ...(altitude != null ? { altitude: unit(altitude, 'm') } : {}),
            });
        });
    }

    public async toUniversal(activity: Activity): Promise<Workout> {
        const type = this.activityMap.find((item) => item.stravaId === activity.getTypeId());

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
        const type = this.activityMap.find((item) => item.id === workout.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${workout.getTypeId()}`);
        }

        const title = workout.getTitle();

        return new Activity({
            ...workout.toObject(),
            title: title || type.stravaId,
            typeId: type.stravaId,
            id: undefined,
            source: undefined,
        });
    }
}
