import * as GARMIN from 'fitness-libraries/dist/modules/garmin';
import { Point, Workout, WorkoutType } from 'fitness-models';
import { Activity, ActivityType, Category } from 'garmin-api-handler';
import { inject, injectable } from 'inversify';
import { unit } from 'mathjs';
import gpxParser from '../../../parsers/gpx';
import { WorkoutConvertor } from '../WorkoutConvertor';

@injectable()
export default class GarminConvertor implements WorkoutConvertor<Activity> {
    public constructor(@inject(GARMIN.GarminService) private garminService: GARMIN.GarminService) {}

    protected activityMap: { garminName: ActivityType; id: WorkoutType }[] = [
        { garminName: ActivityType.MOUNTAIN_BIKING, id: WorkoutType.CYCLING_SPORT },
        { garminName: ActivityType.RUNNING, id: WorkoutType.RUNNING },
        { garminName: ActivityType.CYCLING, id: WorkoutType.CYCLING_SPORT },
        { garminName: ActivityType.UNCATEGORIZED, id: WorkoutType.OTHER },
        { garminName: ActivityType.FITNESS_EQUIPMENT, id: WorkoutType.CIRKUIT_TRAINING },
        { garminName: ActivityType.STRENGTH_TRAINING, id: WorkoutType.WEIGHT_TRAINING },
        { garminName: ActivityType.WALKING, id: WorkoutType.WALKING },
        { garminName: ActivityType.OTHER, id: WorkoutType.SKATEBOARDING },
        { garminName: ActivityType.OTHER, id: WorkoutType.FENCING },
        { garminName: ActivityType.YOGA, id: WorkoutType.YOGA },
        { garminName: ActivityType.SWIMMING, id: WorkoutType.SWIMMING },
    ];

    protected async getUniversalPoints(activityId: number): Promise<Point[]> {
        const gpxData = await this.garminService.getApi().getActivityGpx(activityId);

        if (!gpxData) {
            return [];
        }

        const points = await gpxParser(gpxData);

        if (!points) {
            return [];
        }

        return points.map((point) => {
            const { altitude, time, latitude, longitude, temperature, cadence, hr } = point;

            return new Point({
                time,
                latitude,
                longitude,
                altitude: altitude != null ? unit(altitude, 'm') : undefined,
                cadence,
                temperature: temperature ? unit(temperature, 'celsius') : undefined,
                hr,
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
                return Category.RACE;
            }
            if (workout.isCommute) {
                return Category.TRANSPORTATION;
            }
        })();

        return new Activity({
            ...workout.toObject(),
            id: undefined,
            source: undefined,
            typeId: type.garminName,
            category,
            notes: type.garminName === ActivityType.OTHER ? workout.getTypeName() : '',
        });
    }
}
