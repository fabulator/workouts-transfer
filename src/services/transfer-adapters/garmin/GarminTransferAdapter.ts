import { inject, injectable } from 'inversify';
import { Workout } from 'fitness-models';
import { GARMIN } from 'fitness-libraries';
import { Activity } from 'garmin-api-handler';
import { TransferAdapter } from '../TransferAdapter';
import GarminConvertor from './GarminConvertor';

@injectable()
export default class GarminTransferAdapter implements TransferAdapter {
    public constructor(
        @inject(GARMIN.GarminService) private garminService: GARMIN.GarminService,
        @inject(GarminConvertor) private garminConvertor: GarminConvertor,
    ) {}

    public async getWorkout(id: string): Promise<Workout> {
        const activity = await this.garminService.getActivity(Number(id));
        return this.garminConvertor.toUniversal(activity);
    }

    public async findWorkout(workout: Workout) {
        const activities = await this.garminService.getActivities({
            startDate: workout.getStart(),
            endDate: workout.getStart(),
            limit: 10,
        });

        const activity = activities.find((activity: Activity) => {
            return workout.getStart().minus({ minutes: 3 }) < activity.getStart()
                && workout.getStart().plus({ minutes: 3 }) > activity.getStart();
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

        return (
            await this.garminService.createActivity(
                activity,
                workout.getPoints().length === 0 ? undefined : workout.toGpx(),
            )
        ).getId().toString();
    }
}
