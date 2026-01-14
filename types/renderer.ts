export interface IRenderer {
    getContainer(): HTMLElement;
}

export interface IRenderable {
    addTo(container: HTMLElement): void;
}
