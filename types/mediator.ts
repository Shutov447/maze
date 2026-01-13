export class MediatorComponent<MCSender, MCEvent> {
    constructor(protected mediator?: IMediator<MCSender, MCEvent>) {}

    setMediator(mediator: IMediator<MCSender, MCEvent>) {
        this.mediator = mediator;
    }
}

export interface IMediator<MSender, MEvent> {
    send(sender: MSender, event: MEvent): void;
}
