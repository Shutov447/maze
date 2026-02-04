import { setControllerPrefix } from '@server/shared/utils';

export const Controller =
    (prefix = ''): ClassDecorator =>
    (target) => {
        setControllerPrefix(target, prefix);
    };
