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

    public async copyWorkout(id: string): Promise<string | null> {
        const workoutToCopy = await this.from.getWorkout(id);

        if (await this.to.findWorkout(workoutToCopy)) {
            return null;
        }

        return this.to.createWorkout(workoutToCopy);
    }
}
