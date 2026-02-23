export class Renderer {
    constructor(private readonly container: HTMLElement) {}

    addRenderable(renderable: Renderable) {
        renderable.addTo(this.container);
    }
    removeRenderable(renderable: Renderable) {
        renderable.deleteFrom(this.container);
    }
}
export class Renderable {
    constructor(private readonly target: IRenderable) {}

    addTo(container: HTMLElement) {
        this.target.renderTo(container);
    }
    deleteFrom(container: HTMLElement) {
        this.target.removeFrom(container);
    }
}
export interface IRenderable {
    renderTo(container: HTMLElement): void;
    removeFrom(container: HTMLElement): void;
}
