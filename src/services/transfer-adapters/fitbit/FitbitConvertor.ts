import { inject, injectable } from 'inversify';
import { Activity, ACTIVITY_TYPES, TYPES } from 'fitbit-api-handler';
import { unit } from 'mathjs';
import { Workout, Point, WORKOUT_TYPES } from 'fitness-models';
import { FITBIT } from 'fitness-libraries';
import { WorkoutConvertor } from '../WorkoutConvertor';
import tcx from '../../../parsers/tcx';

@injectable()
export default class FitbitConvertor implements WorkoutConvertor<Activity> {
    public constructor(
        @inject(FITBIT.FitbitService) private fitbitService: FITBIT.FitbitService,
    ) {}

    private activityMap: { fitbitId: TYPES.ActivityType, id: WORKOUT_TYPES.WorkoutType }[] = [
        { fitbitId: ACTIVITY_TYPES.BIKE, id: WORKOUT_TYPES.CYCLING_SPORT },
        { fitbitId: ACTIVITY_TYPES.RUNNING, id: WORKOUT_TYPES.RUNNING },
        { fitbitId: ACTIVITY_TYPES.FENCING, id: WORKOUT_TYPES.FENCING },
        { fitbitId: ACTIVITY_TYPES.WALKING, id: WORKOUT_TYPES.WALKING },
        { fitbitId: ACTIVITY_TYPES.SKATEBOARDING, id: WORKOUT_TYPES.SKATEBOARDING },
        { fitbitId: ACTIVITY_TYPES.YOGA, id: WORKOUT_TYPES.YOGA },
        { fitbitId: ACTIVITY_TYPES.SWIMMING, id: WORKOUT_TYPES.SWIMMING },
        { fitbitId: ACTIVITY_TYPES.WEIGHT_TRAINING, id: WORKOUT_TYPES.WEIGHT_TRAINING },
        { fitbitId: ACTIVITY_TYPES.CIRKUIT_TRAINING, id: WORKOUT_TYPES.CIRKUIT_TRAINING },
    ];

    private async getUniversalPoints(activityId: number): Promise<Point[]> {
        const tcxData = await this.fitbitService.getActivityTcx(activityId);
        const points = await tcx(tcxData);

        if (!points) {
            return [];
        }

        return points.map((point) => {
            const { altitude, distance } = point;

            return new Point({
                time: point.time,
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: altitude != null ? unit(altitude, 'm') : undefined,
                distance: distance != null ? unit(distance, 'm') : undefined,
                cadence: point.cadence,
                hr: point.hr,
            });
        });
    }

    public async toUniversal(activity: Activity): Promise<Workout> {
        const type = this.activityMap.find((item) => item.fitbitId === activity.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${activity.getTypeId()}`);
        }

        // @ts-ignore
        const workout = new Workout({
            ...activity.toObject(),
            typeId: type.id,
        });

        const activityId = activity.getId();

        if (!activityId) {
            return workout;
        }

        const points = await this.getUniversalPoints(activityId);

        if (points.length > 0) {
            return workout.setPoints(points);
        }

        if (activity.getTypeId() === ACTIVITY_TYPES.WALKING) {
            const distanceData = await this.fitbitService.getIntradayData(
                'distance',
                activity.getStart(),
                activity.getEnd(),
            );
            return workout.setDistance(unit(distanceData.total, 'km'));
        }

        return workout;
    }

    public async fromUniversal(workout: Workout): Promise<Activity> {
        const type = this.activityMap.find((item) => item.id === workout.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${workout.getTypeId()}`);
        }

        // @ts-ignore
        return new Activity({
            ...workout.toObject(),
            typeId: type.fitbitId,
            id: undefined,
            source: undefined,
        });
    }
}
