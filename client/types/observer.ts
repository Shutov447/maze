export interface IObserver {
    update: (subject: ISubject, event: INotifyEvent) => void;
}

export interface ISubject {
    attach: (observer: IObserver) => void;
    detach: (observer: IObserver) => void;
    notify: (eventType: INotifyEvent) => void;
}

export interface INotifyEvent {
    readonly type: any;
}
