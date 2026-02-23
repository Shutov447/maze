export interface IMediator<MSender, MEvent> {
    send(sender: MSender, event: MEvent): void;
}

type Constructor<T = {}> = new (...args: any[]) => T;
export function MediatorComponentMixin<MCSender, MCEvent>() {
    return function <TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            protected mediator?: IMediator<MCSender, MCEvent>;

            setMediator(mediator: IMediator<MCSender, MCEvent>): void {
                this.mediator = mediator;
            }
        };
    };
}
