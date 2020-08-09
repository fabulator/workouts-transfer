import { Activity, ActivityType, IntradayResource } from 'fitbit-api-handler';
import * as FITBIT from 'fitness-libraries/dist/modules/fitbit';
import { Point, Workout, WorkoutType } from 'fitness-models';
import { inject, injectable } from 'inversify';
import { unit } from 'mathjs';
import tcx from '../../../parsers/tcx';
import { WorkoutConvertor } from '../WorkoutConvertor';

@injectable()
export default class FitbitConvertor implements WorkoutConvertor<Activity> {
    public constructor(@inject(FITBIT.FitbitService) private fitbitService: FITBIT.FitbitService) {}

    private activityMap: { fitbitId: ActivityType; id: WorkoutType }[] = [
        { fitbitId: ActivityType.BIKE, id: WorkoutType.CYCLING_SPORT },
        { fitbitId: ActivityType.RUNNING, id: WorkoutType.RUNNING },
        { fitbitId: ActivityType.FENCING, id: WorkoutType.FENCING },
        { fitbitId: ActivityType.WALKING, id: WorkoutType.WALKING },
        { fitbitId: ActivityType.SKATEBOARDING, id: WorkoutType.SKATEBOARDING },
        { fitbitId: ActivityType.YOGA, id: WorkoutType.YOGA },
        { fitbitId: ActivityType.SWIMMING, id: WorkoutType.SWIMMING },
        { fitbitId: ActivityType.WEIGHT_TRAINING, id: WorkoutType.WEIGHT_TRAINING },
        { fitbitId: ActivityType.CIRKUIT_TRAINING, id: WorkoutType.CIRKUIT_TRAINING },
        { fitbitId: 2050, id: WorkoutType.WEIGHT_TRAINING },
        { fitbitId: 3104, id: WorkoutType.CIRKUIT_TRAINING },
    ];

    private async getUniversalPoints(activityId: number): Promise<Point[]> {
        const tcxData = await this.fitbitService.getApi().getActivityTcx(activityId);
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
            throw new Error(`Cannot find type id ${activity.getTypeId()} of activity ${activity.getId()}`);
        }

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

        if (activity.getTypeId() === ActivityType.WALKING) {
            const distanceData = await this.fitbitService
                .getApi()
                .getIntradayData(IntradayResource.DISTANCE, activity.getStart(), activity.getEnd());
            return workout.setDistance(unit(distanceData.total, 'km'));
        }

        return workout;
    }

    public async fromUniversal(workout: Workout): Promise<Activity> {
        const type = this.activityMap.find((item) => item.id === workout.getTypeId());

        if (!type) {
            throw new Error(`Cannot find type id ${workout.getTypeId()}`);
        }

        return new Activity({
            ...workout.toObject(),
            typeId: type.fitbitId,
            id: undefined,
            source: undefined,
        });
    }
}
