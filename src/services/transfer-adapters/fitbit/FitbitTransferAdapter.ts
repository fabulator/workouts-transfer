import { inject, injectable } from 'inversify';
import { FITBIT } from 'fitness-libraries';
import { Workout } from 'fitness-models';
import { TransferAdapter } from '../TransferAdapter';
import FitbitConvertor from './FitbitConvertor';

@injectable()
export default class FitbitTransferAdapter implements TransferAdapter {
    public constructor(
        @inject(FITBIT.FitbitService) private fitbitService: FITBIT.FitbitService,
        @inject(FitbitConvertor) private fitbitConvertor: FitbitConvertor,
    ) {}

    public async getWorkout(id: string): Promise<Workout> {
        const activity = await this.fitbitService.getActivity(Number(id));
        return this.fitbitConvertor.toUniversal(activity);
    }

    public async findWorkout(workout: Workout): Promise<Workout | null> {
        const activities = await this.fitbitService.getActivities({
            afterDate: workout.getStart().minus({ minutes: 1 }),
            limit: 1,
        });

        if (activities.length === 0) {
            return null;
        }

        const activity = activities[0];

        if (activity.getStart().plus({ minutes: 1 }) > workout.getStart()) {
            return null;
        }

        return this.fitbitConvertor.toUniversal(activity);
    }

    public async createWorkout(workout: Workout): Promise<string> {
        const activity = await this.fitbitConvertor.fromUniversal(workout);
        const createdActivity = await this.fitbitService.createActivity(activity);
        // @ts-ignore
        return createdActivity.getId();
    }
}
