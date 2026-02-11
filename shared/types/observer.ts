export interface IObserver {
    update: (subject: ISubject, event: INotifyEvent, data?: any) => void;
}

export interface ISubject {
    attach: (observer: IObserver) => void;
    detach: (observer: IObserver) => void;
    notify: (eventType: INotifyEvent, data?: any) => void;
}

export interface INotifyEvent {
    readonly type: unknown;
}
