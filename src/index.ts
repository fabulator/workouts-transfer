import { ContainerModule, interfaces } from 'inversify';
import { GarminConvertor, GarminTransferAdapter } from './services/transfer-adapters/garmin';
import { EndomondoTransferAdapter, EndomondoConvertor } from './services/transfer-adapters/endomondo';
import { FitbitConvertor, FitbitTransferAdapter } from './services/transfer-adapters/fitbit';

export const ADAPTERS = {
    GarminTransferAdapter,
    EndomondoTransferAdapter,
    FitbitTransferAdapter,
};

export { default as WorkoutTransfer } from './services/WorkoutTransfer';

export default new ContainerModule(
    (bind: interfaces.Bind) => {
        bind(GarminConvertor).toSelf();
        bind(EndomondoConvertor).toSelf();
        bind(FitbitConvertor).toSelf();

        bind(GarminTransferAdapter).toSelf();
        bind(EndomondoTransferAdapter).toSelf();
        bind(FitbitTransferAdapter).toSelf();
    },
);
