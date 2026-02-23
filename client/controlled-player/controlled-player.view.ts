import {
    INotifyEvent,
    InputHandlerObject,
    IPlayerState,
    ISubject,
    PlayerEvent,
    PlayerEventType,
} from '@shared/types';
import { BasePlayerModel, BasePlayerView } from '@client/base-player';

export class ControlledPlayerView extends BasePlayerView {
    override update(subject: ISubject, event: INotifyEvent): void {
        super.update(subject, event);

        if (
            subject instanceof BasePlayerModel &&
            event instanceof PlayerEvent
        ) {
            switch (event.type) {
                case PlayerEventType.Delete:
                    this.onDelete();
                    break;
            }
        }
    }

    onDelete() {
        this.removeFocusByWindowClick();
    }

    override onGenerate(state: IPlayerState) {
        super.onGenerate(state);

        this.makeHole(state.color);
        this.setZIndex(100);
        this.addFocusByWindowClick();
    }
    private makeHole(color: string) {
        this.elem.removeAttribute('backgroundColor');
        this.elem.style.background = `radial-gradient(circle, transparent 0%, transparent 29%, ${color} 31%) rgba(0, 0, 0, 0)`;
    }
    private setZIndex(zIndex: number) {
        this.elem.style.zIndex = zIndex.toString();
    }

    private readonly playerFocusHandlerObject: InputHandlerObject = [
        'mouseup',
        () => this.elem.focus(),
    ];
    private addFocusByWindowClick() {
        addEventListener(...this.playerFocusHandlerObject);
    }
    private removeFocusByWindowClick() {
        removeEventListener(...this.playerFocusHandlerObject);
    }

    addInputHandler(handlerObj: InputHandlerObject) {
        this.elem.addEventListener(...handlerObj);
    }
    removeInputHandler(handlerObj: InputHandlerObject): void {
        this.elem.removeEventListener(...handlerObj);
    }
}
