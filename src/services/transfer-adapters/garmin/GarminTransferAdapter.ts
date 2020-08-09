import * as GARMIN from 'fitness-libraries/dist/modules/garmin';
import { Workout } from 'fitness-models';
import { Activity } from 'garmin-api-handler';
import { inject, injectable } from 'inversify';
import { TransferAdapter } from '../TransferAdapter';
import GarminConvertor from './GarminConvertor';

@injectable()
export default class GarminTransferAdapter implements TransferAdapter {
    public constructor(
        @inject(GARMIN.GarminService) private garminService: GARMIN.GarminService,
        @inject(GarminConvertor) private garminConvertor: GarminConvertor,
    ) {}

    public async getWorkout(id: string): Promise<Workout> {
        const activity = await this.garminService.getApi().getActivity(Number(id));
        return this.garminConvertor.toUniversal(activity);
    }

    public async findWorkout(workout: Workout) {
        const activities = await this.garminService.getApi().getActivities({
            startDate: workout.getStart(),
            endDate: workout.getStart(),
            limit: 10,
        });

        const activity = activities.find((foundActivity: Activity) => {
            return (
                workout.getStart().minus({ minutes: 3 }) < foundActivity.getStart() &&
                workout.getStart().plus({ minutes: 3 }) > foundActivity.getStart()
            );
        });

        if (activity) {
            return activity;
        }

        return null;
    }

    public async findUniversalWorkout(workout: Workout) {
        const foundWorkout = await this.findWorkout(workout);

        if (!foundWorkout) {
            return null;
        }

        return this.garminConvertor.toUniversal(foundWorkout);
    }

    public async createWorkout(workout: Workout): Promise<string> {
        const activity = await this.garminConvertor.fromUniversal(workout);

        const gpx = workout.getPoints().length === 0 ? undefined : workout.toGpx();

        const createdActivity = await (async () => {
            if (!gpx) {
                return this.garminService.createActivity(activity);
            }
            return this.garminService.createActivity(activity, 'gpx', gpx);
        })();

        return createdActivity.getId().toString();
    }
}
