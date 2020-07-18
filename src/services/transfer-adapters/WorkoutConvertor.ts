import { Workout } from 'fitness-models';

export interface WorkoutConvertor<BaseWorkout> {
    fromUniversal: (workout: Workout) => Promise<BaseWorkout>;
    toUniversal(workout: BaseWorkout): Promise<Workout>;
}
