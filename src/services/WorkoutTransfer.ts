import { Workout } from 'fitness-models';
import { injectable } from 'inversify';
import { TransferAdapter } from './transfer-adapters/TransferAdapter';

@injectable()
export default class WorkoutTransfer {
    private from: TransferAdapter;

    private to: TransferAdapter;

    public constructor(from: TransferAdapter, to: TransferAdapter) {
        this.from = from;
        this.to = to;
    }

    public getFrom() {
        return this.from;
    }

    public getTo() {
        return this.to;
    }

    public async copyWorkout(id: string, extender?: (workout: Workout) => Promise<Workout>): Promise<string | null> {
        const workoutToCopy = await this.from.getWorkout(id);

        if (await this.to.findUniversalWorkout(workoutToCopy)) {
            return null;
        }

        const enhacedWorkout = extender ? await extender(workoutToCopy) : workoutToCopy;

        return this.to.createWorkout(enhacedWorkout);
    }
}
