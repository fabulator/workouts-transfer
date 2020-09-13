import * as FITBIT from 'fitness-libraries/dist/modules/fitbit';
import { Workout } from 'fitness-models';
import { inject, injectable } from 'inversify';
import { TransferAdapter } from '../TransferAdapter';
import FitbitConvertor from './FitbitConvertor';

@injectable()
export default class FitbitTransferAdapter implements TransferAdapter {
    public constructor(
        @inject(FITBIT.FitbitService) private fitbitService: FITBIT.FitbitService,
        @inject(FitbitConvertor) private fitbitConvertor: FitbitConvertor,
    ) {}

    public async getWorkout(id: string): Promise<Workout> {
        const activity = await this.fitbitService.getApi().getActivity(Number(id));
        return this.fitbitConvertor.toUniversal(activity);
    }

    public async findWorkout(workout: Workout) {
        const response = await this.fitbitService.getApi().getActivities({
            afterDate: workout.getStart().minus({ minutes: 1 }),
            limit: 1,
        });

        if (response.activities.length === 0) {
            return null;
        }

        const activity = response.activities[0];

        if (activity.getStart() < workout.getStart().plus({ minutes: 1 })) {
            return activity;
        }

        return null;
    }

    public async findUniversalWorkout(workout: Workout) {
        const foundWorkout = await this.findWorkout(workout);

        if (!foundWorkout) {
            return null;
        }

        return this.fitbitConvertor.toUniversal(foundWorkout);
    }

    public async createWorkout(workout: Workout): Promise<string> {
        const activity = await this.fitbitConvertor.fromUniversal(workout);
        const createdActivity = await this.fitbitService.getApi().logActivity(activity);
        return `${createdActivity.getId()}`;
    }
}
