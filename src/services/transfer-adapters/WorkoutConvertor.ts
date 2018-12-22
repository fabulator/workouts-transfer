import { Workout } from 'fitness-models';

export interface WorkoutConvertor<BaseWorkout> {
    toUniversal(workout: BaseWorkout): Promise<Workout>,
    fromUniversal: (workout: Workout) => Promise<BaseWorkout>,
}
