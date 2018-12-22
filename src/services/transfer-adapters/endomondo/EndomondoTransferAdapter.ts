import { inject, injectable } from 'inversify';
import { Workout } from 'fitness-models';
import { ENDOMONDO } from 'fitness-libraries';
import { TransferAdapter } from '../TransferAdapter';
import EndomondoConvertor from './EndomondoConvertor';

@injectable()
export default class EndomondoTransferAdapter implements TransferAdapter {
    public constructor(
        @inject(ENDOMONDO.EndomondoService) protected endomondoService: ENDOMONDO.EndomondoService,
        @inject(EndomondoConvertor) protected endomondoConvertor: EndomondoConvertor,
    ) {}

    public async getWorkout(id: string) {
        return this.endomondoConvertor.toUniversal(await this.endomondoService.getWorkout(Number(id)));
    }

    public async findWorkout(workout: Workout) {
        const workouts = await this.endomondoService.getWorkouts({
            after: workout.getStart().minus({ minutes: 3 }),
            before: workout.getStart().plus({ minutes: 3 }),
            limit: 1,
        });

        if (workouts.length === 0) {
            return null;
        }

        return this.endomondoConvertor.toUniversal(workouts[0]);
    }

    public async createWorkout(workout: Workout) {
        const workoutId = await this.endomondoService.createWorkout(await this.endomondoConvertor.fromUniversal(workout));
        return workoutId.toString();
    }
}
