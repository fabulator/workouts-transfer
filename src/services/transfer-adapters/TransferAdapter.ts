import { Workout } from 'fitness-models';

export interface TransferAdapter<NativeWorkout = any> {
    createWorkout: (workout: Workout) => Promise<string>;
    findUniversalWorkout: (workout: Workout) => Promise<Workout | null>;
    findWorkout: (workout: Workout) => Promise<NativeWorkout | null>;
    getWorkout: (id: string) => Promise<Workout>;
}
