export interface IRenderer {
    getContainer(): HTMLElement;
}

export interface IRenderable {
    renderTo(container: HTMLElement): void;
}
