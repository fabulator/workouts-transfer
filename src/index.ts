import { ContainerModule, interfaces } from 'inversify';
import 'reflect-metadata';
import { FitbitConvertor, FitbitTransferAdapter } from './services/transfer-adapters/fitbit';
import { GarminConvertor, GarminTransferAdapter } from './services/transfer-adapters/garmin';
import { StravaConvertor, StravaTransferAdapter } from './services/transfer-adapters/strava';

export const ADAPTERS = {
    GarminTransferAdapter,
    FitbitTransferAdapter,
    StravaTransferAdapter,
};

export const CONVERTORS = {
    GarminConvertor,
    FitbitConvertor,
    StravaConvertor,
};

export { default as WorkoutTransfer } from './services/WorkoutTransfer';

export default new ContainerModule((bind: interfaces.Bind) => {
    bind(GarminConvertor).toSelf();
    bind(FitbitConvertor).toSelf();
    bind(StravaConvertor).toSelf();

    bind(GarminTransferAdapter).toSelf();
    bind(FitbitTransferAdapter).toSelf();
    bind(StravaTransferAdapter).toSelf();
});
