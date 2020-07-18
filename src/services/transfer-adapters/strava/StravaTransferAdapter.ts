import * as STRAVA from 'fitness-libraries/dist/modules/strava';
import { Workout } from 'fitness-models';
import { inject, injectable } from 'inversify';
import { Activity } from 'strava-api-handler';
import { TransferAdapter } from '../TransferAdapter';
import StravaConvertor from './StravaConvertor';

@injectable()
export default class StravaTransferAdapter implements TransferAdapter<Activity> {
    public constructor(
        @inject(STRAVA.StravaService) private stravaService: STRAVA.StravaService,
        @inject(StravaConvertor) private stravaConvertor: StravaConvertor,
    ) {}

    public async getWorkout(id: string): Promise<Workout> {
        const activity = await this.stravaService.getActivity(Number(id));
        return this.stravaConvertor.toUniversal(activity);
    }

    public async findWorkout(workout: Workout) {
        const activities = await this.stravaService.getActivities({
            before: workout.getStart().plus({ minutes: 3 }),
            after: workout.getStart().minus({ minutes: 3 }),
        });

        if (activities.length === 0) {
            return null;
        }

        return activities[0];
    }

    public async findUniversalWorkout(workout: Workout) {
        const foundWorkout = await this.findWorkout(workout);

        if (!foundWorkout) {
            return null;
        }

        return this.stravaConvertor.toUniversal(foundWorkout);
    }

    public async createWorkout(workout: Workout): Promise<string> {
        const activity = await this.stravaConvertor.fromUniversal(workout);

        const createdActivity = await this.stravaService.createActivity(
            activity,
            workout.getPoints().length === 0 ? undefined : workout.toGpx(),
        );

        return (createdActivity.getId() as number).toString();
    }
}
