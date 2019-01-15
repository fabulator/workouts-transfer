import { Workout } from 'fitness-models';

export interface TransferAdapter {
    getWorkout: (id: string) => Promise<Workout>,
    findUniversalWorkout: (workout: Workout) => Promise<Workout | null>,
    createWorkout: (workout: Workout) => Promise<string>,
}
