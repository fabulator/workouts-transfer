import { inject, injectable } from 'inversify';
import { Workout } from 'fitness-models';
import { STRAVA } from 'fitness-libraries';
import { TransferAdapter } from '../TransferAdapter';
import StravaConvertor from './StravaConvertor';

@injectable()
export default class StravaTransferAdapter implements TransferAdapter {
    public constructor(
        @inject(STRAVA.StravaService) private stravaService: STRAVA.StravaService,
        @inject(StravaConvertor) private stravaConvertor: StravaConvertor,
    ) {}

    public async getWorkout(id: string): Promise<Workout> {
        const activity = await this.stravaService.getActivity(Number(id));
        return this.stravaConvertor.toUniversal(activity);
    }

    public async findWorkout(workout: Workout): Promise<Workout | null> {
        const activities = await this.stravaService.getActivities({
            before: workout.getStart().minus({ minutes: 3 }),
            after: workout.getStart().plus({ minutes: 3 }),
        });

        if (activities.length === 0) {
            return null;
        }

        return activities[0];
    }

    public async createWorkout(workout: Workout): Promise<string> {
        const activity = await this.stravaConvertor.fromUniversal(workout);

        // @ts-ignore
        return (
            await this.stravaService.createActivity(
                activity,
                workout.getPoints().length === 0 ? undefined : workout.toGpx(),
            )
        ).getId().toString();
    }
}
