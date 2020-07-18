import { ContainerModule, interfaces } from 'inversify';
import 'reflect-metadata';
import { EndomondoConvertor, EndomondoTransferAdapter } from './services/transfer-adapters/endomondo';
import { FitbitConvertor, FitbitTransferAdapter } from './services/transfer-adapters/fitbit';
import { GarminConvertor, GarminTransferAdapter } from './services/transfer-adapters/garmin';
import { StravaConvertor, StravaTransferAdapter } from './services/transfer-adapters/strava';

export const ADAPTERS = {
    GarminTransferAdapter,
    EndomondoTransferAdapter,
    FitbitTransferAdapter,
    StravaTransferAdapter,
};

export { default as WorkoutTransfer } from './services/WorkoutTransfer';

export default new ContainerModule((bind: interfaces.Bind) => {
    bind(GarminConvertor).toSelf();
    bind(EndomondoConvertor).toSelf();
    bind(FitbitConvertor).toSelf();
    bind(StravaConvertor).toSelf();

    bind(GarminTransferAdapter).toSelf();
    bind(EndomondoTransferAdapter).toSelf();
    bind(FitbitTransferAdapter).toSelf();
    bind(StravaTransferAdapter).toSelf();
});
